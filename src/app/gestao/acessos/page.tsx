import { redirect } from "next/navigation";

// "Gestão de acessos" foi unificada em "Colaboradores" (painel Gerenciar).
export default function GestaoAcessosPage() {
  redirect("/gestao/colaboradores");
}
