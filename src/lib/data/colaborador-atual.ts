import type { Colaborador } from "@/lib/types";

/**
 * Colaborador "logado" simulado para as telas do portal do colaborador.
 * Sem autenticação real ainda — ver etapa de autenticação. Placeholder
 * neutro fora da base real (id vazio, sem atribuições correspondentes) só
 * para o shell (sidebar/header) não quebrar.
 */
export const colaboradorAtualPlaceholder: Colaborador = {
  id: "",
  nome: "Colaborador",
  email: "",
  perfil: "colaborador",
  cargo: "",
  funcao: "",
  departamento: "",
  iniciais: "CO",
  dataAdmissao: "",
};
