/**
 * Escala 1–5/N/A usada nas "grades de múltipla escolha" dos formulários de
 * mapeamento de competências. A maioria dos formulários reaproveita a
 * mesma legenda (`escalaAvaliacaoLegenda`), mas cada docx pode definir a
 * sua própria redação — por isso `criarCampoCompetencia` recebe a legenda
 * como parâmetro em vez de fixá-la.
 */
import type { CampoFormulario } from "@/lib/types";

export interface EscalaCompetenciaItem {
  nota: string;
  nivel: string;
  significado: string;
}

export const escalaAvaliacaoLegenda: EscalaCompetenciaItem[] = [
  { nota: "1", nivel: "Não domino", significado: "Não possuo conhecimento suficiente para executar" },
  { nota: "2", nivel: "Básico", significado: "Conheço o conceito, mas preciso de orientação" },
  { nota: "3", nivel: "Intermediário", significado: "Executo atividades rotineiras com autonomia" },
  { nota: "4", nivel: "Avançado", significado: "Executo com autonomia e soluciono problemas" },
  { nota: "5", nivel: "Referência", significado: "Domino situações complexas e consigo orientar outros" },
  { nota: "N/A", nivel: "Não se aplica", significado: "Não faz parte das minhas atividades" },
];

/** Gera o `campoCompetencia(id, label)` de um formulário a partir da legenda dele. */
export function criarCampoCompetencia(legenda: EscalaCompetenciaItem[]) {
  const opcoes = legenda.map((item) => `${item.nota} — ${item.nivel}`);
  const opcoesDescricoes = legenda.map((item) => item.significado);

  return function campoCompetencia(id: string, label: string): CampoFormulario {
    return {
      id,
      tipo: "escala",
      label,
      obrigatorio: true,
      opcoes,
      opcoesDescricoes,
    };
  };
}

/** Atalho pronto para os formulários que usam a legenda padrão. */
export const campoCompetencia = criarCampoCompetencia(escalaAvaliacaoLegenda);
