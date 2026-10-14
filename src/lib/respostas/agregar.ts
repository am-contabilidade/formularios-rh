/**
 * Agrega as respostas de um formulário por seção/pergunta para o painel de
 * respostas da gestão. Roda no servidor: o cliente recebe só as contagens,
 * nunca as respostas brutas de todos os colaboradores.
 */
import type { CampoFormulario, RespostaFormulario, SecaoFormulario } from "@/lib/types";

export interface OpcaoContagem {
  /** Valor gravado, ex.: "3 — Intermediário". */
  opcao: string;
  /** Rótulo curto no eixo, ex.: "3" ou "N/A". */
  rotulo: string;
  /** Texto do tooltip, ex.: "Intermediário — Executo atividades…". */
  descricao?: string;
  qtd: number;
}

export interface TextoResposta {
  colaboradorId: string;
  nome: string;
  valor: string;
}

export interface PerguntaAgregada {
  campo: CampoFormulario;
  /** Quantos responderam esta pergunta (no recorte atual). */
  respondentes: number;
  /** Escala, radio, select e checkbox. */
  distribuicao?: OpcaoContagem[];
  /** Média das notas numéricas (escala), ignorando N/A. */
  media?: number;
  /** Texto livre. */
  textos?: TextoResposta[];
}

export interface SecaoAgregada {
  secao: SecaoFormulario;
  perguntas: PerguntaAgregada[];
  /** Média das notas de todas as perguntas de escala da seção. */
  media?: number;
}

/** Campos que não fazem sentido no painel (já identificam o colaborador). */
const CAMPOS_OCULTOS = new Set(["nome-completo"]);

const TIPOS_COM_OPCOES = new Set(["escala", "radio", "select", "checkbox"]);

/** "3 — Intermediário" → 3; "N/A — …" → undefined. */
export function notaDaOpcao(opcao: string): number | undefined {
  const nota = Number(opcao.split(" — ")[0]);
  return Number.isFinite(nota) ? nota : undefined;
}

function opcoesDoCampo(campo: CampoFormulario): Omit<OpcaoContagem, "qtd">[] {
  return (campo.opcoes ?? []).map((opcao, i) => {
    if (campo.tipo !== "escala") return { opcao, rotulo: opcao };
    const [rotulo, nivel] = opcao.split(" — ");
    const significado = campo.opcoesDescricoes?.[i];
    return {
      opcao,
      rotulo,
      descricao: [nivel, significado].filter(Boolean).join(" — "),
    };
  });
}

function media(valores: number[]) {
  return valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : undefined;
}

export function agregarRespostas(
  secoes: SecaoFormulario[],
  respostas: RespostaFormulario[],
  nomes: Map<string, string>
): SecaoAgregada[] {
  const valoresPorResposta = respostas.map((r) => ({
    colaboradorId: r.colaboradorId,
    valores: new Map(r.campos.map((c) => [c.campoId, c.valor])),
  }));

  return secoes
    .map((secao): SecaoAgregada => {
      const notasSecao: number[] = [];

      const perguntas = secao.campos
        .filter((campo) => !CAMPOS_OCULTOS.has(campo.id))
        .map((campo): PerguntaAgregada => {
          const respondidas = valoresPorResposta
            .map((r) => ({ colaboradorId: r.colaboradorId, valor: r.valores.get(campo.id) }))
            .filter((r): r is { colaboradorId: string; valor: string | string[] } =>
              Array.isArray(r.valor) ? r.valor.length > 0 : !!r.valor
            );

          if (!TIPOS_COM_OPCOES.has(campo.tipo)) {
            return {
              campo,
              respondentes: respondidas.length,
              textos: respondidas.map((r) => ({
                colaboradorId: r.colaboradorId,
                nome: nomes.get(r.colaboradorId) ?? "Colaborador",
                valor: Array.isArray(r.valor) ? r.valor.join(", ") : r.valor,
              })),
            };
          }

          const contagem = new Map<string, number>();
          const notas: number[] = [];
          for (const { valor } of respondidas) {
            for (const v of Array.isArray(valor) ? valor : [valor]) {
              contagem.set(v, (contagem.get(v) ?? 0) + 1);
              if (campo.tipo === "escala") {
                const nota = notaDaOpcao(v);
                if (nota !== undefined) notas.push(nota);
              }
            }
          }
          notasSecao.push(...notas);

          return {
            campo,
            respondentes: respondidas.length,
            distribuicao: opcoesDoCampo(campo).map((o) => ({ ...o, qtd: contagem.get(o.opcao) ?? 0 })),
            media: campo.tipo === "escala" ? media(notas) : undefined,
          };
        });

      return { secao, perguntas, media: media(notasSecao) };
    })
    .filter((s) => s.perguntas.length > 0);
}
