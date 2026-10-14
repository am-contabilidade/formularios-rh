"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ColaboradorFormCard } from "@/components/colaborador/form-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Atribuicao, Formulario, StatusAcesso } from "@/lib/types";
import { filtrosStatusAcesso } from "@/lib/labels";

export interface ItemFormularioColaborador {
  atribuicao: Atribuicao;
  formulario: Formulario;
}

export function ColaboradorFormulariosLista({ itens }: { itens: ItemFormularioColaborador[] }) {
  const [filtro, setFiltro] = useState<StatusAcesso | "todos">("todos");

  const lista = itens.filter(
    ({ atribuicao }) => filtro === "todos" || atribuicao.status === filtro
  );

  return (
    <>
      <Tabs value={filtro} onValueChange={(value) => setFiltro(value as StatusAcesso | "todos")}>
        <TabsList>
          {filtrosStatusAcesso.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {lista.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum formulário encontrado"
          description="Não há formulários atribuídos a você com esse status."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map(({ atribuicao, formulario }) => (
            <ColaboradorFormCard
              key={atribuicao.id}
              formulario={formulario}
              atribuicao={atribuicao}
            />
          ))}
        </div>
      )}
    </>
  );
}
