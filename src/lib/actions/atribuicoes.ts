"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  atualizarStatusAtribuicao,
  createAtribuicoes,
  getAtribuicaoById,
  getRascunho,
} from "@/lib/data";

async function exigirGestao() {
  const session = await auth();
  if (!session?.user || session.user.perfil !== "gestao") {
    throw new Error("Apenas a gestão pode alterar acessos.");
  }
}

export async function vincularColaboradores(formularioId: string, colaboradorIds: string[]) {
  await exigirGestao();
  if (colaboradorIds.length === 0) return;
  await createAtribuicoes(formularioId, colaboradorIds);
  revalidatePath(`/gestao/formularios/${formularioId}`);
  revalidatePath("/gestao/colaboradores");
}

/**
 * Bloqueia ou libera o acesso de um colaborador a um formulário.
 * Formulário já respondido não muda. Ao liberar, volta para "em andamento"
 * se houver rascunho salvo — senão, "aguardando".
 */
export async function alterarAcesso(
  atribuicaoId: string,
  acao: "bloquear" | "liberar"
): Promise<{ ok: true } | { ok: false; erro: string }> {
  await exigirGestao();
  const atribuicao = await getAtribuicaoById(atribuicaoId);
  if (!atribuicao) return { ok: false, erro: "Vínculo não encontrado." };
  if (atribuicao.status === "respondido") {
    return { ok: false, erro: "Formulário já respondido — o acesso não pode mais ser alterado." };
  }

  const novoStatus =
    acao === "bloquear" ? "bloqueado" : (await getRascunho(atribuicaoId)) ? "em_andamento" : "aguardando";
  await atualizarStatusAtribuicao(atribuicaoId, novoStatus);

  revalidatePath("/gestao/colaboradores");
  revalidatePath(`/gestao/formularios/${atribuicao.formularioId}`);
  revalidatePath("/gestao");
  return { ok: true };
}
