-- Prepara o sistema para a etapa de autenticação:
--   - `perfil` marca se o colaborador acessa como "colaborador" ou "gestao".
--   - `ativo` permite remover alguém do sistema de Formulários RH sem apagar
--     o vínculo com o colaborador de origem (soft delete) — importante
--     porque o seed roda a partir de `collaborators`, que não controlamos, e
--     um re-seed não pode "ressuscitar" quem foi removido daqui.
--
-- Nenhuma das duas colunas é tocada pelo UPSERT de supabase/seed.sql, então
-- re-rodar o seed nunca reverte esses ajustes manuais.

alter table public.formularios_colaboradores
  add column if not exists perfil text not null default 'colaborador'
    check (perfil in ('colaborador', 'gestao')),
  add column if not exists ativo boolean not null default true;

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
  fc.updated_at,
  fc.perfil
from public.formularios_colaboradores fc
join public.collaborators c on c.id = fc.collaborator_id
left join public.positions p on p.id = c.position_id
left join public.departments d on d.id = c.department_id
where c.deleted_at is null
  and fc.ativo = true;

-- Perfis de gestão combinados com o usuário antes da etapa de login.
update public.formularios_colaboradores
set perfil = 'gestao'
where email in (
  'andersonmaisse@gmail.com',
  'rh@amcontabilidadeonline.com.br',
  'ti@amcontabilidadeonline.com.br'
);

-- Remove o colaborador fantasma do sistema de Formulários RH (soft delete).
update public.formularios_colaboradores
set ativo = false
where email = 'fantasma.prefeitura@gmail.com';
