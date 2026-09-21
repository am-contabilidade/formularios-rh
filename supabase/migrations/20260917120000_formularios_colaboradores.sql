-- Formularios RH — tabela de colaboradores do sistema.
--
-- Este projeto Supabase é compartilhado com outros sistemas internos da
-- Sistemas AM (compras, patrimônio, tickets, etc.). Para não duplicar dados
-- que já existem e são mantidos por esses sistemas, esta tabela:
--   - referencia `public.collaborators` (que já traz department_id e
--     position_id) para obter cargo e departamento atuais sempre em dia,
--     sem duplicar essa informação;
--   - duplica apenas nome, email e email pessoal, que é o recorte de dados
--     que o sistema de formulários realmente precisa manter por conta própria.
--
-- Todas as tabelas deste sistema usam o prefixo "formularios_" para ficarem
-- isoladas das tabelas dos demais sistemas no mesmo banco.

create table if not exists public.formularios_colaboradores (
  id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null unique references public.collaborators (id) on delete cascade,
  nome text not null,
  email text not null,
  email_pessoal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.formularios_colaboradores is
  'Colaboradores do sistema de Formulários RH. Cargo e departamento atuais não são duplicados aqui — vêm de collaborators/positions/departments via collaborator_id (ver view formularios_colaboradores_atual).';
comment on column public.formularios_colaboradores.collaborator_id is
  'FK para public.collaborators.id — fonte da verdade para cargo/departamento atuais.';

create index if not exists formularios_colaboradores_email_idx
  on public.formularios_colaboradores (email);

-- Mantém updated_at em dia automaticamente em cada UPDATE.
create or replace function public.formularios_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists formularios_colaboradores_set_updated_at on public.formularios_colaboradores;
create trigger formularios_colaboradores_set_updated_at
  before update on public.formularios_colaboradores
  for each row
  execute function public.formularios_set_updated_at();

-- RLS habilitada e sem policies por enquanto: só o service_role (que sempre
-- ignora RLS) acessa a tabela até a etapa de autenticação, quando as
-- policies de colaborador/gestão serão adicionadas.
alter table public.formularios_colaboradores enable row level security;

-- View "achatada" com cargo e departamento atuais já resolvidos via join —
-- é o formato que o front-end consome (ver Colaborador em src/lib/types.ts),
-- sem que a tabela base duplique esses dados.
create or replace view public.formularios_colaboradores_atual
with (security_invoker = true) as
select
  fc.id,
  fc.collaborator_id,
  fc.nome,
  fc.email,
  fc.email_pessoal,
  p.name as cargo,
  d.name as departamento,
  d.sigla as departamento_sigla,
  c.admission_date as data_admissao,
  fc.created_at,
  fc.updated_at
from public.formularios_colaboradores fc
join public.collaborators c on c.id = fc.collaborator_id
left join public.positions p on p.id = c.position_id
left join public.departments d on d.id = c.department_id
where c.deleted_at is null;

-- Grants mínimos para o service_role conseguir ler, via REST/PostgREST, as
-- tabelas de origem (necessário para a view acima e para o seed) — este
-- projeto restringe grants por tabela, então precisam ser concedidos
-- explicitamente.
grant select on public.departments to service_role;
grant select on public.positions to service_role;
grant select on public.users to service_role;
grant select on public.collaborator_emails to service_role;

grant select on public.formularios_colaboradores to service_role;
grant select on public.formularios_colaboradores_atual to service_role;
grant insert, update, delete on public.formularios_colaboradores to service_role;
