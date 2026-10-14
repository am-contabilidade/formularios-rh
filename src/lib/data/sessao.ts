import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { colaboradorAtualPlaceholder } from "@/lib/data/colaborador-atual";
import { getColaboradorById } from "@/lib/data/colaboradores";

/** Sessão da requisição atual (lê cookies — usar só dentro de <Suspense>). */
export const getSessao = cache(() => auth());

/** Colaborador logado, com placeholder quando não houver sessão/cadastro. */
export const getColaboradorLogado = cache(async () => {
  const sessao = await getSessao();
  const colaborador = sessao?.user ? await getColaboradorById(sessao.user.id) : undefined;
  return colaborador ?? colaboradorAtualPlaceholder;
});
