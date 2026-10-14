import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { Rascunho, RespostasMapa } from "@/lib/types";

interface RascunhoRow {
  respostas: RespostasMapa;
  secao_atual: number;
  versao: number;
  atualizado_em: string;
}

const SELECT = "respostas, secao_atual, versao, atualizado_em";

function mapRascunho(row: RascunhoRow): Rascunho {
  return {
    respostas: row.respostas ?? {},
    secaoAtual: row.secao_atual,
    versao: row.versao,
    atualizadoEm: row.atualizado_em,
  };
}

export async function getRascunho(atribuicaoId: string): Promise<Rascunho | undefined> {
  const { data, error } = await supabaseAdmin()
    .from("formularios_rascunhos")
    .select(SELECT)
    .eq("atribuicao_id", atribuicaoId)
    .maybeSingle();
  if (error) throw new Error(`getRascunho: ${error.message}`);
  return data ? mapRascunho(data as RascunhoRow) : undefined;
}

export type ResultadoSalvarRascunho =
  | { ok: true; rascunho: Rascunho }
  | { ok: false; conflito: true; rascunho: Rascunho };

/**
 * Grava o snapshot com controle de concorrência otimista: o update só passa
 * se `versaoEsperada` for a versão atual no banco. Se outra aba/dispositivo
 * salvou antes, devolve o estado do servidor como conflito.
 */
export async function salvarRascunho({
  atribuicaoId,
  respostas,
  secaoAtual,
  versaoEsperada,
}: {
  atribuicaoId: string;
  respostas: RespostasMapa;
  secaoAtual: number;
  versaoEsperada: number;
}): Promise<ResultadoSalvarRascunho> {
  const db = supabaseAdmin();
  const agora = new Date().toISOString();

  if (versaoEsperada === 0) {
    const { data, error } = await db
      .from("formularios_rascunhos")
      .insert({ atribuicao_id: atribuicaoId, respostas, secao_atual: secaoAtual, versao: 1, atualizado_em: agora })
      .select(SELECT)
      .maybeSingle();
    if (!error && data) {
      await marcarEmAndamento(atribuicaoId);
      return { ok: true, rascunho: mapRascunho(data as RascunhoRow) };
    }
    // 23505 = já existe rascunho (outra aba criou primeiro) → conflito.
    if (error && error.code !== "23505") throw new Error(`salvarRascunho: ${error.message}`);
  } else {
    const { data, error } = await db
      .from("formularios_rascunhos")
      .update({ respostas, secao_atual: secaoAtual, versao: versaoEsperada + 1, atualizado_em: agora })
      .eq("atribuicao_id", atribuicaoId)
      .eq("versao", versaoEsperada)
      .select(SELECT)
      .maybeSingle();
    if (error) throw new Error(`salvarRascunho: ${error.message}`);
    if (data) return { ok: true, rascunho: mapRascunho(data as RascunhoRow) };
  }

  const atual = await getRascunho(atribuicaoId);
  if (!atual) {
    // Rascunho sumiu entre a leitura e a escrita (ex.: apagado) — recria.
    return salvarRascunho({ atribuicaoId, respostas, secaoAtual, versaoEsperada: 0 });
  }
  return { ok: false, conflito: true, rascunho: atual };
}

async function marcarEmAndamento(atribuicaoId: string) {
  const { error } = await supabaseAdmin()
    .from("formularios_atribuicoes")
    .update({ status: "em_andamento" })
    .eq("id", atribuicaoId)
    .eq("status", "aguardando");
  if (error) throw new Error(`marcarEmAndamento: ${error.message}`);
}

/** Envio final atômico (função formularios_enviar_resposta no banco). */
export async function enviarResposta(atribuicaoId: string, respostas: RespostasMapa): Promise<void> {
  const { error } = await supabaseAdmin().rpc("formularios_enviar_resposta", {
    p_atribuicao_id: atribuicaoId,
    p_respostas: respostas,
  });
  if (error) throw new Error(`enviarResposta: ${error.message}`);
}
