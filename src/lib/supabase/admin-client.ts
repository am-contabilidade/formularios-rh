import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client server-only com a service_role key. Bypassa RLS — nunca importar
 * este módulo em Client Components. Não há sessão de usuário ainda (ver
 * etapa de autenticação); todo o acesso hoje é feito com este client único.
 */
let client: SupabaseClient | undefined;

export function supabaseAdmin(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidas em .env"
      );
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
