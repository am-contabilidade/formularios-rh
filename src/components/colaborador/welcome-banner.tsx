import Image from "next/image";

export function WelcomeBanner({
  eyebrow,
  nome,
  descricao,
  fotoUrl,
  iniciais,
}: {
  eyebrow?: string;
  nome: string;
  descricao?: string;
  fotoUrl?: string;
  iniciais: string;
}) {
  return (
    <div className="flex flex-col items-start gap-6 rounded-2xl border border-black/6 bg-white p-6 shadow-elevated sm:flex-row sm:items-center sm:p-8">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-paper bg-blue text-white shadow-elevated sm:size-28">
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt=""
            width={224}
            height={224}
            className="size-full object-cover"
          />
        ) : (
          <span className="text-[32px] font-semibold">{iniciais}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {eyebrow ? (
          <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-[28px] leading-[1.2] font-semibold text-ink">Olá, {nome}</h1>
        {descricao ? (
          <p className="max-w-2xl text-[16px] leading-[1.5] text-graphite">{descricao}</p>
        ) : null}
      </div>
    </div>
  );
}
