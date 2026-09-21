import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { RespostaCampo, RespostaFormulario } from "@/lib/types";

interface RespostaCampoRow {
  campo_id: string;
  valor: string | string[];
}

interface RespostaRow {
  id: string;
  formulario_id: string;
  colaborador_id: string;
  enviado_em: string;
  tempo_gasto_minutos: number;
  campos: RespostaCampoRow[];
}

const SELECT = `
  id, formulario_id, colaborador_id, enviado_em, tempo_gasto_minutos,
  campos:formularios_respostas_campos(campo_id, valor)
`;

function mapResposta(row: RespostaRow): RespostaFormulario {
  return {
    id: row.id,
    formularioId: row.formulario_id,
    colaboradorId: row.colaborador_id,
    enviadoEm: row.enviado_em,
    tempoGastoMinutos: row.tempo_gasto_minutos,
    campos: row.campos.map(
      (c): RespostaCampo => ({ campoId: c.campo_id, valor: c.valor })
    ),
  };
}

export async function getRespostaByAtribuicao(
  formularioId: string,
  colaboradorId: string
): Promise<RespostaFormulario | undefined> {
  if (!colaboradorId) return undefined;
  const { data, error } = await supabaseAdmin()
    .from("formularios_respostas")
    .select(SELECT)
    .eq("formulario_id", formularioId)
    .eq("colaborador_id", colaboradorId)
    .maybeSingle();
  if (error) throw new Error(`getRespostaByAtribuicao: ${error.message}`);
  return data ? mapResposta(data as unknown as RespostaRow) : undefined;
}

export async function getRespostasByFormulario(
  formularioId: string
): Promise<RespostaFormulario[]> {
  const { data, error } = await supabaseAdmin()
    .from("formularios_respostas")
    .select(SELECT)
    .eq("formulario_id", formularioId);
  if (error) throw new Error(`getRespostasByFormulario: ${error.message}`);
  return ((data ?? []) as unknown as RespostaRow[]).map(mapResposta);
}
