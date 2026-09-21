"use client";

import { useActionState, useState, type FormEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { autenticar } from "@/lib/actions/auth";

const pill =
  "h-[52px] rounded-full border-0 bg-mist px-1 shadow-none overflow-hidden has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-blue/30";

export function LoginSwitch() {
  const [erro, action, pending] = useActionState(autenticar, undefined);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modoSolicitar, setModoSolicitar] = useState(false);

  function onSolicitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.info("Ainda não é possível enviar pelo site. Por enquanto, peça a liberação diretamente ao time de RH.");
  }

  return (
    <div className="au-root">
      <style>{`
        .au-root, .au-root * { box-sizing: border-box; }

        /* O autofill do navegador pinta o <input> com um fundo quadrado
           próprio (amarelo/azul), quebrando o pill arredondado. Forçamos a
           cor de fundo a ficar igual ao mist do campo. */
        .au-root input:-webkit-autofill,
        .au-root input:-webkit-autofill:hover,
        .au-root input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--color-ink-black);
          -webkit-box-shadow: 0 0 0 1000px var(--color-mist) inset;
          box-shadow: 0 0 0 1000px var(--color-mist) inset;
          transition: background-color 9999s ease-in-out 0s;
        }

        .au-root {
          min-height: 100svh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, var(--color-notion-blue) 0%, var(--color-midnight-ink) 100%);
        }

        .au-root .au-container {
          position: relative;
          width: 100%;
          max-width: 960px;
          height: 600px;
          background: var(--color-pure-white);
          border-radius: 24px;
          box-shadow: 0 30px 60px rgba(2, 9, 58, 0.25);
          overflow: hidden;
        }

        .au-root .au-forms {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .au-root .au-forms-inner {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .au-root form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 14px;
          padding: 0 3rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          width: 100%;
        }

        .au-root .au-form-solicitar {
          opacity: 0;
          z-index: 1;
        }

        .au-root .au-form-entrar {
          z-index: 2;
        }

        .au-root .au-logo {
          height: 34px;
          width: auto;
          margin-bottom: 2px;
        }

        .au-root .au-title {
          font-size: 1.7rem;
          color: var(--color-ink-black);
          font-weight: 700;
          line-height: 1.2;
        }

        .au-root .au-subtitle {
          margin-top: -10px;
          margin-bottom: 4px;
          font-size: 0.85rem;
          color: var(--color-graphite);
          text-align: center;
        }

        .au-root .au-field { width: 100%; max-width: 340px; }

        .au-root .au-error {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          max-width: 340px;
          border-radius: 9999px;
          background: color-mix(in oklab, var(--color-coral) 10%, transparent);
          color: var(--color-coral);
          padding: 8px 16px;
          font-size: 0.8rem;
        }

        .au-root .au-submit {
          width: 100%;
          max-width: 340px;
        }

        .au-root .au-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          max-width: 340px;
          margin: 0;
        }
        .au-root .au-divider span {
          height: 1px;
          flex: 1;
          background: rgb(0 0 0 / 8%);
        }
        .au-root .au-divider small {
          font-size: 0.72rem;
          color: var(--color-stone);
        }

        .au-root .au-panels {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .au-root .au-panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .au-root .au-left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .au-root .au-right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .au-root .au-panel .au-content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .au-root .au-panel h3 {
          font-weight: 700;
          line-height: 1.2;
          font-size: 1.4rem;
          margin-bottom: 10px;
        }

        .au-root .au-panel p {
          font-size: 0.88rem;
          line-height: 1.5;
          color: rgb(255 255 255 / 75%);
          padding: 0.3rem 0 1.1rem;
        }

        .au-root .au-ghost-btn {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          width: 152px;
          height: 42px;
          border-radius: 9999px;
          color: #fff;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          transition: 0.3s;
        }

        .au-root .au-ghost-btn:hover {
          background: rgb(255 255 255 / 12%);
          transform: translateY(-2px);
        }

        .au-root .au-right-panel .au-content {
          transform: translateX(800px);
        }

        .au-root .au-container.au-mode-solicitar:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .au-root .au-container.au-mode-solicitar .au-left-panel .au-content {
          transform: translateX(-800px);
        }

        .au-root .au-container.au-mode-solicitar .au-forms-inner {
          left: 25%;
        }

        .au-root .au-container.au-mode-solicitar .au-form-solicitar {
          opacity: 1;
          z-index: 2;
        }

        .au-root .au-container.au-mode-solicitar .au-form-entrar {
          opacity: 0;
          z-index: 1;
        }

        .au-root .au-container.au-mode-solicitar .au-right-panel .au-content {
          transform: translateX(0%);
        }

        .au-root .au-container.au-mode-solicitar .au-left-panel {
          pointer-events: none;
        }

        .au-root .au-container.au-mode-solicitar .au-right-panel {
          pointer-events: all;
        }

        .au-root .au-container:before {
          content: "";
          position: absolute;
          height: 2200px;
          width: 2200px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, var(--color-notion-blue) 0%, var(--color-midnight-ink) 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        @media (max-width: 870px) {
          .au-root .au-container {
            min-height: 880px;
            height: 100svh;
          }
          .au-root .au-forms-inner {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .au-root .au-forms-inner,
          .au-root .au-container.au-mode-solicitar .au-forms-inner {
            left: 50%;
          }
          .au-root .au-panels {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .au-root .au-panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.2rem 8%;
            grid-column: 1 / 2;
          }
          .au-root .au-right-panel { grid-row: 3 / 4; }
          .au-root .au-left-panel { grid-row: 1 / 2; }
          .au-root .au-panel .au-content {
            padding-right: 8%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .au-root .au-panel h3 { font-size: 1.1rem; }
          .au-root .au-panel p { font-size: 0.72rem; padding: 0.4rem 0; }
          .au-root .au-ghost-btn { width: 118px; height: 36px; font-size: 0.7rem; }
          .au-root .au-container:before {
            width: 1700px;
            height: 1700px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 70%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .au-root .au-container.au-mode-solicitar:before {
            transform: translate(-50%, 100%);
            bottom: 30%;
            right: initial;
          }
          .au-root .au-container.au-mode-solicitar .au-left-panel .au-content {
            transform: translateY(-300px);
          }
          .au-root .au-container.au-mode-solicitar .au-right-panel .au-content {
            transform: translateY(0px);
          }
          .au-root .au-right-panel .au-content {
            transform: translateY(300px);
          }
          .au-root .au-container.au-mode-solicitar .au-forms-inner {
            top: 5%;
            transform: translate(-50%, 0);
          }
          .au-root form { padding: 0 1.75rem; }
        }

        @media (max-width: 570px) {
          .au-root form { padding: 0 1.25rem; }
          .au-root .au-panel .au-content { padding: 0.5rem 0.5rem; }
        }
      `}</style>

      <div className={modoSolicitar ? "au-container au-mode-solicitar" : "au-container"}>
        <div className="au-forms">
          <div className="au-forms-inner">
            <form className="au-form-entrar" action={action}>
              <Image src="/icon-logo.png" alt="" width={104} height={80} className="au-logo" priority />
              <h2 className="au-title">Entrar</h2>
              <p className="au-subtitle">Use seu email pessoal cadastrado para acessar sua conta.</p>

              <Label htmlFor="email" className="sr-only">
                Email pessoal
              </Label>
              <InputGroup className={`${pill} au-field`}>
                <InputGroupAddon className="pl-4">
                  <Mail className="text-graphite" />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email pessoal"
                  required
                />
              </InputGroup>

              <Label htmlFor="password" className="sr-only">
                Senha
              </Label>
              <InputGroup className={`${pill} au-field`}>
                <InputGroupAddon className="pl-4">
                  <Lock className="text-graphite" />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Senha"
                  required
                />
                <InputGroupAddon align="inline-end" className="pr-2">
                  <InputGroupButton
                    type="button"
                    size="icon-sm"
                    className="rounded-full text-graphite"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                  >
                    {mostrarSenha ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              {erro ? (
                <div className="au-error">
                  <AlertCircle className="size-4 shrink-0" />
                  <p>{erro}</p>
                </div>
              ) : null}

              <Button type="submit" size="lg" disabled={pending} className="au-submit h-[52px] rounded-full">
                <LogIn />
                {pending ? "Entrando..." : "Entrar"}
              </Button>

              <div className="au-divider">
                <span />
                <small>ou</small>
                <span />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled
                title="Em breve"
                className="au-submit h-[52px] rounded-full border-black/10 text-ink/70"
              >
                <GoogleIcon className="size-[18px]" />
                Continuar com Google
              </Button>
            </form>

            <form className="au-form-solicitar" onSubmit={onSolicitar}>
              <Image src="/icon-logo.png" alt="" width={104} height={80} className="au-logo" priority />
              <h2 className="au-title">Solicitar acesso</h2>
              <p className="au-subtitle">Ainda não tem login? Preencha para o RH liberar seu acesso.</p>

              <Label htmlFor="nome" className="sr-only">
                Nome completo
              </Label>
              <InputGroup className={`${pill} au-field`}>
                <InputGroupAddon className="pl-4">
                  <User className="text-graphite" />
                </InputGroupAddon>
                <InputGroupInput id="nome" name="nome" placeholder="Nome completo" required />
              </InputGroup>

              <Label htmlFor="email-solicitar" className="sr-only">
                Email pessoal
              </Label>
              <InputGroup className={`${pill} au-field`}>
                <InputGroupAddon className="pl-4">
                  <Mail className="text-graphite" />
                </InputGroupAddon>
                <InputGroupInput id="email-solicitar" name="email" type="email" placeholder="Email pessoal" required />
              </InputGroup>

              <Label htmlFor="departamento" className="sr-only">
                Departamento
              </Label>
              <InputGroup className={`${pill} au-field`}>
                <InputGroupAddon className="pl-4">
                  <Building2 className="text-graphite" />
                </InputGroupAddon>
                <InputGroupInput id="departamento" name="departamento" placeholder="Departamento" required />
              </InputGroup>

              <Button type="submit" size="lg" className="au-submit h-[52px] rounded-full">
                <UserPlus />
                Solicitar acesso
              </Button>
            </form>
          </div>
        </div>

        <div className="au-panels">
          <div className="au-panel au-left-panel">
            <div className="au-content">
              <h3>Ainda não tem acesso?</h3>
              <p>Peça a liberação ao RH — leva menos de um minuto para preencher.</p>
              <button type="button" className="au-ghost-btn" onClick={() => setModoSolicitar(true)}>
                Solicitar acesso
              </button>
            </div>
          </div>

          <div className="au-panel au-right-panel">
            <div className="au-content">
              <h3>Já tem uma conta?</h3>
              <p>Entre com seu email pessoal cadastrado para continuar.</p>
              <button type="button" className="au-ghost-btn" onClick={() => setModoSolicitar(false)}>
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
