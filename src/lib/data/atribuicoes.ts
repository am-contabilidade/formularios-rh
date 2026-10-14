import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { Atribuicao, StatusAcesso } from "@/lib/types";

interface AtribuicaoRow {
  id: string;
  formulario_id: string;
  colaborador_id: string;
  status: string;
  liberado_em: string | null;
  respondido_em: string | null;
  prazo: string | null;
}

const SELECT = "id, formulario_id, colaborador_id, status, liberado_em, respondido_em, prazo";

function mapAtribuicao(row: AtribuicaoRow): Atribuicao {
  return {
    id: row.id,
    formularioId: row.formulario_id,
    colaboradorId: row.colaborador_id,
    status: row.status as StatusAcesso,
    liberadoEm: row.liberado_em ?? undefined,
    respondidoEm: row.respondido_em ?? undefined,
    prazo: row.prazo ?? undefined,
  };
}

async function getAtribuicoesSemCache(): Promise<Atribuicao[]> {
  const { data, error } = await supabaseAdmin().from("formularios_atribuicoes").select(SELECT);
  if (error) throw new Error(`getAtribuicoes: ${error.message}`);
  return (data ?? []).map(mapAtribuicao);
}

async function getAtribuicoesByColaboradorSemCache(colaboradorId: string): Promise<Atribuicao[]> {
  if (!colaboradorId) return [];
  const { data, error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .select(SELECT)
    .eq("colaborador_id", colaboradorId);
  if (error) throw new Error(`getAtribuicoesByColaborador: ${error.message}`);
  return (data ?? []).map(mapAtribuicao);
}

async function getAtribuicoesByFormularioSemCache(formularioId: string): Promise<Atribuicao[]> {
  const { data, error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .select(SELECT)
    .eq("formulario_id", formularioId);
  if (error) throw new Error(`getAtribuicoesByFormulario: ${error.message}`);
  return (data ?? []).map(mapAtribuicao);
}

export async function createAtribuicoes(
  formularioId: string,
  colaboradorIds: string[]
): Promise<void> {
  if (colaboradorIds.length === 0) return;
  const rows = colaboradorIds.map((colaboradorId) => ({
    formulario_id: formularioId,
    colaborador_id: colaboradorId,
    status: "aguardando",
  }));
  const { error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .upsert(rows, { onConflict: "formulario_id,colaborador_id", ignoreDuplicates: true });
  if (error) throw new Error(`createAtribuicoes: ${error.message}`);
}

async function getAtribuicaoSemCache(
  formularioId: string,
  colaboradorId: string
): Promise<Atribuicao | undefined> {
  if (!colaboradorId) return undefined;
  const { data, error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .select(SELECT)
    .eq("formulario_id", formularioId)
    .eq("colaborador_id", colaboradorId)
    .maybeSingle();
  if (error) throw new Error(`getAtribuicao: ${error.message}`);
  return data ? mapAtribuicao(data) : undefined;
}

export async function getAtribuicaoById(id: string): Promise<Atribuicao | undefined> {
  const { data, error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getAtribuicaoById: ${error.message}`);
  return data ? mapAtribuicao(data) : undefined;
}

export async function atualizarStatusAtribuicao(id: string, status: StatusAcesso): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .update({ status, liberado_em: status === "bloqueado" ? null : new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (error) throw new Error(`atualizarStatusAtribuicao: ${error.message}`);
}

// Deduplica leituras repetidas na mesma requisição (ex.: título e corpo da
// página em <Suspense> separados).
export const getAtribuicoes = cache(getAtribuicoesSemCache);
export const getAtribuicoesByColaborador = cache(getAtribuicoesByColaboradorSemCache);
export const getAtribuicoesByFormulario = cache(getAtribuicoesByFormularioSemCache);
export const getAtribuicao = cache(getAtribuicaoSemCache);
