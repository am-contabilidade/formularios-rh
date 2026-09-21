import type { StatusAcesso } from "@/lib/types";

export const statusAcessoLabel: Record<StatusAcesso, string> = {
  aguardando: "Aguardando resposta",
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
