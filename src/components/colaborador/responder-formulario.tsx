"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, CloudOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PerguntasFlowView } from "@/components/gestao/perguntas-flow";
import { useRascunho, type StatusSalvamento } from "@/components/colaborador/use-rascunho";
import { enviarRespostasAction } from "@/lib/actions/respostas";
import { camposPendentes } from "@/lib/perguntas/validacao";
import type { EscalaCompetenciaItem } from "@/lib/perguntas/escala-competencia";
import type { Colaborador, Rascunho, SecaoFormulario } from "@/lib/types";
import { cn } from "@/lib/utils";

function IndicadorSalvamento({
  status,
  ultimoSalvoEm,
}: {
  status: StatusSalvamento;
  ultimoSalvoEm?: Date;
}) {
  const hora = ultimoSalvoEm?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const config = {
    salvo: {
      icon: Check,
      texto: hora ? `Salvo às ${hora}` : "Salvamento automático ativo",
      classe: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    salvando: { icon: Loader2, texto: "Salvando…", classe: "border-border bg-muted text-muted-foreground" },
    pendente: { icon: Loader2, texto: "Salvando…", classe: "border-border bg-muted text-muted-foreground" },
    offline: {
      icon: CloudOff,
      texto: "Sem conexão — salvo neste dispositivo",
      classe: "border-amber-200 bg-amber-50 text-amber-800",
    },
    erro: {
      icon: AlertCircle,
      texto: "Não foi possível salvar",
      classe: "border-red-200 bg-red-50 text-red-800",
    },
  }[status];
  const Icon = config.icon;

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold",
        config.classe
      )}
    >
      <Icon className={cn("size-3.5", Icon === Loader2 && "animate-spin")} />
      {config.texto}
    </span>
  );
}

export function ResponderFormulario({
  formularioId,
  atribuicaoId,
  rascunho,
  secoes,
  mensagemFinal,
  legendaEscala,
  colaboradorAtual,
}: {
  formularioId: string;
  atribuicaoId: string;
  rascunho?: Rascunho;
  secoes: SecaoFormulario[];
  mensagemFinal?: string;
  legendaEscala?: EscalaCompetenciaItem[];
  colaboradorAtual: Colaborador;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const { respostas, secaoAtual, setValor, irParaSecao, status, ultimoSalvoEm, pronto, descartar } =
    useRascunho({ formularioId, atribuicaoId, rascunhoServidor: rascunho });

  const totalSteps = secoes.length + (mensagemFinal ? 1 : 0);
  const stepIndex = Math.min(secaoAtual, totalSteps - 1);

  // Ao retomar um rascunho, leva direto à primeira pergunta sem resposta.
  const retomouRef = useRef(false);
  useEffect(() => {
    if (!pronto || retomouRef.current) return;
    retomouRef.current = true;
    const secao = secoes[stepIndex];
    if (!secao || Object.keys(respostas).length === 0) return;
    const pendente = camposPendentes(secao, respostas)[0];
    if (pendente) {
      document
        .querySelector(`[data-campo-id="${pendente.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    toast.info("Continuando de onde você parou");
  }, [pronto, secoes, stepIndex, respostas]);

  async function enviar() {
    setEnviando(true);
    try {
      const resultado = await enviarRespostasAction(formularioId, respostas);
      if (!resultado.ok) {
        toast.error("Não foi possível enviar", { description: resultado.erro });
        setEnviando(false);
        return;
      }
      descartar();
      toast.success("Respostas enviadas com sucesso");
      router.push(`/colaborador/formularios/${formularioId}/sucesso`);
    } catch {
      toast.error("Sem conexão com o servidor", {
        description: "Suas respostas estão salvas. Tente enviar de novo quando a internet voltar.",
      });
      setEnviando(false);
    }
  }

  return (
    <PerguntasFlowView
      modo="resposta"
      secoes={secoes}
      mensagemFinal={mensagemFinal}
      legendaEscala={legendaEscala}
      colaboradorAtual={colaboradorAtual}
      respostas={respostas}
      onValor={setValor}
      stepIndex={stepIndex}
      onStepChange={irParaSecao}
      indicador={<IndicadorSalvamento status={status} ultimoSalvoEm={ultimoSalvoEm} />}
      onEnviar={enviar}
      enviando={enviando}
    />
  );
}
