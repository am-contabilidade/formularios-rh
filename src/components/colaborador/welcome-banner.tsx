import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="flex flex-col items-start gap-6 rounded-xl border border-border bg-card p-6 shadow-elevated sm:flex-row sm:items-center sm:p-8">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-primary text-primary-foreground shadow-elevated sm:size-28">
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
          <span className="text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-foreground">Olá, {nome}</h1>
        {descricao ? (
          <p className="max-w-2xl text-[16px] leading-[1.5] text-muted-foreground">{descricao}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Mesma moldura do banner; só foto, departamento e nome (do banco) em skeleton. */
export function WelcomeBannerSkeleton({ descricao }: { descricao?: string }) {
  return (
    <div className="flex flex-col items-start gap-6 rounded-xl border border-border bg-card p-6 shadow-elevated sm:flex-row sm:items-center sm:p-8">
      <Skeleton className="size-24 shrink-0 rounded-full sm:size-28" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-28" />
        <h1 className="font-heading flex items-center gap-2 text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-foreground">
          Olá, <span className="inline-block h-7 w-36 animate-pulse rounded-md bg-foreground/10" />
        </h1>
        {descricao ? (
          <p className="max-w-2xl text-[16px] leading-[1.5] text-muted-foreground">{descricao}</p>
        ) : null}
      </div>
    </div>
  );
}
