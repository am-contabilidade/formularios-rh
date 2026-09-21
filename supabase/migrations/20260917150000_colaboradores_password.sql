-- Senha do colaborador para login no próprio sistema de Formulários RH,
-- via NextAuth (Credentials Provider) — independente dos sistemas de auth
-- já existentes no banco (public.users / public.credentials são de outros
-- apps da Sistemas AM, ver conversa). Hash bcrypt, nunca a senha em texto.
alter table public.formularios_colaboradores
  add column if not exists password_hash text;

comment on column public.formularios_colaboradores.password_hash is
  'Hash bcrypt da senha de acesso ao Formulários RH. NULL = colaborador ainda não tem senha definida (não consegue logar).';
