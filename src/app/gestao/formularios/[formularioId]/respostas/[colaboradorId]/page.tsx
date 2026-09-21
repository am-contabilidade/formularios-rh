import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck2, Clock3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RespostaFormularioView } from "@/components/resposta-formulario-view";
import {
  getColaboradorById,
  getFormularioById,
  getRespostaByAtribuicao,
} from "@/lib/data";

function formatarData(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function GestaoRespostaColaboradorPage({
  params,
}: {
  params: Promise<{ formularioId: string; colaboradorId: string }>;
}) {
  const { formularioId, colaboradorId } = await params;
  const [formulario, colaborador, resposta] = await Promise.all([
    getFormularioById(formularioId),
    getColaboradorById(colaboradorId),
    getRespostaByAtribuicao(formularioId, colaboradorId),
  ]);

  if (!formulario || !colaborador || !resposta) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/gestao/formularios/${formularioId}`}
        className="inline-flex w-fit items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {formulario.titulo}
      </Link>

      <div className="flex flex-col gap-5 rounded-lg border border-black/8 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 rounded-lg after:rounded-lg">
            <AvatarFallback className="rounded-lg bg-blue text-[15px] text-white">
              {colaborador.iniciais}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="text-[20px] font-semibold text-ink">{colaborador.nome}</span>
            <span className="text-[14px] text-graphite">
              {colaborador.cargo} &middot; {colaborador.funcao}
            </span>
            <span className="text-[13px] text-graphite">{colaborador.email}</span>
            {colaborador.emailPessoal ? (
              <span className="text-[12px] text-stone">Pessoal: {colaborador.emailPessoal}</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-[13px] text-graphite sm:items-end">
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck2 className="size-4" />
            Enviado em {formatarData(resposta.enviadoEm)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-4" />
            {resposta.tempoGastoMinutos} minutos gastos
          </span>
        </div>
      </div>

      <RespostaFormularioView formulario={formulario} resposta={resposta} />
    </div>
  );
}
