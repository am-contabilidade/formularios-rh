/**
 * Cores de domínio em um só lugar (DESIGN.md, "Regras"): paleta padrão do
 * Tailwind em tons suaves — fundo 100, texto 800, ponto 400 e barra 500.
 * Qualquer badge, legenda ou gráfico que represente um status usa este mapa.
 */
import type { StatusAcesso } from "@/lib/types";

export interface CoresStatus {
  /** Pílula: fundo + texto + borda. */
  badge: string;
  /** Ponto de legenda. */
  ponto: string;
  /** Segmento de barra / gráfico. */
  barra: string;
}

export const coresStatusAcesso: Record<StatusAcesso, CoresStatus> = {
  aguardando: {
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    ponto: "bg-slate-400",
    barra: "bg-slate-400",
  },
  em_andamento: {
    badge: "border-amber-200 bg-amber-100 text-amber-800",
    ponto: "bg-amber-400",
    barra: "bg-amber-500",
  },
  respondido: {
    badge: "border-emerald-200 bg-emerald-100 text-emerald-800",
    ponto: "bg-emerald-400",
    barra: "bg-emerald-500",
  },
  bloqueado: {
    badge: "border-red-200 bg-red-100 text-red-800",
    ponto: "bg-red-400",
    barra: "bg-red-500",
  },
};

/**
 * Agrupamento usado nos resumos (respondidos / pendentes / bloqueados).
 * "Pendente" junta aguardando + em andamento e herda o âmbar de em andamento.
 */
export const coresResumo = {
  respondidos: coresStatusAcesso.respondido,
  pendentes: coresStatusAcesso.em_andamento,
  bloqueados: coresStatusAcesso.bloqueado,
} as const;
