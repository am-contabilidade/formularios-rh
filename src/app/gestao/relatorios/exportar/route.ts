import { auth } from "@/auth";
import { montarRelatorioColaborador } from "@/lib/relatorios/relatorio-colaborador";
import { gerarCsv, gerarXlsx, nomeArquivoRelatorio } from "@/lib/relatorios/exportar";

const TIPOS = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv; charset=utf-8",
} as const;

/**
 * GET /gestao/relatorios/exportar?formulario=<id>&colaborador=<id>&formato=xlsx|csv
 * Download do relatório individual. O proxy já protege /gestao; aqui a
 * sessão é conferida de novo porque o arquivo contém dados pessoais.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.perfil !== "gestao") {
    return new Response("Acesso negado.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const formularioId = searchParams.get("formulario");
  const colaboradorId = searchParams.get("colaborador");
  const formato = searchParams.get("formato");

  if (!formularioId || !colaboradorId || (formato !== "xlsx" && formato !== "csv")) {
    return new Response("Parâmetros inválidos: informe formulario, colaborador e formato (xlsx ou csv).", {
      status: 400,
    });
  }

  const relatorio = await montarRelatorioColaborador(formularioId, colaboradorId);
  if (!relatorio) {
    return new Response("Nenhuma resposta enviada por esse colaborador neste formulário.", {
      status: 404,
    });
  }

  const nome = nomeArquivoRelatorio(relatorio, formato);
  const corpo = formato === "xlsx" ? new Uint8Array(await gerarXlsx(relatorio)) : gerarCsv(relatorio);

  return new Response(corpo, {
    headers: {
      "Content-Type": TIPOS[formato],
      "Content-Disposition": `attachment; filename="${nome}"; filename*=UTF-8''${encodeURIComponent(nome)}`,
      "Cache-Control": "no-store",
    },
  });
}
