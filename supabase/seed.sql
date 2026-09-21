-- Seed de formularios_colaboradores a partir dos dados reais já existentes
-- em collaborators/users (nome, email, ícone e foto vêm de lá; email_pessoal
-- já está em collaborators.personal_email). Idempotente: pode rodar de novo
-- a qualquer momento para resincronizar (upsert por collaborator_id).

insert into public.formularios_colaboradores (collaborator_id, nome, email, email_pessoal, icone_url, foto_url)
select
  c.id as collaborator_id,
  trim(
    coalesce(nullif(c.preferred_name, ''), concat_ws(' ', u.first_name, u.last_name))
  ) as nome,
  u.email,
  c.personal_email,
  u.icon_url,
  u.profile_image_url
from public.collaborators c
join public.users u on u.id = c.user_id
where c.deleted_at is null
on conflict (collaborator_id) do update
set
  nome = excluded.nome,
  email = excluded.email,
  email_pessoal = excluded.email_pessoal,
  icone_url = excluded.icone_url,
  foto_url = excluded.foto_url,
  updated_at = now();
