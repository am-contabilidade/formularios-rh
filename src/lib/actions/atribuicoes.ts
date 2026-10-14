"use server";

import { revalidatePath } from "next/cache";
import { createAtribuicoes } from "@/lib/data";

export async function vincularColaboradores(formularioId: string, colaboradorIds: string[]) {
  if (colaboradorIds.length === 0) return;
  await createAtribuicoes(formularioId, colaboradorIds);
  revalidatePath(`/gestao/formularios/${formularioId}`);
}
