import type { CampoFormulario, Formulario, RespostaFormulario } from "@/lib/types";

function formatarValor(campo: CampoFormulario, valor: string | string[]) {
  if (Array.isArray(valor)) {
    return valor.length > 0 ? valor.join(", ") : "—";
  }
  if (campo.tipo === "escala") {
    return `${valor} / 5`;
  }
  if (campo.tipo === "data") {
    return new Date(`${valor}T00:00:00`).toLocaleDateString("pt-BR");
  }
  return valor || "—";
}

export function RespostaFormularioView({
  formulario,
  resposta,
}: {
  formulario: Formulario;
  resposta: RespostaFormulario;
}) {
  const respostasPorCampo = new Map(resposta.campos.map((r) => [r.campoId, r.valor]));

  return (
    <div className="flex flex-col gap-6">
      {formulario.secoes.map((secao) => {
        const camposRespondidos = secao.campos.filter((campo) =>
          respostasPorCampo.has(campo.id)
        );
        if (camposRespondidos.length === 0) return null;

        return (
          <div key={secao.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[16px] font-semibold text-ink">{secao.titulo}</h3>
              {secao.descricao ? (
                <p className="text-[14px] text-graphite">{secao.descricao}</p>
              ) : null}
            </div>
            <dl className="flex flex-col divide-y divide-black/8 rounded-lg border border-black/8 bg-white">
              {camposRespondidos.map((campo) => (
                <div key={campo.id} className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:gap-4">
                  <dt className="text-[14px] text-graphite sm:w-[45%] sm:shrink-0">
                    {campo.label}
                  </dt>
                  <dd className="text-[14px] font-medium whitespace-pre-line text-ink">
                    {formatarValor(campo, respostasPorCampo.get(campo.id)!)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
