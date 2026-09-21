"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-5 bg-paper px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg border border-black/8 bg-white text-graphite">
        <AlertTriangle className="size-5" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] font-semibold text-ink">Algo deu errado</h1>
        <p className="max-w-sm text-[14px] text-graphite">
          Não foi possível carregar esta página. Tente novamente em instantes.
        </p>
      </div>
      <Button onClick={() => reset()}>Tentar novamente</Button>
    </div>
  );
}
