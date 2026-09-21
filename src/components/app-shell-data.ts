import type { Atribuicao, Colaborador, Formulario } from "@/lib/types";

/**
 * Dados buscados uma vez no layout (Server Component) e repassados por
 * props para os componentes client do shell (sidebar, header, breadcrumbs,
 * command palette), que não podem chamar a camada de dados diretamente.
 */
export interface AppShellData {
  colaboradorAtual: Colaborador;
  colaboradores: Colaborador[];
  formularios: Formulario[];
  atribuicoesColaborador: Atribuicao[];
}
