import type { Atribuicao, Colaborador, Formulario } from "@/lib/types";

/**
 * Dados do shell (header, breadcrumbs, command palette) como promises: o
 * layout NÃO espera o banco — menu e cabeçalho aparecem na hora e cada pedaço
 * que depende de dado resolve a promise com `use()` dentro do seu próprio
 * <Suspense> (skeleton só ali).
 */
export interface AppShellData {
  colaboradorAtual: Promise<Colaborador>;
  colaboradores: Promise<Colaborador[]>;
  formularios: Promise<Formulario[]>;
  atribuicoesColaborador: Promise<Atribuicao[]>;
}
