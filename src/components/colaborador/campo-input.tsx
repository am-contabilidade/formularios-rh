"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CampoFormulario } from "@/lib/types";

/** "1 — Não domino" -> "1" (o nível some da tela, mas continua no tooltip) */
function notaOpcaoEscala(opcao: string) {
  return opcao.split(" — ")[0];
}

export function CampoInput({
  campo,
  value,
  onChange,
}: {
  campo: CampoFormulario;
  value: string | string[] | undefined;
  onChange: (valor: string | string[]) => void;
}) {
  const textoValor = typeof value === "string" ? value : "";
  const listaValor = Array.isArray(value) ? value : [];

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={campo.id} className="text-[14px] font-semibold text-ink">
        {campo.label}
        {campo.obrigatorio ? <span className="text-blue"> *</span> : null}
      </Label>
      {campo.descricao ? (
        <p className="-mt-1 text-[13px] text-graphite">{campo.descricao}</p>
      ) : null}

      {(campo.tipo === "texto" || campo.tipo === "numero") && (
        <Input
          id={campo.id}
          type={campo.tipo === "numero" ? "number" : "text"}
          placeholder={campo.placeholder}
          value={textoValor}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {campo.tipo === "data" && (
        <Input
          id={campo.id}
          type="date"
          value={textoValor}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {campo.tipo === "texto_longo" && (
        <Textarea
          id={campo.id}
          placeholder={campo.placeholder}
          rows={4}
          value={textoValor}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {campo.tipo === "select" && (
        <Select value={textoValor || undefined} onValueChange={(v) => onChange(v ?? "")}>
          <SelectTrigger id={campo.id} className="w-full">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            {campo.opcoes?.map((opcao) => (
              <SelectItem key={opcao} value={opcao}>
                {opcao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {campo.tipo === "radio" && (
        <RadioGroup value={textoValor} onValueChange={(v) => onChange(v)} className="gap-2.5">
          {campo.opcoes?.map((opcao) => (
            <label key={opcao} className="flex items-center gap-2.5 text-[14px] text-ink">
              <RadioGroupItem value={opcao} />
              {opcao}
            </label>
          ))}
        </RadioGroup>
      )}

      {campo.tipo === "escala" && (
        <RadioGroup
          value={textoValor}
          onValueChange={(v) => onChange(v)}
          className="flex flex-row flex-wrap gap-5"
        >
          {campo.opcoes?.map((opcao, index) => {
            const nota = notaOpcaoEscala(opcao);
            const significado = campo.opcoesDescricoes?.[index];
            const label = (
              <label className="flex flex-col items-center gap-1.5 text-[13px] font-medium text-graphite">
                <RadioGroupItem value={opcao} />
                <span className="text-ink">{nota}</span>
              </label>
            );
            return significado ? (
              <Tooltip key={opcao}>
                <TooltipTrigger render={label} />
                <TooltipContent>{significado}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={opcao}>{label}</div>
            );
          })}
        </RadioGroup>
      )}

      {campo.tipo === "checkbox" && (
        <div className="flex flex-col gap-2.5">
          {campo.opcoes?.map((opcao) => {
            const marcado = listaValor.includes(opcao);
            return (
              <label key={opcao} className="flex items-center gap-2.5 text-[14px] text-ink">
                <Checkbox
                  checked={marcado}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...listaValor, opcao]
                      : listaValor.filter((v) => v !== opcao);
                    onChange(next);
                  }}
                />
                {opcao}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
