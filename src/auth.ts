import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCredencialPorEmailPessoal } from "@/lib/data";
import type { PerfilUsuario } from "@/lib/types";

declare module "next-auth" {
  interface User {
    perfil: PerfilUsuario;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      perfil: PerfilUsuario;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    perfil: PerfilUsuario;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const credencial = await getCredencialPorEmailPessoal(email.trim().toLowerCase());
        if (!credencial || !credencial.passwordHash) return null;

        const senhaValida = await bcrypt.compare(password, credencial.passwordHash);
        if (!senhaValida) return null;

        return {
          id: credencial.id,
          name: credencial.nome,
          email: credencial.email,
          perfil: credencial.perfil,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.perfil = user.perfil;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.perfil = token.perfil;
      return session;
    },
  },
});
