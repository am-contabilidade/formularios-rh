-- Motor de formulários: formulário -> seções -> campos, atribuições a
-- colaboradores e respostas. Schema normalizado fixo (decisão registrada na
-- conversa com o usuário): nada de tabela física dinâmica por formulário.
--
-- colaborador_id nas tabelas de atribuição/resposta referencia
-- formularios_colaboradores (não a tabela `collaborators` externa), que é a
-- identidade do colaborador dentro deste sistema.

create table if not exists public.formularios_formularios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null default '',
  categoria text not null default '',
  status text not null default 'rascunho' check (status in ('ativo', 'rascunho', 'encerrado')),
  tabela text not null default '',
  estimativa_minutos integer not null default 0,
  prazo date,
  criado_em date not null default current_date
);

create table if not exists public.formularios_secoes (
  id uuid primary key default gen_random_uuid(),
  formulario_id uuid not null references public.formularios_formularios (id) on delete cascade,
  titulo text not null,
  descricao text,
  ordem integer not null default 0
);
create index if not exists formularios_secoes_formulario_id_idx
  on public.formularios_secoes (formulario_id);

create table if not exists public.formularios_campos (
  id uuid primary key default gen_random_uuid(),
  secao_id uuid not null references public.formularios_secoes (id) on delete cascade,
  tipo text not null check (
    tipo in ('texto', 'texto_longo', 'numero', 'data', 'select', 'radio', 'checkbox', 'escala')
  ),
  label text not null,
  descricao text,
  placeholder text,
  obrigatorio boolean not null default false,
  opcoes text[],
  condicional_campo_id uuid references public.formularios_campos (id) on delete set null,
  condicional_valor jsonb,
  ordem integer not null default 0
);
create index if not exists formularios_campos_secao_id_idx
  on public.formularios_campos (secao_id);
create index if not exists formularios_campos_condicional_campo_id_idx
  on public.formularios_campos (condicional_campo_id);

create table if not exists public.formularios_atribuicoes (
  id uuid primary key default gen_random_uuid(),
  formulario_id uuid not null references public.formularios_formularios (id) on delete cascade,
  colaborador_id uuid not null references public.formularios_colaboradores (id) on delete cascade,
  status text not null default 'aguardando' check (
    status in ('aguardando', 'em_andamento', 'respondido', 'bloqueado')
  ),
  liberado_em date,
  respondido_em date,
  prazo date,
  unique (formulario_id, colaborador_id)
);
create index if not exists formularios_atribuicoes_colaborador_id_idx
  on public.formularios_atribuicoes (colaborador_id);

create table if not exists public.formularios_respostas (
  id uuid primary key default gen_random_uuid(),
  formulario_id uuid not null references public.formularios_formularios (id) on delete cascade,
  colaborador_id uuid not null references public.formularios_colaboradores (id) on delete cascade,
  enviado_em date not null default current_date,
  tempo_gasto_minutos integer not null default 0,
  unique (formulario_id, colaborador_id)
);
create index if not exists formularios_respostas_colaborador_id_idx
  on public.formularios_respostas (colaborador_id);

create table if not exists public.formularios_respostas_campos (
  id uuid primary key default gen_random_uuid(),
  resposta_id uuid not null references public.formularios_respostas (id) on delete cascade,
  campo_id uuid not null references public.formularios_campos (id) on delete cascade,
  valor jsonb not null
);
create index if not exists formularios_respostas_campos_resposta_id_idx
  on public.formularios_respostas_campos (resposta_id);
create index if not exists formularios_respostas_campos_campo_id_idx
  on public.formularios_respostas_campos (campo_id);

alter table public.formularios_formularios enable row level security;
alter table public.formularios_secoes enable row level security;
alter table public.formularios_campos enable row level security;
alter table public.formularios_atribuicoes enable row level security;
alter table public.formularios_respostas enable row level security;
alter table public.formularios_respostas_campos enable row level security;

grant select, insert, update, delete on
  public.formularios_formularios,
  public.formularios_secoes,
  public.formularios_campos,
  public.formularios_atribuicoes,
  public.formularios_respostas,
  public.formularios_respostas_campos
to service_role;
