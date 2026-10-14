"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { salvarRascunhoAction } from "@/lib/actions/respostas";
import type { Rascunho, RespostasMapa } from "@/lib/types";

/**
 * Rascunho do preenchimento em duas camadas:
 * - banco (formularios_rascunhos): o snapshot oficial, vale em qualquer
 *   dispositivo;
 * - localStorage: reserva imediata para queda de internet e F5 antes do
 *   debounce. Nunca é a fonte da verdade — se o navegador bloquear o
 *   armazenamento, tudo segue só com o servidor.
 */

export type StatusSalvamento = "salvo" | "salvando" | "pendente" | "offline" | "erro";

const DEBOUNCE_MS = 1000;
const RETRY_MAX_MS = 30_000;
const PREFIXO = "rascunho:";
const VALIDADE_LOCAL_MS = 30 * 24 * 60 * 60 * 1000;

interface RascunhoLocal {
  respostas: RespostasMapa;
  secaoAtual: number;
  /** Versão do servidor sobre a qual estas alterações foram feitas. */
  versao: number;
  /** true = tem alteração que ainda não chegou ao servidor. */
  pendente: boolean;
  salvoLocalEm: number;
}

function lerLocal(chave: string): RascunhoLocal | undefined {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as RascunhoLocal) : undefined;
  } catch {
    return undefined;
  }
}

function gravarLocal(chave: string, valor: Omit<RascunhoLocal, "salvoLocalEm">) {
  try {
    window.localStorage.setItem(chave, JSON.stringify({ ...valor, salvoLocalEm: Date.now() }));
  } catch {
    // Armazenamento bloqueado ou cheio — o servidor continua cobrindo.
  }
}

function removerLocal(chave: string) {
  try {
    window.localStorage.removeItem(chave);
  } catch {}
}

function limparRascunhosAntigos() {
  try {
    const agora = Date.now();
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const chave = window.localStorage.key(i);
      if (!chave?.startsWith(PREFIXO)) continue;
      const item = lerLocal(chave);
      if (!item || agora - (item.salvoLocalEm ?? 0) > VALIDADE_LOCAL_MS) removerLocal(chave);
    }
  } catch {}
}

export function useRascunho({
  formularioId,
  atribuicaoId,
  rascunhoServidor,
}: {
  formularioId: string;
  atribuicaoId: string;
  rascunhoServidor?: Rascunho;
}) {
  const chave = `${PREFIXO}${atribuicaoId}`;

  const [respostas, setRespostas] = useState<RespostasMapa>(rascunhoServidor?.respostas ?? {});
  const [secaoAtual, setSecaoAtual] = useState(rascunhoServidor?.secaoAtual ?? 0);
  const [status, setStatus] = useState<StatusSalvamento>("salvo");
  const [ultimoSalvoEm, setUltimoSalvoEm] = useState<Date | undefined>(
    rascunhoServidor ? new Date(rascunhoServidor.atualizadoEm) : undefined
  );
  /** Só depois de comparar com o localStorage o estado é definitivo. */
  const [pronto, setPronto] = useState(false);

  const respostasRef = useRef(respostas);
  const secaoRef = useRef(secaoAtual);
  const versaoRef = useRef(rascunhoServidor?.versao ?? 0);
  const sujoRef = useRef(false);
  const emVooRef = useRef(false);
  const descartadoRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tentativasRef = useRef(0);
  const flushRef = useRef<() => Promise<void>>(async () => {});

  const persistirLocal = useCallback(() => {
    gravarLocal(chave, {
      respostas: respostasRef.current,
      secaoAtual: secaoRef.current,
      versao: versaoRef.current,
      pendente: sujoRef.current,
    });
  }, [chave]);

  const agendar = useCallback((ms = DEBOUNCE_MS) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flushRef.current(), ms);
  }, []);

  const flush = useCallback(async () => {
    clearTimeout(timerRef.current);
    if (descartadoRef.current || !sujoRef.current || emVooRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("offline");
      return;
    }

    emVooRef.current = true;
    sujoRef.current = false;
    setStatus("salvando");
    try {
      const resultado = await salvarRascunhoAction(formularioId, {
        respostas: respostasRef.current,
        secaoAtual: secaoRef.current,
        versao: versaoRef.current,
      });
      tentativasRef.current = 0;

      if (!resultado.ok && "erro" in resultado) {
        setStatus("erro");
        toast.error("Não foi possível salvar o rascunho", { description: resultado.erro });
        return;
      }
      if (!resultado.ok) {
        // Outra aba/dispositivo salvou antes: adota o estado do servidor.
        sujoRef.current = false;
        respostasRef.current = resultado.rascunho.respostas;
        secaoRef.current = resultado.rascunho.secaoAtual;
        setRespostas(resultado.rascunho.respostas);
        setSecaoAtual(resultado.rascunho.secaoAtual);
        toast.warning("Este formulário foi alterado em outra aba ou dispositivo", {
          description: "Carregamos a versão mais recente salva.",
        });
      }
      versaoRef.current = resultado.rascunho.versao;
      setUltimoSalvoEm(new Date(resultado.rascunho.atualizadoEm));
      setStatus(sujoRef.current ? "pendente" : "salvo");
      persistirLocal();
    } catch {
      // Falha de rede: mantém como pendente e tenta de novo com backoff.
      sujoRef.current = true;
      tentativasRef.current += 1;
      setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "pendente");
      agendar(Math.min(RETRY_MAX_MS, 2000 * 2 ** (tentativasRef.current - 1)));
    } finally {
      emVooRef.current = false;
      if (sujoRef.current && tentativasRef.current === 0) agendar();
    }
  }, [formularioId, persistirLocal, agendar]);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  // Na montagem: decide entre localStorage e servidor e limpa lixo antigo.
  useEffect(() => {
    limparRascunhosAntigos();
    const local = lerLocal(chave);
    const versaoServidor = rascunhoServidor?.versao ?? 0;
    if (local?.pendente && local.versao === versaoServidor) {
      // Alterações feitas offline (ou antes de um F5) sobre a mesma versão
      // do servidor — recupera e envia.
      respostasRef.current = local.respostas;
      secaoRef.current = local.secaoAtual;
      sujoRef.current = true;
      setRespostas(local.respostas);
      setSecaoAtual(local.secaoAtual);
      setStatus("pendente");
      agendar(0);
    } else if (local) {
      // Servidor é igual ou mais novo (ex.: preenchido em outro dispositivo).
      persistirLocal();
    }
    setPronto(true);
    // Só na montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconexão, saída da aba e fechamento da página.
  useEffect(() => {
    const aoReconectar = () => {
      tentativasRef.current = 0;
      void flushRef.current();
    };
    const aoOcultar = () => {
      if (document.visibilityState === "hidden") void flushRef.current();
    };
    const aoSair = (event: BeforeUnloadEvent) => {
      if (!descartadoRef.current && (sujoRef.current || emVooRef.current)) {
        event.preventDefault();
      }
    };
    const aoFicarOffline = () => setStatus((s) => (s === "salvo" ? s : "offline"));
    window.addEventListener("online", aoReconectar);
    window.addEventListener("offline", aoFicarOffline);
    document.addEventListener("visibilitychange", aoOcultar);
    window.addEventListener("beforeunload", aoSair);
    return () => {
      window.removeEventListener("online", aoReconectar);
      window.removeEventListener("offline", aoFicarOffline);
      document.removeEventListener("visibilitychange", aoOcultar);
      window.removeEventListener("beforeunload", aoSair);
      clearTimeout(timerRef.current);
    };
  }, []);

  const marcarAlterado = useCallback(() => {
    sujoRef.current = true;
    persistirLocal();
    setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "pendente");
  }, [persistirLocal]);

  const setValor = useCallback(
    (campoId: string, valor: string | string[]) => {
      if (respostasRef.current[campoId] === valor) return;
      const novo = { ...respostasRef.current, [campoId]: valor };
      respostasRef.current = novo;
      setRespostas(novo);
      marcarAlterado();
      agendar();
    },
    [marcarAlterado, agendar]
  );

  /** Troca de seção salva na hora (é o ponto de retomada). */
  const irParaSecao = useCallback(
    (indice: number) => {
      secaoRef.current = indice;
      setSecaoAtual(indice);
      marcarAlterado();
      void flushRef.current();
    },
    [marcarAlterado]
  );

  /** Depois do envio final: descarta o rascunho local e para os salvamentos. */
  const descartar = useCallback(() => {
    descartadoRef.current = true;
    sujoRef.current = false;
    clearTimeout(timerRef.current);
    removerLocal(chave);
  }, [chave]);

  return { respostas, secaoAtual, setValor, irParaSecao, status, ultimoSalvoEm, pronto, descartar };
}
