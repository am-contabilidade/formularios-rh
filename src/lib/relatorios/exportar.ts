import "server-only";
import ExcelJS from "exceljs";
import type { RelatorioColaborador } from "@/lib/relatorios/relatorio-colaborador";

/** Azul de ação do sistema (DESIGN.md) e texto do cabeçalho. */
const AZUL = "FF2563EB";
const BRANCO = "FFFFFFFF";
const CINZA_ROTULO = "FF5B6577";

function formatarData(data: string) {
  return new Date(`${data.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR");
}

/** "Mapeamento de Competências — Fiscal" → "mapeamento-de-competencias-fiscal". */
function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nomeArquivoRelatorio(relatorio: RelatorioColaborador, extensao: "xlsx" | "csv") {
  return `relatorio-${slug(relatorio.formulario.titulo)}-${slug(relatorio.colaborador.nome)}.${extensao}`;
}

function estilizarCabecalho(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: BRANCO } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AZUL } };
  row.alignment = { vertical: "middle" };
  row.height = 20;
}

export async function gerarXlsx(relatorio: RelatorioColaborador): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Formulários RH";
  wb.created = new Date();

  // ── Aba "Respostas": identificação + tabela ────────────────────────────
  const ws = wb.addWorksheet("Respostas", { views: [{ showGridLines: false }] });
  ws.columns = [
    { key: "secao", width: 36 },
    { key: "pergunta", width: 60 },
    { key: "resposta", width: 48 },
    { key: "nota", width: 8 },
  ];

  const titulo = ws.addRow([`Relatório — ${relatorio.formulario.titulo}`]);
  titulo.font = { bold: true, size: 14 };
  ws.addRow([]);

  const { colaborador } = relatorio;
  const identificacao: [string, string][] = [
    ["Colaborador", colaborador.nome],
    ["E-mail", colaborador.email],
    ["E-mail pessoal", colaborador.emailPessoal ?? "—"],
    ["Cargo", colaborador.cargo || "—"],
    ["Departamento", colaborador.departamento || "—"],
    ["Formulário", relatorio.formulario.titulo],
    ["Categoria", relatorio.formulario.categoria],
    ["Enviado em", formatarData(relatorio.enviadoEm)],
    ["Tempo gasto", `${relatorio.tempoGastoMinutos} min`],
  ];
  for (const [rotulo, valor] of identificacao) {
    const row = ws.addRow([rotulo, valor]);
    row.getCell(1).font = { bold: true, color: { argb: CINZA_ROTULO } };
  }
  ws.addRow([]);

  const cabecalho = ws.addRow(["Seção", "Pergunta", "Resposta", "Nota"]);
  estilizarCabecalho(cabecalho);
  const linhaCabecalho = cabecalho.number;

  for (const linha of relatorio.linhas) {
    const row = ws.addRow([linha.secao, linha.pergunta, linha.resposta, linha.nota ?? null]);
    row.alignment = { vertical: "top", wrapText: true };
    row.getCell(4).alignment = { vertical: "top", horizontal: "center" };
  }

  ws.autoFilter = {
    from: { row: linhaCabecalho, column: 1 },
    to: { row: linhaCabecalho + relatorio.linhas.length, column: 4 },
  };
  ws.views = [{ state: "frozen", ySplit: linhaCabecalho, showGridLines: false }];

  // ── Aba "Resumo": média por seção ─────────────────────────────────────
  const resumo = wb.addWorksheet("Resumo", { views: [{ showGridLines: false }] });
  resumo.columns = [
    { key: "secao", width: 48 },
    { key: "media", width: 14 },
    { key: "qtd", width: 22 },
  ];
  const tituloResumo = resumo.addRow([`Médias por seção — ${colaborador.nome}`]);
  tituloResumo.font = { bold: true, size: 14 };
  resumo.addRow(["Notas de 1 a 5; respostas N/A não entram na média."]).font = {
    italic: true,
    color: { argb: CINZA_ROTULO },
  };
  resumo.addRow([]);
  estilizarCabecalho(resumo.addRow(["Seção", "Média", "Perguntas avaliadas"]));
  for (const m of relatorio.medias) {
    const row = resumo.addRow([m.secao, m.media ?? "—", m.perguntasAvaliadas]);
    row.getCell(2).numFmt = "0.0";
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(3).alignment = { horizontal: "center" };
  }
  const geral = resumo.addRow(["Média geral", relatorio.mediaGeral ?? "—", ""]);
  geral.font = { bold: true };
  geral.getCell(2).numFmt = "0.0";
  geral.getCell(2).alignment = { horizontal: "center" };

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** Campo CSV: aspas sempre, aspas internas duplicadas. */
function campoCsv(valor: string | number | undefined) {
  const texto = valor === undefined ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

/**
 * CSV com `;` e BOM UTF-8 (o Excel em pt-BR abre direto com acentos e colunas
 * certas): identificação uma única vez no topo, linha em branco e a tabela de
 * respostas (uma linha por pergunta).
 */
export function gerarCsv(relatorio: RelatorioColaborador): string {
  const linha = (valores: (string | number | undefined)[]) => valores.map(campoCsv).join(";");
  const identificacao = [
    linha(["Colaborador", relatorio.colaborador.nome]),
    linha(["E-mail", relatorio.colaborador.email]),
    linha(["Formulário", relatorio.formulario.titulo]),
    linha(["Enviado em", formatarData(relatorio.enviadoEm)]),
  ];
  const tabela = [
    linha(["Seção", "Pergunta", "Resposta", "Nota"]),
    ...relatorio.linhas.map((l) => linha([l.secao, l.pergunta, l.resposta, l.nota])),
  ];
  return "﻿" + [...identificacao, "", ...tabela].join("\r\n") + "\r\n";
}
