-- Cria o card do formulário "Mapeamento de Competências Técnicas —
-- Analista Contábil" (conteúdo em docs/Mapeamento de Competências Técnicas
-- — Analista Contábil.docx). Mesma lógica dos formulários Fiscal e
-- Legalização: por enquanto só o registro do formulário (sem
-- seções/campos) — as perguntas vivem em
-- src/lib/perguntas/mapeamento-competencias-contabil.ts até definirmos a
-- persistência de seções/campos/respostas no banco.
--
-- Idempotente: não duplica se já existir um formulário com o mesmo título.

insert into public.formularios_formularios (titulo, descricao, categoria, status, estimativa_minutos)
select
  'Mapeamento de Competências Técnicas — Analista Contábil',
  'Avaliação de competências técnicas da equipe contábil: fundamentos contábeis, conciliação e análise, fechamento contábil, demonstrações contábeis, obrigações acessórias e escrituração digital, tributação, contabilização de operações, imobilizado, legislação e normas, sistemas, análise crítica, relacionamento com cliente, organização de rotinas, autoavaliação e percepção sobre desenvolvimento.',
  'Contábil',
  'rascunho',
  50
where not exists (
  select 1 from public.formularios_formularios
  where titulo = 'Mapeamento de Competências Técnicas — Analista Contábil'
);
