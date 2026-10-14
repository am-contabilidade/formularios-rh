/** Link de download do relatório individual (route handler /gestao/relatorios/exportar). */
export function urlExportacao(formularioId: string, colaboradorId: string, formato: "xlsx" | "csv") {
  const params = new URLSearchParams({ formulario: formularioId, colaborador: colaboradorId, formato });
  return `/gestao/relatorios/exportar?${params}`;
}
