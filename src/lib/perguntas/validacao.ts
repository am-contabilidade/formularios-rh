/**
 * Regras de preenchimento compartilhadas entre a tela (avançar de seção) e
 * as server actions (salvar rascunho / envio final) — o servidor nunca
 * confia só na validação do cliente.
 */
import type { CampoFormulario, RespostasMapa, SecaoFormulario } from "@/lib/types";

const TAMANHO_MAXIMO_TEXTO = 5000;

export function estaPreenchido(valor: string | string[] | undefined) {
  if (Array.isArray(valor)) return valor.length > 0;
  return !!valor && valor.trim().length > 0;
}

export function campoVisivel(campo: CampoFormulario, respostas: RespostasMapa) {
  if (!campo.condicional) return true;
  const valorAtual = respostas[campo.condicional.campoId];
  const esperado = campo.condicional.valorEsperado;
  if (Array.isArray(esperado)) {
    return typeof valorAtual === "string" && esperado.includes(valorAtual);
  }
  return valorAtual === esperado;
}

/** Campos obrigatórios visíveis da seção que ainda estão sem resposta. */
export function camposPendentes(secao: SecaoFormulario, respostas: RespostasMapa) {
  return secao.campos.filter(
    (campo) =>
      campo.obrigatorio && campoVisivel(campo, respostas) && !estaPreenchido(respostas[campo.id])
  );
}

export function contarRespondidas(secoes: SecaoFormulario[], respostas: RespostasMapa) {
  const campos = secoes.flatMap((s) => s.campos).filter((c) => campoVisivel(c, respostas));
  return {
    respondidas: campos.filter((c) => estaPreenchido(respostas[c.id])).length,
    total: campos.length,
  };
}

function valorValido(campo: CampoFormulario, valor: unknown): valor is string | string[] {
  if (campo.tipo === "checkbox") {
    return (
      Array.isArray(valor) &&
      valor.every((v) => typeof v === "string" && (!campo.opcoes || campo.opcoes.includes(v)))
    );
  }
  if (typeof valor !== "string" || valor.length > TAMANHO_MAXIMO_TEXTO) return false;
  if (valor === "") return true;
  if (campo.opcoes && ["select", "radio", "escala"].includes(campo.tipo)) {
    return campo.opcoes.includes(valor);
  }
  return true;
}

/**
 * Mantém só respostas de campos que existem no formulário e com valor no
 * formato esperado. Usado para salvar rascunho (aceita incompleto).
 */
export function sanitizarRespostas(secoes: SecaoFormulario[], respostas: unknown): RespostasMapa {
  if (!respostas || typeof respostas !== "object") return {};
  const entrada = respostas as Record<string, unknown>;
  const limpo: RespostasMapa = {};
  for (const campo of secoes.flatMap((s) => s.campos)) {
    const valor = entrada[campo.id];
    if (valor !== undefined && valorValido(campo, valor)) limpo[campo.id] = valor;
  }
  return limpo;
}

/**
 * Validação do envio final: devolve as respostas prontas para gravar (só
 * campos visíveis e preenchidos) ou a lista de obrigatórios faltando.
 */
export function validarEnvio(
  secoes: SecaoFormulario[],
  respostas: unknown
): { ok: true; respostas: RespostasMapa } | { ok: false; faltando: CampoFormulario[] } {
  const limpo = sanitizarRespostas(secoes, respostas);
  const faltando = secoes.flatMap((secao) => camposPendentes(secao, limpo));
  if (faltando.length > 0) return { ok: false, faltando };

  const final: RespostasMapa = {};
  for (const campo of secoes.flatMap((s) => s.campos)) {
    if (campoVisivel(campo, limpo) && estaPreenchido(limpo[campo.id])) {
      final[campo.id] = limpo[campo.id];
    }
  }
  return { ok: true, respostas: final };
}
