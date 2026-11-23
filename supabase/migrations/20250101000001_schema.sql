-- Tabelas principais
create table areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  ordem int not null default 0,
  unique (user_id, nome)
);

create table solicitantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  ordem int not null default 0,
  unique (user_id, nome)
);

create sequence tarefas_codigo_seq;

create table tarefas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  codigo int not null default nextval('tarefas_codigo_seq'),
  data_entrada date not null default (now() at time zone 'America/Sao_Paulo')::date,
  prazo date,
  area_id uuid references areas(id) on delete set null,
  descricao text not null,
  solicitante_id uuid references solicitantes(id) on delete set null,
  prioridade text not null default 'Média' check (prioridade in ('Alta','Média','Baixa')),
  status text not null default 'Pendente' check (status in ('Pendente','Em andamento','Aguardando terceiros','Concluída','Cancelada')),
  data_conclusao date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on tarefas (user_id, status);
create index on tarefas (user_id, prazo);
create index on tarefas (user_id, data_entrada);

-- updated_at automático
create function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger tarefas_updated_at before update on tarefas
  for each row execute function set_updated_at();

-- Row Level Security: cada usuário só enxerga e altera os próprios dados
do $$
declare t text;
begin
  foreach t in array array['areas','solicitantes','tarefas'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for select to authenticated using (user_id = auth.uid())', t || '_select', t);
    execute format('create policy %I on %I for insert to authenticated with check (user_id = auth.uid())', t || '_insert', t);
    execute format('create policy %I on %I for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t || '_update', t);
    execute format('create policy %I on %I for delete to authenticated using (user_id = auth.uid())', t || '_delete', t);
  end loop;
end $$;

grant usage, select on sequence tarefas_codigo_seq to authenticated;
