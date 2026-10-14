import "server-only";
import { getColaboradorById, getFormularioById, getRespostaByAtribuicao } from "@/lib/data";
import { getPerguntasDoFormulario } from "@/lib/perguntas/registro";
import { notaDaOpcao } from "@/lib/respostas/agregar";

export interface LinhaRelatorio {
  secao: string;
  pergunta: string;
  resposta: string;
  /** Nota 1–5 das perguntas de escala; vazia em N/A e nos outros tipos. */
  nota?: number;
}

export interface MediaSecao {
  secao: string;
  media?: number;
  perguntasAvaliadas: number;
}

export interface RelatorioColaborador {
  colaborador: {
    nome: string;
    email: string;
    emailPessoal?: string;
    cargo: string;
    departamento: string;
  };
  formulario: { titulo: string; categoria: string };
  enviadoEm: string;
  tempoGastoMinutos: number;
  linhas: LinhaRelatorio[];
  medias: MediaSecao[];
  mediaGeral?: number;
}

/** Já aparece no cabeçalho do relatório (nome do colaborador). */
const CAMPOS_OMITIDOS = new Set(["nome-completo"]);

function media(valores: number[]) {
  return valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : undefined;
}

/**
 * Relatório de um colaborador em um formulário que ele enviou. As perguntas
 * vêm do registro em código (src/lib/perguntas), na ordem das seções.
 */
export async function montarRelatorioColaborador(
  formularioId: string,
  colaboradorId: string
): Promise<RelatorioColaborador | undefined> {
  const [formulario, colaborador, resposta] = await Promise.all([
    getFormularioById(formularioId),
    getColaboradorById(colaboradorId),
    getRespostaByAtribuicao(formularioId, colaboradorId),
  ]);
  if (!formulario || !colaborador || !resposta) return undefined;

  const perguntas = getPerguntasDoFormulario(formulario);
  if (!perguntas) return undefined;

  const valores = new Map(resposta.campos.map((c) => [c.campoId, c.valor]));
  const linhas: LinhaRelatorio[] = [];
  const medias: MediaSecao[] = [];
  const todasNotas: number[] = [];

  for (const secao of perguntas.secoes) {
    const notasSecao: number[] = [];
    let avaliadas = 0;

    for (const campo of secao.campos) {
      if (CAMPOS_OMITIDOS.has(campo.id)) continue;
      const valor = valores.get(campo.id);
      if (valor === undefined || (Array.isArray(valor) ? valor.length === 0 : valor === "")) continue;

      const texto = Array.isArray(valor) ? valor.join(", ") : valor;
      const nota = campo.tipo === "escala" && !Array.isArray(valor) ? notaDaOpcao(valor) : undefined;
      if (campo.tipo === "escala") avaliadas += 1;
      if (nota !== undefined) notasSecao.push(nota);

      linhas.push({ secao: secao.titulo, pergunta: campo.label, resposta: texto, nota });
    }

    if (avaliadas > 0) {
      medias.push({ secao: secao.titulo, media: media(notasSecao), perguntasAvaliadas: avaliadas });
      todasNotas.push(...notasSecao);
    }
  }

  return {
    colaborador: {
      nome: colaborador.nome,
      email: colaborador.email,
      emailPessoal: colaborador.emailPessoal,
      cargo: colaborador.cargo,
      departamento: colaborador.departamento,
    },
    formulario: { titulo: formulario.titulo, categoria: formulario.categoria },
    enviadoEm: resposta.enviadoEm,
    tempoGastoMinutos: resposta.tempoGastoMinutos,
    linhas,
    medias,
    mediaGeral: media(todasNotas),
  };
}
