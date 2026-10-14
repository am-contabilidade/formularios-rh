/**
 * Ícone de cada seção do sistema — o mesmo no menu lateral e na marca d'água
 * do cabeçalho da página (DESIGN.md, "Cabeçalho das páginas").
 */
import { ClipboardList, FileSpreadsheet, LayoutDashboard, ShieldCheck, Users } from "lucide-react";

export const iconesNavegacao = {
  painel: LayoutDashboard,
  formularios: ClipboardList,
  colaboradores: Users,
  acessos: ShieldCheck,
  relatorios: FileSpreadsheet,
} as const;
