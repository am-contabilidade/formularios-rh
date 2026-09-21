"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2, LifeBuoy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CampoInput } from "@/components/colaborador/campo-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { escalaAvaliacaoLegenda } from "@/lib/perguntas/mapeamento-competencias-fiscal";
import type { Colaborador, SecaoFormulario } from "@/lib/types";

type RespostasState = Record<string, string | string[]>;

const EMAIL_SUPORTE = "rh@amcontabilidadeonline.com.br";

export function PerguntasFlow({
  secoes,
  colaboradorAtual,
  mensagemFinal,
}: {
  secoes: SecaoFormulario[];
  colaboradorAtual: Colaborador;
  mensagemFinal?: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [respostas, setRespostas] = useState<RespostasState>({});

  const totalSteps = secoes.length + (mensagemFinal ? 1 : 0);
  const isMensagemFinal = mensagemFinal !== undefined && stepIndex === secoes.length;
  const secaoAtual = isMensagemFinal ? undefined : secoes[stepIndex];
  const isPrimeira = stepIndex === 0;
  const isUltima = stepIndex === totalSteps - 1;
  const isConfirmacaoPerfil =
    secaoAtual?.campos.some((campo) => campo.id === "nome-completo") ?? false;

  // O nome vem pronto do perfil — o colaborador só confirma, não digita de novo.
  useEffect(() => {
    if (isConfirmacaoPerfil) {
      setRespostas((prev) => ({ ...prev, "nome-completo": colaboradorAtual.nome }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmacaoPerfil, colaboradorAtual.nome]);

  function setValor(campoId: string, valor: string | string[]) {
    setRespostas((prev) => ({ ...prev, [campoId]: valor }));
  }

  function voltar() {
    if (!isPrimeira) setStepIndex((s) => s - 1);
  }

  function avancar() {
    if (!isUltima) setStepIndex((s) => s + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13px] font-medium tracking-[0.3px] text-graphite uppercase">
          {isMensagemFinal ? "Conclusão" : `Seção ${stepIndex + 1} de ${secoes.length}`}
        </span>
        <span className="rounded-full bg-marigold/20 px-3 py-1 text-[12px] font-medium text-saffron">
          Pré-visualização — ainda não salva no banco
        </span>
      </div>

      <Progress value={((stepIndex + 1) / totalSteps) * 100} className="h-1.5" />

      <div className="rounded-2xl border border-black/6 bg-white p-6 shadow-elevated sm:p-8">
        {isMensagemFinal ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-blue/10 text-blue">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="text-[24px] leading-[1.38] font-semibold text-ink">
              Formulário concluído
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed text-graphite">{mensagemFinal}</p>
          </div>
        ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-[24px] leading-[1.38] font-semibold text-ink">
              {secaoAtual!.titulo}
            </h2>
            {secaoAtual!.descricao ? (
              <p className="text-[14px] text-graphite">{secaoAtual!.descricao}</p>
            ) : null}
          </div>
          {secaoAtual!.id === "secao-2-escala-avaliacao" ? (
            <div className="overflow-hidden rounded-xl border border-black/6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-paper hover:bg-paper">
                    <TableHead className="w-20">Nota</TableHead>
                    <TableHead className="w-40">Nível</TableHead>
                    <TableHead>Significado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escalaAvaliacaoLegenda.map((linha) => (
                    <TableRow key={linha.nota}>
                      <TableCell className="font-semibold text-ink">{linha.nota}</TableCell>
                      <TableCell className="font-medium text-ink">{linha.nivel}</TableCell>
                      <TableCell className="text-graphite">{linha.significado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <div className="flex flex-col gap-7">
            {secaoAtual!.campos.map((campo) =>
              campo.id === "nome-completo" ? (
                <div key={campo.id} className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium text-ink">{campo.label}</span>
                  <div className="flex items-center gap-4 rounded-xl border border-black/6 bg-paper p-4">
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue text-white">
                      {colaboradorAtual.fotoUrl ?? colaboradorAtual.iconeUrl ? (
                        <Image
                          src={(colaboradorAtual.fotoUrl ?? colaboradorAtual.iconeUrl)!}
                          alt=""
                          width={112}
                          height={112}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-[16px] font-semibold">{colaboradorAtual.iniciais}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[20px] leading-[1.2] font-semibold text-ink">
                        {colaboradorAtual.nome}
                      </span>
                      <span className="text-[13px] text-graphite">
                        Puxado do seu perfil. Se estiver errado, use &quot;Contatar suporte&quot;.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <CampoInput
                  key={campo.id}
                  campo={campo}
                  value={respostas[campo.id]}
                  onChange={(valor) => setValor(campo.id, valor)}
                />
              )
            )}
          </div>
        </div>
        )}
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={voltar} disabled={isPrimeira}>
          <ArrowLeft />
          Voltar
        </Button>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {isConfirmacaoPerfil ? (
            <Button
              variant="ghost"
              render={
                <a
                  href={`mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(
                    "Suporte - Mapeamento de Competências"
                  )}`}
                />
              }
              nativeButton={false}
            >
              <LifeBuoy />
              Contatar suporte
            </Button>
          ) : null}
          <Button onClick={avancar} disabled={isUltima}>
            {isMensagemFinal ? (
              <>
                <Send />
                Enviar respostas (em breve)
              </>
            ) : isUltima ? (
              "Próxima seção em breve"
            ) : isConfirmacaoPerfil ? (
              "Confirmar e próximo"
            ) : (
              "Avançar"
            )}
            {!isUltima && !isMensagemFinal ? <ArrowRight /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
