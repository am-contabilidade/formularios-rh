-- Ícone (miniatura) e foto de perfil do colaborador — mesma lógica de
-- cargo/departamento: a fonte da verdade é `public.users` (icon_url e
-- profile_image_url, já preenchidos por outros sistemas da Sistemas AM via
-- upload em S3), então só duplicamos as URLs aqui, resincronizadas pelo seed
-- (supabase/seed.sql) a partir de collaborators -> users.

alter table public.formularios_colaboradores
  add column if not exists icone_url text,
  add column if not exists foto_url text;

comment on column public.formularios_colaboradores.icone_url is
  'Miniatura do colaborador (users.icon_url) — duplicada aqui só para leitura rápida, ressincronizada pelo seed.';
comment on column public.formularios_colaboradores.foto_url is
  'Foto de perfil do colaborador (users.profile_image_url) — duplicada aqui só para leitura rápida, ressincronizada pelo seed.';

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
  fc.perfil,
  fc.icone_url,
  fc.foto_url
from public.formularios_colaboradores fc
join public.collaborators c on c.id = fc.collaborator_id
left join public.positions p on p.id = c.position_id
left join public.departments d on d.id = c.department_id
where c.deleted_at is null
  and fc.ativo = true;
