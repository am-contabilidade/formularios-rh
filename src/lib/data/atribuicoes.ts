import "server-only";
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

export async function getAtribuicoes(): Promise<Atribuicao[]> {
  const { data, error } = await supabaseAdmin().from("formularios_atribuicoes").select(SELECT);
  if (error) throw new Error(`getAtribuicoes: ${error.message}`);
  return (data ?? []).map(mapAtribuicao);
}

export async function getAtribuicoesByColaborador(colaboradorId: string): Promise<Atribuicao[]> {
  if (!colaboradorId) return [];
  const { data, error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .select(SELECT)
    .eq("colaborador_id", colaboradorId);
  if (error) throw new Error(`getAtribuicoesByColaborador: ${error.message}`);
  return (data ?? []).map(mapAtribuicao);
}

export async function getAtribuicoesByFormulario(formularioId: string): Promise<Atribuicao[]> {
  const { data, error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .select(SELECT)
    .eq("formulario_id", formularioId);
  if (error) throw new Error(`getAtribuicoesByFormulario: ${error.message}`);
  return (data ?? []).map(mapAtribuicao);
}

export async function getAtribuicao(
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
