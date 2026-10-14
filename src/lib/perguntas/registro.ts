/**
 * Liga cada formulário (pelo título, como está salvo no banco) ao seu
 * conjunto de perguntas em memória. Conforme os formulários forem
 * persistidos de verdade em `formularios_secoes`/`formularios_campos`, esse
 * registro deixa de ser necessário.
 */
import type { SecaoFormulario } from "@/lib/types";
import { escalaAvaliacaoLegenda, type EscalaCompetenciaItem } from "@/lib/perguntas/escala-competencia";
import {
  mensagemFinalMapeamentoCompetenciasFiscal,
  secoesMapeamentoCompetenciasFiscal,
} from "@/lib/perguntas/mapeamento-competencias-fiscal";
import {
  mensagemFinalMapeamentoCompetenciasLegalizacao,
  secoesMapeamentoCompetenciasLegalizacao,
} from "@/lib/perguntas/mapeamento-competencias-legalizacao";
import {
  escalaDominioTecnicoContabil,
  mensagemFinalMapeamentoCompetenciasContabil,
  secoesMapeamentoCompetenciasContabil,
} from "@/lib/perguntas/mapeamento-competencias-contabil";

interface PerguntasFormulario {
  secoes: SecaoFormulario[];
  mensagemFinal: string;
  legendaEscala: EscalaCompetenciaItem[];
}

const REGISTRO_POR_TITULO: Record<string, PerguntasFormulario> = {
  "Mapeamento de Competências — Fiscal": {
    secoes: secoesMapeamentoCompetenciasFiscal,
    mensagemFinal: mensagemFinalMapeamentoCompetenciasFiscal,
    legendaEscala: escalaAvaliacaoLegenda,
  },
  "Mapeamento de Competências Técnicas — Legalização": {
    secoes: secoesMapeamentoCompetenciasLegalizacao,
    mensagemFinal: mensagemFinalMapeamentoCompetenciasLegalizacao,
    legendaEscala: escalaAvaliacaoLegenda,
  },
  "Mapeamento de Competências Técnicas — Analista Contábil": {
    secoes: secoesMapeamentoCompetenciasContabil,
    mensagemFinal: mensagemFinalMapeamentoCompetenciasContabil,
    legendaEscala: escalaDominioTecnicoContabil,
  },
};

export function getPerguntasPorTituloFormulario(titulo: string): PerguntasFormulario | undefined {
  return REGISTRO_POR_TITULO[titulo];
}

/** Perguntas de um formulário do banco (casadas pelo título). */
export function getPerguntasDoFormulario(formulario: { titulo: string }) {
  return getPerguntasPorTituloFormulario(formulario.titulo);
}

export type { PerguntasFormulario };
