"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CampoInput } from "@/components/colaborador/campo-input";
import { RespostaFormularioView } from "@/components/resposta-formulario-view";
import type { CampoFormulario, Formulario } from "@/lib/types";

type RespostasState = Record<string, string | string[]>;

function estaPreenchido(valor: string | string[] | undefined) {
  if (Array.isArray(valor)) return valor.length > 0;
  return !!valor && valor.trim().length > 0;
}

export function FormularioWizard({
  formulario,
  colaboradorId,
}: {
  formulario: Formulario;
  colaboradorId: string;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [respostas, setRespostas] = useState<RespostasState>({});

  const todosCampos = useMemo(
    () => formulario.secoes.flatMap((s) => s.campos),
    [formulario]
  );

  function campoVisivel(campo: CampoFormulario) {
    if (!campo.condicional) return true;
    const valorAtual = respostas[campo.condicional.campoId];
    const esperado = campo.condicional.valorEsperado;
    if (Array.isArray(esperado)) {
      return typeof valorAtual === "string" && esperado.includes(valorAtual);
    }
    return valorAtual === esperado;
  }

  const totalSteps = formulario.secoes.length + 1;
  const isReview = stepIndex === formulario.secoes.length;
  const secaoAtual = !isReview ? formulario.secoes[stepIndex] : undefined;
  const camposVisiveis = secaoAtual ? secaoAtual.campos.filter(campoVisivel) : [];

  const podeAvancar = camposVisiveis.every(
    (campo) => !campo.obrigatorio || estaPreenchido(respostas[campo.id])
  );

  function setValor(campoId: string, valor: string | string[]) {
    setRespostas((prev) => ({ ...prev, [campoId]: valor }));
  }

  function avancar() {
    if (stepIndex < totalSteps - 1) setStepIndex((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function voltar() {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enviar() {
    toast.success("Respostas enviadas com sucesso", {
      description: formulario.titulo,
    });
    router.push(`/colaborador/formularios/${formulario.id}/sucesso`);
  }

  const respostaPreview = {
    id: "preview",
    formularioId: formulario.id,
    colaboradorId,
    enviadoEm: new Date().toISOString().slice(0, 10),
    tempoGastoMinutos: 0,
    campos: todosCampos
      .filter((campo) => campoVisivel(campo) && estaPreenchido(respostas[campo.id]))
      .map((campo) => ({ campoId: campo.id, valor: respostas[campo.id]! })),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/colaborador/formularios/${formulario.id}`}
          className="inline-flex items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
        >
          <X className="size-4" />
          Cancelar
        </Link>
        <span className="text-[13px] font-medium tracking-[0.3px] text-graphite uppercase">
          {isReview ? "Revisão" : `Seção ${stepIndex + 1} de ${formulario.secoes.length}`}
        </span>
      </div>

      <Progress value={((stepIndex + 1) / totalSteps) * 100} className="h-1.5" />

      <div className="rounded-lg border border-black/8 bg-white p-6 sm:p-8">
        {!isReview && secaoAtual ? (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-[24px] leading-[1.38] font-semibold text-ink">
                {secaoAtual.titulo}
              </h2>
              {secaoAtual.descricao ? (
                <p className="text-[14px] text-graphite">{secaoAtual.descricao}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-7">
              {camposVisiveis.map((campo) => (
                <CampoInput
                  key={campo.id}
                  campo={campo}
                  value={respostas[campo.id]}
                  onChange={(valor) => setValor(campo.id, valor)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[24px] leading-[1.38] font-semibold text-ink">
                Revise suas respostas
              </h2>
              <p className="text-[14px] text-graphite">
                Confira as informações abaixo antes de enviar. Você poderá voltar para ajustar
                qualquer seção.
              </p>
            </div>
            {respostaPreview.campos.length === 0 ? (
              <p className="text-[14px] text-graphite">Nenhuma resposta preenchida ainda.</p>
            ) : (
              <RespostaFormularioView formulario={formulario} resposta={respostaPreview} />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={voltar} disabled={stepIndex === 0}>
          <ArrowLeft />
          Voltar
        </Button>
        {isReview ? (
          <Button size="lg" onClick={enviar}>
            <Check />
            Enviar respostas
          </Button>
        ) : (
          <Button onClick={avancar} disabled={!podeAvancar}>
            Avançar
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
