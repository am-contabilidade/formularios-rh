// Next.js 16 renomeou "middleware" para "proxy" (mesma funcionalidade,
// mesmo runtime) — ver node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md.
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/", "/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!session?.user) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const home = session.user.perfil === "gestao" ? "/gestao" : "/colaborador";

  if (isPublic) {
    return NextResponse.redirect(new URL(home, req.nextUrl));
  }

  if (session.user.perfil === "colaborador" && pathname.startsWith("/gestao")) {
    return NextResponse.redirect(new URL("/colaborador", req.nextUrl));
  }
  if (session.user.perfil === "gestao" && pathname.startsWith("/colaborador")) {
    return NextResponse.redirect(new URL("/gestao", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Exclui API routes, assets internos do Next e arquivos de imagem/ícone
  // servidos de /public — sem isso, o proxy exigia sessão para logos,
  // quebrando seu carregamento. Lista fechada de extensões (em vez de
  // "qualquer path com ponto") para não abrir uma brecha de bypass de auth.
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
