import type { StatusAcesso } from "@/lib/types";

export const statusAcessoLabel: Record<StatusAcesso, string> = {
  aguardando: "Aguardando",
  em_andamento: "Em andamento",
  respondido: "Respondido",
  bloqueado: "Bloqueado",
};

/**
 * Variação percentual em relação ao período anterior. Zerada até existir
 * um histórico real para calcular a variação de fato.
 */
export const variacaoMock: Record<string, number> = {
  totalColaboradores: 0,
  totalFormularios: 0,
  totalRespostas: 0,
  totalPendentes: 0,
  aguardando: 0,
  bloqueados: 0,
};

/** Abas de filtro por status (lista "Meus formulários"). */
export const filtrosStatusAcesso: { value: StatusAcesso | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "aguardando", label: "Aguardando" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "respondido", label: "Respondidos" },
  { value: "bloqueado", label: "Bloqueados" },
];
