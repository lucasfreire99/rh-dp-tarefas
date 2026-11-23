-- View principal: calcula "dias em aberto" e "situação do prazo" no banco,
-- sempre usando a data de hoje no fuso America/Sao_Paulo.
create view tarefas_view with (security_invoker = true) as
with h as (select (now() at time zone 'America/Sao_Paulo')::date as hoje)
select
  t.*,
  'T-' || lpad(t.codigo::text, 3, '0') as codigo_texto,
  a.nome as area_nome,
  s.nome as solicitante_nome,
  h.hoje,
  case
    when t.status = 'Cancelada' then null
    when t.status = 'Concluída' then t.data_conclusao - t.data_entrada
    else h.hoje - t.data_entrada
  end as dias_em_aberto,
  case
    when t.status = 'Cancelada' then 'Cancelada'
    when t.status = 'Concluída' and t.prazo is not null and t.data_conclusao > t.prazo then 'Concluída c/ atraso'
    when t.status = 'Concluída' then 'Concluída'
    when t.prazo is null then 'Sem prazo'
    when t.prazo < h.hoje then 'Atrasada'
    when t.prazo = h.hoje then 'Vence hoje'
    else 'No prazo'
  end as situacao_prazo,
  case
    when t.status not in ('Concluída','Cancelada') and t.prazo < h.hoje then h.hoje - t.prazo
  end as dias_atraso
from tarefas t
cross join h
left join areas a on a.id = t.area_id
left join solicitantes s on s.id = t.solicitante_id;

-- Indicadores do dashboard (uma linha)
create view dashboard_indicadores with (security_invoker = true) as
select
  count(*)::int as total,
  count(*) filter (where status not in ('Concluída','Cancelada'))::int as em_aberto,
  count(*) filter (where status = 'Concluída')::int as concluidas,
  count(*) filter (where situacao_prazo = 'Atrasada')::int as atrasadas,
  count(*) filter (where status not in ('Concluída','Cancelada') and prazo between hoje and hoje + 7)::int as vencem_7_dias,
  coalesce(round(100.0 * count(*) filter (where status = 'Concluída')
    / nullif(count(*) filter (where status <> 'Cancelada'), 0), 1), 0)::float8 as pct_conclusao
from tarefas_view;

-- Por status
create view rel_status with (security_invoker = true) as
select s.status,
       count(t.id)::int as quantidade,
       coalesce(round(100.0 * count(t.id) / nullif(sum(count(t.id)) over (), 0), 1), 0)::float8 as percentual
from (values ('Pendente',1),('Em andamento',2),('Aguardando terceiros',3),('Concluída',4),('Cancelada',5)) s(status, ordem)
left join tarefas_view t on t.status = s.status
group by s.status, s.ordem
order by s.ordem;

-- Por prioridade
create view rel_prioridade with (security_invoker = true) as
select p.prioridade,
       count(t.id)::int as total,
       count(t.id) filter (where t.status not in ('Concluída','Cancelada'))::int as em_aberto,
       count(t.id) filter (where t.situacao_prazo = 'Atrasada')::int as atrasadas
from (values ('Alta',1),('Média',2),('Baixa',3)) p(prioridade, ordem)
left join tarefas_view t on t.prioridade = p.prioridade
group by p.prioridade, p.ordem
order by p.ordem;

-- Por área
create view rel_area with (security_invoker = true) as
select coalesce(area_nome, 'Sem área') as nome,
       count(*)::int as total,
       count(*) filter (where status = 'Concluída')::int as concluidas,
       count(*) filter (where status not in ('Concluída','Cancelada'))::int as em_aberto,
       count(*) filter (where situacao_prazo = 'Atrasada')::int as atrasadas,
       coalesce(round(100.0 * count(*) filter (where status = 'Concluída')
         / nullif(count(*) filter (where status <> 'Cancelada'), 0), 1), 0)::float8 as pct_conclusao
from tarefas_view
group by coalesce(area_nome, 'Sem área')
order by total desc, nome;

-- Por solicitante, com linha "Total" no final
create view rel_solicitante with (security_invoker = true) as
select nome, total, concluidas, em_aberto, atrasadas, pct_conclusao, media_dias, ordem from (
  select coalesce(solicitante_nome, 'Sem solicitante') as nome,
         count(*)::int as total,
         count(*) filter (where status = 'Concluída')::int as concluidas,
         count(*) filter (where status not in ('Concluída','Cancelada'))::int as em_aberto,
         count(*) filter (where situacao_prazo = 'Atrasada')::int as atrasadas,
         coalesce(round(100.0 * count(*) filter (where status = 'Concluída')
           / nullif(count(*) filter (where status <> 'Cancelada'), 0), 1), 0)::float8 as pct_conclusao,
         round(avg(dias_em_aberto) filter (where status = 'Concluída'), 1)::float8 as media_dias,
         0 as ordem
  from tarefas_view
  group by coalesce(solicitante_nome, 'Sem solicitante')
  union all
  select 'Total',
         count(*)::int,
         count(*) filter (where status = 'Concluída')::int,
         count(*) filter (where status not in ('Concluída','Cancelada'))::int,
         count(*) filter (where situacao_prazo = 'Atrasada')::int,
         coalesce(round(100.0 * count(*) filter (where status = 'Concluída')
           / nullif(count(*) filter (where status <> 'Cancelada'), 0), 1), 0)::float8,
         round(avg(dias_em_aberto) filter (where status = 'Concluída'), 1)::float8,
         1
  from tarefas_view
) x
order by ordem, total desc, nome;

-- Evolução mensal de um ano
create function rel_mensal(p_ano int)
returns table (mes int, entradas int, concluidas int, saldo int)
language sql stable security invoker as $$
  select m.mes, a.n, b.n, a.n - b.n
  from generate_series(1, 12) as m(mes)
  cross join lateral (
    select count(*)::int as n from tarefas
    where extract(year from data_entrada) = p_ano and extract(month from data_entrada) = m.mes
  ) a
  cross join lateral (
    select count(*)::int as n from tarefas
    where status = 'Concluída' and data_conclusao is not null
      and extract(year from data_conclusao) = p_ano and extract(month from data_conclusao) = m.mes
  ) b
  order by m.mes;
$$;

grant select on tarefas_view, dashboard_indicadores, rel_status, rel_prioridade, rel_area, rel_solicitante to authenticated;
grant execute on function rel_mensal(int) to authenticated;
