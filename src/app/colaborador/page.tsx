import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ColaboradorFormCard } from "@/components/colaborador/form-card";
import { FeaturedDeadline } from "@/components/colaborador/featured-deadline";
import { WelcomeBanner } from "@/components/colaborador/welcome-banner";
import { auth } from "@/auth";
import {
  colaboradorAtualPlaceholder,
  getAtribuicoesByColaborador,
  getColaboradorById,
  getFormularioById,
  getProximaPendencia,
} from "@/lib/data";

export default async function ColaboradorDashboardPage() {
  const session = await auth();
  const colaboradorAtual =
    (session?.user ? await getColaboradorById(session.user.id) : undefined) ??
    colaboradorAtualPlaceholder;
  const atribuicoes = await getAtribuicoesByColaborador(colaboradorAtual.id);

  const pendentes = atribuicoes
    .filter((a) => a.status === "aguardando" || a.status === "em_andamento")
    .sort((a, b) => (a.status === "em_andamento" ? -1 : 1));

  const proximaPendencia = await getProximaPendencia(colaboradorAtual.id);
  const formularioDestaque = proximaPendencia
    ? await getFormularioById(proximaPendencia.formularioId)
    : undefined;

  const pendentesComFormulario = (
    await Promise.all(
      pendentes.map(async (atribuicao) => {
        const formulario = await getFormularioById(atribuicao.formularioId);
        return formulario ? { atribuicao, formulario } : undefined;
      })
    )
  ).filter((item): item is NonNullable<typeof item> => !!item);

  const primeiroNome = colaboradorAtual.nome.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <WelcomeBanner
        eyebrow={colaboradorAtual.departamento}
        nome={primeiroNome}
        descricao="Aqui está um resumo dos formulários atribuídos a você pela gestão de RH."
        fotoUrl={colaboradorAtual.fotoUrl ?? colaboradorAtual.iconeUrl}
        iniciais={colaboradorAtual.iniciais}
      />

      {formularioDestaque && proximaPendencia ? (
        <FeaturedDeadline formulario={formularioDestaque} atribuicao={proximaPendencia} />
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="text-[20px] font-semibold text-ink">
          Pendentes para você
        </h2>

        {pendentesComFormulario.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Tudo em dia"
            description="Você não tem formulários pendentes no momento."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pendentesComFormulario.map(({ atribuicao, formulario }) => (
              <ColaboradorFormCard
                key={atribuicao.id}
                formulario={formulario}
                atribuicao={atribuicao}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
