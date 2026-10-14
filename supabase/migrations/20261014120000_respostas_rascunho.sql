-- Rascunho (snapshot) das respostas + envio atômico.
--
-- As perguntas dos formulários vivem no código (src/lib/perguntas/*.ts), não
-- em formularios_campos — por isso as respostas passam a referenciar o campo
-- pelo identificador de texto (ex.: 'nome-completo') em vez do uuid.

-- 1 linha por atribuição: o estado atual do preenchimento, salvo a cada
-- alteração. `versao` é o controle de concorrência otimista entre abas/
-- dispositivos (update só passa se a versão esperada bater).
create table if not exists public.formularios_rascunhos (
  atribuicao_id uuid primary key references public.formularios_atribuicoes (id) on delete cascade,
  respostas jsonb not null default '{}'::jsonb,
  secao_atual integer not null default 0,
  versao integer not null default 0,
  iniciado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.formularios_rascunhos enable row level security;
grant select, insert, update, delete on public.formularios_rascunhos to service_role;

-- campo_id: uuid -> text, sem FK para formularios_campos.
alter table public.formularios_respostas_campos
  drop constraint if exists formularios_respostas_campos_campo_id_fkey;
alter table public.formularios_respostas_campos
  alter column campo_id type text using campo_id::text;
alter table public.formularios_respostas_campos
  add constraint formularios_respostas_campos_resposta_campo_key unique (resposta_id, campo_id);

-- Envio final em uma transação: grava a resposta e os campos, marca a
-- atribuição como respondida e descarta o rascunho.
create or replace function public.formularios_enviar_resposta(
  p_atribuicao_id uuid,
  p_respostas jsonb
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_atribuicao public.formularios_atribuicoes%rowtype;
  v_iniciado_em timestamptz;
  v_resposta_id uuid;
begin
  select * into v_atribuicao
  from public.formularios_atribuicoes
  where id = p_atribuicao_id
  for update;

  if not found then
    raise exception 'Atribuição % não encontrada', p_atribuicao_id;
  end if;
  if v_atribuicao.status in ('respondido', 'bloqueado') then
    raise exception 'Atribuição % não aceita respostas (status %)', p_atribuicao_id, v_atribuicao.status;
  end if;

  select iniciado_em into v_iniciado_em
  from public.formularios_rascunhos
  where atribuicao_id = p_atribuicao_id;

  insert into public.formularios_respostas (formulario_id, colaborador_id, tempo_gasto_minutos)
  values (
    v_atribuicao.formulario_id,
    v_atribuicao.colaborador_id,
    coalesce(greatest(1, ceil(extract(epoch from (now() - v_iniciado_em)) / 60))::integer, 0)
  )
  returning id into v_resposta_id;

  insert into public.formularios_respostas_campos (resposta_id, campo_id, valor)
  select v_resposta_id, r.key, r.value
  from jsonb_each(p_respostas) as r;

  update public.formularios_atribuicoes
  set status = 'respondido', respondido_em = current_date
  where id = p_atribuicao_id;

  delete from public.formularios_rascunhos where atribuicao_id = p_atribuicao_id;

  return v_resposta_id;
end;
$$;

revoke all on function public.formularios_enviar_resposta(uuid, jsonb) from public;
grant execute on function public.formularios_enviar_resposta(uuid, jsonb) to service_role;
