-- Permite usuários que existem só no Formulários RH, sem registro em
-- public.collaborators (ex.: contas de teste). Eles ficam fora do cadastro
-- compartilhado da empresa — não aparecem nos outros sistemas nem nas
-- integrações — e simplesmente não têm cargo/departamento.

alter table public.formularios_colaboradores
  alter column collaborator_id drop not null;

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
left join public.collaborators c on c.id = fc.collaborator_id
left join public.positions p on p.id = c.position_id
left join public.departments d on d.id = c.department_id
where (fc.collaborator_id is null or c.deleted_at is null)
  and fc.ativo = true;
