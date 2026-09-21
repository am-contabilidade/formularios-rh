import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { CampoFormulario, Formulario, SecaoFormulario, StatusFormulario, TipoCampo } from "@/lib/types";

interface CampoRow {
  id: string;
  tipo: string;
  label: string;
  descricao: string | null;
  placeholder: string | null;
  obrigatorio: boolean;
  opcoes: string[] | null;
  condicional_campo_id: string | null;
  condicional_valor: string | string[] | null;
  ordem: number;
}

interface SecaoRow {
  id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  campos: CampoRow[];
}

interface FormularioRow {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  tabela: string;
  estimativa_minutos: number;
  prazo: string | null;
  criado_em: string;
  secoes: SecaoRow[];
}

const SELECT = `
  id, titulo, descricao, categoria, status, tabela, estimativa_minutos, prazo, criado_em,
  secoes:formularios_secoes(
    id, titulo, descricao, ordem,
    campos:formularios_campos(
      id, tipo, label, descricao, placeholder, obrigatorio, opcoes,
      condicional_campo_id, condicional_valor, ordem
    )
  )
`;

function mapCampo(row: CampoRow): CampoFormulario {
  return {
    id: row.id,
    tipo: row.tipo as TipoCampo,
    label: row.label,
    descricao: row.descricao ?? undefined,
    placeholder: row.placeholder ?? undefined,
    obrigatorio: row.obrigatorio,
    opcoes: row.opcoes ?? undefined,
    condicional: row.condicional_campo_id
      ? { campoId: row.condicional_campo_id, valorEsperado: row.condicional_valor ?? "" }
      : undefined,
  };
}

function mapSecao(row: SecaoRow): SecaoFormulario {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao ?? undefined,
    campos: [...row.campos]
      .sort((a, b) => a.ordem - b.ordem)
      .map(mapCampo),
  };
}

function mapFormulario(row: FormularioRow): Formulario {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    categoria: row.categoria,
    status: row.status as StatusFormulario,
    tabela: row.tabela,
    estimativaMinutos: row.estimativa_minutos,
    prazo: row.prazo ?? undefined,
    criadoEm: row.criado_em,
    secoes: [...row.secoes].sort((a, b) => a.ordem - b.ordem).map(mapSecao),
  };
}

export async function getFormularios(): Promise<Formulario[]> {
  const { data, error } = await supabaseAdmin()
    .from("formularios_formularios")
    .select(SELECT)
    .order("criado_em", { ascending: false });
  if (error) throw new Error(`getFormularios: ${error.message}`);
  return ((data ?? []) as unknown as FormularioRow[]).map(mapFormulario);
}

export async function getFormularioById(id: string): Promise<Formulario | undefined> {
  if (!id) return undefined;
  const { data, error } = await supabaseAdmin()
    .from("formularios_formularios")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getFormularioById: ${error.message}`);
  return data ? mapFormulario(data as unknown as FormularioRow) : undefined;
}
