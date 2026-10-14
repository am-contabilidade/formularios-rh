/**
 * Tipos do domínio de Formulários RH.
 *
 * Convenção futura de persistência (Supabase): cada formulário terá sua
 * própria tabela, nomeada em português e prefixada com "Formulários_",
 * ex.: "Formulários_Colaboradores", "Formulários_AvaliaçãoDesempenho".
 * O campo `tabela` abaixo apenas documenta esse destino futuro — não há
 * conexão real com banco de dados neste momento.
 */

export type PerfilUsuario = "colaborador" | "gestao";

export type StatusAcesso = "aguardando" | "em_andamento" | "respondido" | "bloqueado";

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  /** Email pessoal — usado para acesso do colaborador. Nem todos têm um cadastrado. */
  emailPessoal?: string;
  /** Qual portal o colaborador acessa — define o perfil de acesso no login. */
  perfil: PerfilUsuario;
  cargo: string;
  funcao: string;
  departamento: string;
  iniciais: string;
  dataAdmissao: string;
  /** Miniatura do colaborador (vinda de users.icon_url). Nem todos têm uma. */
  iconeUrl?: string;
  /** Foto de perfil do colaborador (vinda de users.profile_image_url). Nem todos têm uma. */
  fotoUrl?: string;
}

export type TipoCampo =
  | "texto"
  | "texto_longo"
  | "numero"
  | "data"
  | "select"
  | "radio"
  | "checkbox"
  | "escala";

export interface CondicaoCampo {
  /** id do campo cuja resposta controla a exibição deste campo */
  campoId: string;
  /** valor (ou um dos valores) que ativa a exibição */
  valorEsperado: string | string[];
}

export interface CampoFormulario {
  id: string;
  tipo: TipoCampo;
  label: string;
  descricao?: string;
  placeholder?: string;
  obrigatorio: boolean;
  opcoes?: string[];
  /** Texto de apoio por opção (mesmo índice de `opcoes`) — some, e.g. escala, para mostrar o "significado" de cada nota em um tooltip. */
  opcoesDescricoes?: string[];
  condicional?: CondicaoCampo;
}

export interface SecaoFormulario {
  id: string;
  titulo: string;
  descricao?: string;
  campos: CampoFormulario[];
}

export type StatusFormulario = "ativo" | "rascunho" | "encerrado";

export interface Formulario {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: StatusFormulario;
  /** convenção futura de tabela no Supabase, ver nota de topo do arquivo */
  tabela: string;
  estimativaMinutos: number;
  prazo?: string;
  criadoEm: string;
  secoes: SecaoFormulario[];
}

export interface Atribuicao {
  id: string;
  formularioId: string;
  colaboradorId: string;
  status: StatusAcesso;
  liberadoEm?: string;
  respondidoEm?: string;
  prazo?: string;
}

export interface RespostaCampo {
  campoId: string;
  valor: string | string[];
}

export interface RespostaFormulario {
  id: string;
  formularioId: string;
  colaboradorId: string;
  enviadoEm: string;
  tempoGastoMinutos: number;
  campos: RespostaCampo[];
}

/** Respostas em preenchimento: id do campo -> valor. */
export type RespostasMapa = Record<string, string | string[]>;

/** Snapshot do preenchimento (tabela formularios_rascunhos). */
export interface Rascunho {
  respostas: RespostasMapa;
  secaoAtual: number;
  versao: number;
  /** ISO timestamp do último salvamento. */
  atualizadoEm: string;
}
