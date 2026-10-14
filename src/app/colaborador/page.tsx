import { Suspense } from "react";
import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { CardsGridSkeleton } from "@/components/skeletons";
import { ColaboradorFormCard } from "@/components/colaborador/form-card";
import { FeaturedDeadline } from "@/components/colaborador/featured-deadline";
import { WelcomeBanner, WelcomeBannerSkeleton } from "@/components/colaborador/welcome-banner";
import { getAtribuicoesByColaborador, getFormularioById, getProximaPendencia } from "@/lib/data";
import { getColaboradorLogado } from "@/lib/data/sessao";

const DESCRICAO = "Aqui está um resumo dos formulários atribuídos a você pela gestão de RH.";

export default function ColaboradorDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<WelcomeBannerSkeleton descricao={DESCRICAO} />}>
        <Boasvindas />
      </Suspense>

      {/* Destaque só aparece se houver prazo próximo — sem skeleton para não
          reservar espaço de algo que pode nem existir. */}
      <Suspense fallback={null}>
        <PrazoEmDestaque />
      </Suspense>

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-[20px] font-semibold text-foreground">
          Pendentes para você
        </h2>
        <Suspense
          fallback={<CardsGridSkeleton quantidade={2} className="grid grid-cols-1 gap-4 md:grid-cols-2" />}
        >
          <Pendentes />
        </Suspense>
      </div>
    </div>
  );
}

async function Boasvindas() {
  const colaborador = await getColaboradorLogado();
  return (
    <WelcomeBanner
      eyebrow={colaborador.departamento}
      nome={colaborador.nome.split(" ")[0]}
      descricao={DESCRICAO}
      fotoUrl={colaborador.fotoUrl ?? colaborador.iconeUrl}
      iniciais={colaborador.iniciais}
    />
  );
}

async function PrazoEmDestaque() {
  const colaborador = await getColaboradorLogado();
  const proximaPendencia = await getProximaPendencia(colaborador.id);
  if (!proximaPendencia) return null;
  const formulario = await getFormularioById(proximaPendencia.formularioId);
  if (!formulario) return null;
  return <FeaturedDeadline formulario={formulario} atribuicao={proximaPendencia} />;
}

async function Pendentes() {
  const colaborador = await getColaboradorLogado();
  const atribuicoes = await getAtribuicoesByColaborador(colaborador.id);
  const pendentes = atribuicoes
    .filter((a) => a.status === "aguardando" || a.status === "em_andamento")
    .sort((a) => (a.status === "em_andamento" ? -1 : 1));

  const itens = (
    await Promise.all(
      pendentes.map(async (atribuicao) => {
        const formulario = await getFormularioById(atribuicao.formularioId);
        return formulario ? { atribuicao, formulario } : undefined;
      })
    )
  ).filter((item): item is NonNullable<typeof item> => !!item);

  if (itens.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Tudo em dia"
        description="Você não tem formulários pendentes no momento."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {itens.map(({ atribuicao, formulario }) => (
        <ColaboradorFormCard key={atribuicao.id} formulario={formulario} atribuicao={atribuicao} />
      ))}
    </div>
  );
}
