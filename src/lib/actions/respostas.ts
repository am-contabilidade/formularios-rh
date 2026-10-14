"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  enviarResposta,
  getAtribuicao,
  getFormularioById,
  salvarRascunho,
  type ResultadoSalvarRascunho,
} from "@/lib/data";
import { getPerguntasDoFormulario } from "@/lib/perguntas/registro";
import { sanitizarRespostas, validarEnvio } from "@/lib/perguntas/validacao";

type Erro = { ok: false; erro: string };

/**
 * Resolve a atribuição do colaborador logado (nunca de um id vindo do
 * cliente) e confere se ela ainda aceita respostas.
 */
async function contextoResposta(formularioId: string) {
  const session = await auth();
  if (!session?.user || session.user.perfil !== "colaborador") {
    return { ok: false, erro: "Sessão expirada. Entre novamente." } as Erro;
  }
  const [formulario, atribuicao] = await Promise.all([
    getFormularioById(formularioId),
    getAtribuicao(formularioId, session.user.id),
  ]);
  if (!formulario || !atribuicao) return { ok: false, erro: "Formulário não encontrado." } as Erro;
  if (atribuicao.status === "bloqueado") {
    return { ok: false, erro: "Seu acesso a este formulário foi bloqueado." } as Erro;
  }
  if (atribuicao.status === "respondido") {
    return { ok: false, erro: "Este formulário já foi enviado." } as Erro;
  }
  const perguntas = getPerguntasDoFormulario(formulario);
  if (!perguntas) return { ok: false, erro: "Formulário sem perguntas." } as Erro;
  return { ok: true as const, atribuicao, perguntas };
}

export async function salvarRascunhoAction(
  formularioId: string,
  dados: { respostas: unknown; secaoAtual: number; versao: number }
): Promise<ResultadoSalvarRascunho | Erro> {
  const ctx = await contextoResposta(formularioId);
  if (!ctx.ok) return ctx;

  const totalSecoes = ctx.perguntas.secoes.length;
  const secaoAtual = Number.isInteger(dados.secaoAtual)
    ? Math.min(Math.max(0, dados.secaoAtual), totalSecoes)
    : 0;
  const versao = Number.isInteger(dados.versao) && dados.versao >= 0 ? dados.versao : 0;

  const resultado = await salvarRascunho({
    atribuicaoId: ctx.atribuicao.id,
    respostas: sanitizarRespostas(ctx.perguntas.secoes, dados.respostas),
    secaoAtual,
    versaoEsperada: versao,
  });

  if (resultado.ok && versao === 0) {
    // Primeiro salvamento muda o status para "em andamento".
    revalidatePath("/colaborador");
    revalidatePath(`/gestao/formularios/${formularioId}`);
  }
  return resultado;
}

export async function enviarRespostasAction(
  formularioId: string,
  respostas: unknown
): Promise<{ ok: true } | Erro> {
  const ctx = await contextoResposta(formularioId);
  if (!ctx.ok) return ctx;

  const validacao = validarEnvio(ctx.perguntas.secoes, respostas);
  if (!validacao.ok) {
    const n = validacao.faltando.length;
    return {
      ok: false,
      erro: `Faltam ${n} ${n === 1 ? "pergunta obrigatória" : "perguntas obrigatórias"} para enviar.`,
    };
  }

  await enviarResposta(ctx.atribuicao.id, validacao.respostas);

  revalidatePath("/colaborador");
  revalidatePath("/colaborador/formularios");
  revalidatePath(`/colaborador/formularios/${formularioId}`);
  revalidatePath("/gestao");
  revalidatePath(`/gestao/formularios/${formularioId}`);
  return { ok: true };
}
