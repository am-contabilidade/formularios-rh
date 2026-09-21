import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { Colaborador, PerfilUsuario } from "@/lib/types";

interface ColaboradorAtualRow {
  id: string;
  nome: string;
  email: string;
  email_pessoal: string | null;
  cargo: string | null;
  departamento: string | null;
  data_admissao: string | null;
  perfil: string;
  icone_url: string | null;
  foto_url: string | null;
}

function iniciaisFromNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase() || "??";
}

function mapColaborador(row: ColaboradorAtualRow): Colaborador {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    emailPessoal: row.email_pessoal ?? undefined,
    perfil: row.perfil as PerfilUsuario,
    cargo: row.cargo ?? "",
    funcao: "",
    departamento: row.departamento ?? "",
    iniciais: iniciaisFromNome(row.nome),
    dataAdmissao: row.data_admissao ?? "",
    iconeUrl: row.icone_url ?? undefined,
    fotoUrl: row.foto_url ?? undefined,
  };
}

const SELECT =
  "id, nome, email, email_pessoal, cargo, departamento, data_admissao, perfil, icone_url, foto_url";

export async function getColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await supabaseAdmin()
    .from("formularios_colaboradores_atual")
    .select(SELECT)
    .order("nome");
  if (error) throw new Error(`getColaboradores: ${error.message}`);
  return (data ?? []).map(mapColaborador);
}

export async function getColaboradorById(id: string): Promise<Colaborador | undefined> {
  if (!id) return undefined;
  const { data, error } = await supabaseAdmin()
    .from("formularios_colaboradores_atual")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getColaboradorById: ${error.message}`);
  return data ? mapColaborador(data) : undefined;
}

export async function getColaboradoresByIds(ids: string[]): Promise<Colaborador[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabaseAdmin()
    .from("formularios_colaboradores_atual")
    .select(SELECT)
    .in("id", ids);
  if (error) throw new Error(`getColaboradoresByIds: ${error.message}`);
  return (data ?? []).map(mapColaborador);
}

export interface CredencialColaborador {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  passwordHash: string | null;
}

/**
 * Busca direto em `formularios_colaboradores` (não na view pública) porque
 * só esta função precisa enxergar `password_hash` — usada exclusivamente
 * pelo authorize() do NextAuth, nunca em telas.
 */
export async function getCredencialPorEmailPessoal(
  emailPessoal: string
): Promise<CredencialColaborador | undefined> {
  if (!emailPessoal) return undefined;
  const { data, error } = await supabaseAdmin()
    .from("formularios_colaboradores")
    .select("id, nome, email, perfil, password_hash")
    .eq("email_pessoal", emailPessoal)
    .eq("ativo", true)
    .maybeSingle();
  if (error) throw new Error(`getCredencialPorEmailPessoal: ${error.message}`);
  if (!data) return undefined;
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    perfil: data.perfil as PerfilUsuario,
    passwordHash: data.password_hash,
  };
}
