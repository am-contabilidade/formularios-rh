"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getCredencialPorEmailPessoal } from "@/lib/data";

export async function autenticar(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    // Sem `redirectTo`, o next-auth usa o header Referer como destino pós-login,
    // o que faz o signIn redirecionar de volta para /login e depender do proxy
    // para um segundo redirecionamento até a home do perfil — esse encadeamento
    // trava a navegação no App Router (só resolve com F5). Resolvendo o perfil
    // aqui e mandando `redirectTo` direto, o signIn já navega para o destino
    // final em um único passo.
    let redirectTo = "/";
    if (typeof email === "string") {
      const credencial = await getCredencialPorEmailPessoal(email.trim().toLowerCase());
      if (credencial) {
        redirectTo = credencial.perfil === "gestao" ? "/gestao" : "/colaborador";
      }
    }

    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email ou senha inválidos.";
        default:
          return "Não foi possível entrar. Tente novamente.";
      }
    }
    throw error;
  }
}
