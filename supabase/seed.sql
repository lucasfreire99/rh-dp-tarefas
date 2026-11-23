-- Seed: áreas padrão + tarefas de exemplo para o PRIMEIRO usuário criado no Supabase.
-- Rode no SQL Editor depois de criar seu usuário em Authentication > Users.
-- As tarefas de exemplo têm "[EXEMPLO]" nas observações. Para apagar:
--   delete from tarefas where observacoes like '[EXEMPLO]%';
do $$
declare
  uid uuid := (select id from auth.users order by created_at limit 1);
begin
  if uid is null then
    raise exception 'Crie seu usuário em Authentication > Users antes de rodar o seed.';
  end if;

  insert into areas (user_id, nome, ordem)
  select uid, nome, ordem from (values
    ('Admissão',1),('Rescisão / Demissão',2),('Folha de Pagamento',3),('Férias',4),
    ('Benefícios',5),('Ponto e Frequência',6),('eSocial / Obrigações',7),
    ('Recrutamento e Seleção',8),('Treinamento',9),('SST / Saúde Ocupacional',10),
    ('Atendimento ao Colaborador',11),('Outros',12)
  ) v(nome, ordem)
  on conflict (user_id, nome) do nothing;

  insert into solicitantes (user_id, nome, ordem) values
    (uid, 'Diretoria', 1), (uid, 'Financeiro', 2), (uid, 'Gestor Operações', 3)
  on conflict (user_id, nome) do nothing;

  insert into tarefas (user_id, data_entrada, prazo, area_id, descricao, solicitante_id, prioridade, status, data_conclusao, observacoes)
  select uid, hoje + e, case when p is null then null else hoje + p end,
         (select id from areas where user_id = uid and nome = a),
         d, (select id from solicitantes where user_id = uid and nome = s), pr, st,
         case when st = 'Concluída' then hoje + c end, '[EXEMPLO] pode apagar'
  from (select (now() at time zone 'America/Sao_Paulo')::date as hoje) h,
  (values
    (-20, -10, 'Admissão', 'Admitir novo analista (documentos e eSocial)', 'Gestor Operações', 'Alta', 'Concluída', -12),
    (-15, -5,  'Folha de Pagamento', 'Conferir folha do mês anterior', 'Financeiro', 'Alta', 'Em andamento', null),
    (-10, -2,  'Férias', 'Programar férias coletivas', 'Diretoria', 'Média', 'Pendente', null),
    (-8,  3,   'Benefícios', 'Renovar contrato do vale-refeição', 'Financeiro', 'Média', 'Aguardando terceiros', null),
    (-3,  0,   'eSocial / Obrigações', 'Enviar eventos periódicos', 'Diretoria', 'Alta', 'Pendente', null),
    (-2,  null,'Atendimento ao Colaborador', 'Segunda via de holerite', 'Gestor Operações', 'Baixa', 'Concluída', -1),
    (-1,  6,   'Treinamento', 'Agendar treinamento de NR-10', 'Gestor Operações', 'Baixa', 'Pendente', null),
    (-30, -20, 'Recrutamento e Seleção', 'Vaga cancelada pelo gestor', 'Gestor Operações', 'Baixa', 'Cancelada', null)
  ) v(e, p, a, d, s, pr, st, c);
end $$;
