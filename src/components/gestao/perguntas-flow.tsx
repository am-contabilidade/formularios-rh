"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2, LifeBuoy, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
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
import {
  escalaAvaliacaoLegenda as escalaAvaliacaoLegendaPadrao,
  type EscalaCompetenciaItem,
} from "@/lib/perguntas/escala-competencia";
import { camposPendentes } from "@/lib/perguntas/validacao";
import type { Colaborador, RespostasMapa, SecaoFormulario } from "@/lib/types";

const EMAIL_SUPORTE = "rh@amcontabilidadeonline.com.br";

interface PropsBase {
  secoes: SecaoFormulario[];
  colaboradorAtual: Colaborador;
  mensagemFinal?: string;
  legendaEscala?: EscalaCompetenciaItem[];
}

/** Prévia da gestão: navegação livre, nada é salvo. */
export function PerguntasFlow(props: PropsBase) {
  const [stepIndex, setStepIndex] = useState(0);
  const [respostas, setRespostas] = useState<RespostasMapa>({});
  return (
    <PerguntasFlowView
      {...props}
      modo="previa"
      respostas={respostas}
      onValor={(campoId, valor) => setRespostas((prev) => ({ ...prev, [campoId]: valor }))}
      stepIndex={stepIndex}
      onStepChange={setStepIndex}
    />
  );
}

/**
 * Tela do fluxo de perguntas, controlada por props. Usada pela prévia da
 * gestão e pelo preenchimento do colaborador (que salva rascunho e envia).
 */
export function PerguntasFlowView({
  secoes,
  colaboradorAtual,
  mensagemFinal,
  legendaEscala = escalaAvaliacaoLegendaPadrao,
  modo,
  respostas,
  onValor,
  stepIndex,
  onStepChange,
  indicador,
  onEnviar,
  enviando = false,
}: PropsBase & {
  modo: "previa" | "resposta";
  respostas: RespostasMapa;
  onValor: (campoId: string, valor: string | string[]) => void;
  stepIndex: number;
  onStepChange: (indice: number) => void;
  /** Ex.: indicador de salvamento do rascunho, no topo à direita. */
  indicador?: ReactNode;
  onEnviar?: () => void;
  enviando?: boolean;
}) {
  const emResposta = modo === "resposta";
  const totalSteps = secoes.length + (mensagemFinal ? 1 : 0);
  const isMensagemFinal = mensagemFinal !== undefined && stepIndex === secoes.length;
  const secaoAtual = isMensagemFinal ? undefined : secoes[stepIndex];
  const isPrimeira = stepIndex === 0;
  const isUltima = stepIndex === totalSteps - 1;
  const isConfirmacaoPerfil =
    secaoAtual?.campos.some((campo) => campo.id === "nome-completo") ?? false;

  // O nome vem pronto do perfil — o colaborador só confirma, não digita de novo.
  useEffect(() => {
    if (isConfirmacaoPerfil && respostas["nome-completo"] !== colaboradorAtual.nome) {
      onValor("nome-completo", colaboradorAtual.nome);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmacaoPerfil, colaboradorAtual.nome]);

  function irPara(indice: number) {
    onStepChange(indice);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function voltar() {
    if (!isPrimeira) irPara(stepIndex - 1);
  }

  function avancar() {
    if (isUltima) return;
    if (emResposta && secaoAtual) {
      const pendentes = camposPendentes(secaoAtual, respostas);
      if (pendentes.length > 0) {
        toast.error(
          pendentes.length === 1
            ? "Responda a pergunta obrigatória para avançar"
            : `Responda as ${pendentes.length} perguntas obrigatórias para avançar`
        );
        document
          .querySelector(`[data-campo-id="${pendentes[0].id}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    irPara(stepIndex + 1);
  }

  const podeEnviar = emResposta && isUltima && !!onEnviar;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
          {isMensagemFinal ? "Conclusão" : `Seção ${stepIndex + 1} de ${secoes.length}`}
        </span>
        {emResposta ? (
          indicador
        ) : (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-800">
            Pré-visualização — nada é salvo
          </span>
        )}
      </div>

      <Progress value={((stepIndex + 1) / totalSteps) * 100} className="h-1.5" />

      <div className="rounded-xl border border-border bg-card p-6 shadow-elevated sm:p-8">
        {isMensagemFinal ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="font-heading text-[24px] leading-[1.38] font-semibold text-foreground">
              {emResposta ? "Pronto para enviar" : "Formulário concluído"}
            </h2>
            {emResposta ? (
              <p className="max-w-md text-[15px] leading-relaxed text-foreground">
                Você passou por todas as seções. Depois de enviar, não será possível alterar as
                respostas — use &quot;Voltar&quot; se quiser revisar algo.
              </p>
            ) : null}
            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">{mensagemFinal}</p>
          </div>
        ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-[24px] leading-[1.38] font-semibold text-foreground">
              {secaoAtual!.titulo}
            </h2>
            {secaoAtual!.descricao ? (
              <p className="text-[14px] text-muted-foreground">{secaoAtual!.descricao}</p>
            ) : null}
          </div>
          {secaoAtual!.id === "secao-2-escala-avaliacao" ? (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="w-20">Nota</TableHead>
                    <TableHead className="w-40">Nível</TableHead>
                    <TableHead>Significado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {legendaEscala.map((linha) => (
                    <TableRow key={linha.nota}>
                      <TableCell className="font-semibold text-foreground">{linha.nota}</TableCell>
                      <TableCell className="font-medium text-foreground">{linha.nivel}</TableCell>
                      <TableCell className="text-muted-foreground">{linha.significado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <div className="flex flex-col gap-7">
            {secaoAtual!.campos.map((campo) =>
              campo.id === "nome-completo" ? (
                <div key={campo.id} data-campo-id={campo.id} className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium text-foreground">{campo.label}</span>
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-muted p-4">
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
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
                      <span className="text-[20px] leading-[1.2] font-semibold text-foreground">
                        {colaboradorAtual.nome}
                      </span>
                      <span className="text-[13px] text-muted-foreground">
                        Puxado do seu perfil. Se estiver errado, use &quot;Contatar suporte&quot;.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={campo.id} data-campo-id={campo.id} className="scroll-mt-24">
                  <CampoInput
                    campo={campo}
                    value={respostas[campo.id]}
                    onChange={(valor) => onValor(campo.id, valor)}
                  />
                </div>
              )
            )}
          </div>
        </div>
        )}
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={voltar} disabled={isPrimeira || enviando}>
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
          {podeEnviar ? (
            <Button onClick={onEnviar} disabled={enviando}>
              {enviando ? <Loader2 className="animate-spin" /> : <Send />}
              {enviando ? "Enviando…" : "Enviar respostas"}
            </Button>
          ) : (
            <Button onClick={avancar} disabled={isUltima}>
              {isMensagemFinal ? (
                <>
                  <Send />
                  Envio disponível só para o colaborador
                </>
              ) : isConfirmacaoPerfil ? (
                "Confirmar e próximo"
              ) : (
                "Avançar"
              )}
              {!isUltima && !isMensagemFinal ? <ArrowRight /> : null}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
