-- Cria o card do formulário "Mapeamento de Competências Técnicas —
-- Legalização" (conteúdo em docs/Mapeamento Competencias Técnicas -
-- Legalização.docx). Mesma lógica do formulário Fiscal: por enquanto só o
-- registro do formulário (sem seções/campos) — as perguntas vivem em
-- src/lib/perguntas/mapeamento-competencias-legalizacao.ts até definirmos a
-- persistência de seções/campos/respostas no banco.
--
-- Idempotente: não duplica se já existir um formulário com o mesmo título.

insert into public.formularios_formularios (titulo, descricao, categoria, status, estimativa_minutos)
select
  'Mapeamento de Competências Técnicas — Legalização',
  'Avaliação de competências técnicas da equipe de Legalização: fundamentos de direito empresarial, viabilidade e REDESIM, abertura/alteração/baixa de empresas, Junta Comercial, CNPJ, inscrições estadual e municipal, alvarás e licenças, CNAE, regularização, exigências, sistemas, legislação, controle de processos, relacionamento com cliente/órgãos públicos, autoavaliação e percepção de carreira.',
  'Legalização',
  'rascunho',
  50
where not exists (
  select 1 from public.formularios_formularios
  where titulo = 'Mapeamento de Competências Técnicas — Legalização'
);
