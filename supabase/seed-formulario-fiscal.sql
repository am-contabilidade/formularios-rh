-- Cria o card do formulário "Mapeamento de Competências — Fiscal"
-- (conteúdo em docs/Mapeamento Competencias - Fiscal.docx). Por enquanto só
-- o registro do formulário (sem seções/campos) — a maior parte das seções do
-- documento usa um formato de "grade de múltipla escolha" (matriz de
-- competências x escala 1-5/N/A) que TipoCampo ainda não suporta; entra numa
-- etapa seguinte, junto com o salvamento de respostas no banco.
--
-- Idempotente: não duplica se já existir um formulário com o mesmo título.

insert into public.formularios_formularios (titulo, descricao, categoria, status, estimativa_minutos)
select
  'Mapeamento de Competências — Fiscal',
  'Avaliação de competências técnicas da equipe fiscal: fundamentos tributários, regimes de tributação, ICMS, IPI, PIS/COFINS, ISS, retenções, documentos fiscais, obrigações acessórias, SPED, legislação, reforma tributária, sistemas, autoavaliação e percepção de carreira.',
  'Fiscal',
  'rascunho',
  45
where not exists (
  select 1 from public.formularios_formularios
  where titulo = 'Mapeamento de Competências — Fiscal'
);
