import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { Atribuicao, Colaborador, Formulario, RespostaFormulario } from "@/lib/types";
import { getColaboradoresByIds } from "@/lib/data/colaboradores";
import { getFormularioById, getFormularios } from "@/lib/data/formularios";
import { getAtribuicoesByColaborador, getAtribuicoesByFormulario } from "@/lib/data/atribuicoes";
import { getRespostaByAtribuicao } from "@/lib/data/respostas";

export interface ResumoFormulario {
  formulario: Formulario;
  totalAtribuidos: number;
  totalRespondidos: number;
  totalPendentes: number;
  totalBloqueados: number;
  colaboradores: Colaborador[];
}

async function getResumoFormularioSemCache(formularioId: string): Promise<ResumoFormulario | undefined> {
  const formulario = await getFormularioById(formularioId);
  if (!formulario) return undefined;
  const lista = await getAtribuicoesByFormulario(formularioId);
  const colaboradores = await getColaboradoresByIds(lista.map((a) => a.colaboradorId));
  return {
    formulario,
    totalAtribuidos: lista.length,
    totalRespondidos: lista.filter((a) => a.status === "respondido").length,
    totalPendentes: lista.filter((a) => a.status === "aguardando" || a.status === "em_andamento")
      .length,
    totalBloqueados: lista.filter((a) => a.status === "bloqueado").length,
    colaboradores,
  };
}

async function getResumosFormulariosSemCache(): Promise<ResumoFormulario[]> {
  const formularios = await getFormularios();
  const resumos = await Promise.all(formularios.map((f) => getResumoFormulario(f.id)));
  return resumos.filter((r): r is ResumoFormulario => !!r);
}

export interface ResumoGestao {
  totalColaboradores: number;
  totalFormularios: number;
  totalRespostas: number;
  totalPendentes: number;
}

async function getResumoGestaoSemCache(): Promise<ResumoGestao> {
  const admin = supabaseAdmin();
  const [colaboradores, formularios, respondidos, pendentes] = await Promise.all([
    admin.from("formularios_colaboradores_atual").select("id", { count: "exact", head: true }),
    admin.from("formularios_formularios").select("id", { count: "exact", head: true }),
    admin
      .from("formularios_atribuicoes")
      .select("id", { count: "exact", head: true })
      .eq("status", "respondido"),
    admin
      .from("formularios_atribuicoes")
      .select("id", { count: "exact", head: true })
      .in("status", ["aguardando", "em_andamento"]),
  ]);
  for (const r of [colaboradores, formularios, respondidos, pendentes]) {
    if (r.error) throw new Error(`getResumoGestao: ${r.error.message}`);
  }
  return {
    totalColaboradores: colaboradores.count ?? 0,
    totalFormularios: formularios.count ?? 0,
    totalRespostas: respondidos.count ?? 0,
    totalPendentes: pendentes.count ?? 0,
  };
}

export interface ItemHistorico {
  atribuicao: Atribuicao;
  formulario: Formulario;
  resposta: RespostaFormulario;
}

async function getHistoricoColaboradorSemCache(colaboradorId: string): Promise<ItemHistorico[]> {
  const atribuicoes = (await getAtribuicoesByColaborador(colaboradorId)).filter(
    (a) => a.status === "respondido"
  );
  const itens = await Promise.all(
    atribuicoes.map(async (atribuicao): Promise<ItemHistorico | undefined> => {
      const formulario = await getFormularioById(atribuicao.formularioId);
      const resposta = await getRespostaByAtribuicao(atribuicao.formularioId, colaboradorId);
      if (!formulario || !resposta) return undefined;
      return { atribuicao, formulario, resposta };
    })
  );
  return itens
    .filter((item): item is ItemHistorico => !!item)
    .sort((a, b) => (a.resposta.enviadoEm < b.resposta.enviadoEm ? 1 : -1));
}

async function getProximaPendenciaSemCache(colaboradorId: string): Promise<Atribuicao | undefined> {
  const atribuicoes = (await getAtribuicoesByColaborador(colaboradorId)).filter(
    (a) => (a.status === "aguardando" || a.status === "em_andamento") && a.prazo
  );
  return atribuicoes.sort((a, b) => (a.prazo! < b.prazo! ? -1 : 1))[0];
}

// Deduplica leituras repetidas na mesma requisição.
export const getResumoFormulario = cache(getResumoFormularioSemCache);
export const getResumosFormularios = cache(getResumosFormulariosSemCache);
export const getResumoGestao = cache(getResumoGestaoSemCache);
export const getHistoricoColaborador = cache(getHistoricoColaboradorSemCache);
export const getProximaPendencia = cache(getProximaPendenciaSemCache);
