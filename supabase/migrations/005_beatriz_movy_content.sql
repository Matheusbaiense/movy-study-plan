-- Movy Internal Hub - Beatriz SOP content import.
-- Generated from FYME_SOP_Site (21).html. Rebranded from FYME to Movy.

insert into public.departments (
  slug, name_pt, name_en, name_es, color, icon, is_active,
  description_pt, description_en, description_es
)
values
  ($movy$visao-geral$movy$, $movy$Visao Geral$movy$, $movy$Visao Geral$movy$, $movy$Visao Geral$movy$, $movy$#4B1A77$movy$, null, true, $movy$Jornada do estudante, organograma, perfis de cliente e visao operacional criada pela Beatriz.$movy$, $movy$Jornada do estudante, organograma, perfis de cliente e visao operacional criada pela Beatriz.$movy$, $movy$Jornada do estudante, organograma, perfis de cliente e visao operacional criada pela Beatriz.$movy$),
  ($movy$captacao-vendas$movy$, $movy$Captacao & Vendas$movy$, $movy$Captacao & Vendas$movy$, $movy$Captacao & Vendas$movy$, $movy$#F36B1C$movy$, null, true, $movy$Primeiro contato, qualificacao, proposta, admissoes e timeline comercial.$movy$, $movy$Primeiro contato, qualificacao, proposta, admissoes e timeline comercial.$movy$, $movy$Primeiro contato, qualificacao, proposta, admissoes e timeline comercial.$movy$),
  ($movy$vistos$movy$, $movy$Vistos$movy$, $movy$Vistos$movy$, $movy$Vistos$movy$, $movy$#FBB615$movy$, null, true, $movy$Processos de visto Subclass 500, documentacao, GS, aplicacao e formularios.$movy$, $movy$Processos de visto Subclass 500, documentacao, GS, aplicacao e formularios.$movy$, $movy$Processos de visto Subclass 500, documentacao, GS, aplicacao e formularios.$movy$),
  ($movy$nomenclaturas$movy$, $movy$Nomenclaturas$movy$, $movy$Nomenclaturas$movy$, $movy$Nomenclaturas$movy$, $movy$#5A4E72$movy$, null, true, $movy$Padroes de nomenclatura e organizacao de documentos no Drive.$movy$, $movy$Padroes de nomenclatura e organizacao de documentos no Drive.$movy$, $movy$Padroes de nomenclatura e organizacao de documentos no Drive.$movy$),
  ($movy$student-support$movy$, $movy$Student Support$movy$, $movy$Student Support$movy$, $movy$Student Support$movy$, $movy$#D23B2B$movy$, null, true, $movy$Pre-embarque, chegada, welcome session e suporte continuo ao estudante.$movy$, $movy$Pre-embarque, chegada, welcome session e suporte continuo ao estudante.$movy$, $movy$Pre-embarque, chegada, welcome session e suporte continuo ao estudante.$movy$),
  ($movy$processos-ferramentas$movy$, $movy$Processos & Ferramentas$movy$, $movy$Processos & Ferramentas$movy$, $movy$Processos & Ferramentas$movy$, $movy$#3A1560$movy$, null, true, $movy$Refund, cancelamento, change of course, Monday, OSHC, CommBank e USI.$movy$, $movy$Refund, cancelamento, change of course, Monday, OSHC, CommBank e USI.$movy$, $movy$Refund, cancelamento, change of course, Monday, OSHC, CommBank e USI.$movy$),
  ($movy$politicas-internas$movy$, $movy$Politicas Internas$movy$, $movy$Politicas Internas$movy$, $movy$Politicas Internas$movy$, $movy$#2A1153$movy$, null, true, $movy$Politicas internas obrigatorias para colaboradores.$movy$, $movy$Politicas internas obrigatorias para colaboradores.$movy$, $movy$Politicas internas obrigatorias para colaboradores.$movy$),
  ($movy$links-recursos$movy$, $movy$Links & Recursos$movy$, $movy$Links & Recursos$movy$, $movy$Links & Recursos$movy$, $movy$#057570$movy$, null, true, $movy$Links uteis, recursos oficiais, intake dates e contatos internos.$movy$, $movy$Links uteis, recursos oficiais, intake dates e contatos internos.$movy$, $movy$Links uteis, recursos oficiais, intake dates e contatos internos.$movy$),
  ($movy$feedbacks$movy$, $movy$Feedbacks$movy$, $movy$Feedbacks$movy$, $movy$Feedbacks$movy$, $movy$#A63A50$movy$, null, true, $movy$Dashboard e analise de feedbacks de estudantes.$movy$, $movy$Dashboard e analise de feedbacks de estudantes.$movy$, $movy$Dashboard e analise de feedbacks de estudantes.$movy$),
  ($movy$atendimentos$movy$, $movy$Atendimentos$movy$, $movy$Atendimentos$movy$, $movy$Atendimentos$movy$, $movy$#7A4DB3$movy$, null, true, $movy$Base de atendimentos, indicadores e motivos de contato.$movy$, $movy$Base de atendimentos, indicadores e motivos de contato.$movy$, $movy$Base de atendimentos, indicadores e motivos de contato.$movy$)
on conflict (slug) do update set
  name_pt = excluded.name_pt,
  name_en = excluded.name_en,
  name_es = excluded.name_es,
  color = excluded.color,
  icon = excluded.icon,
  is_active = true,
  description_pt = excluded.description_pt,
  description_en = excluded.description_en,
  description_es = excluded.description_es;

update public.departments
set is_active = false
where slug <> all (ARRAY[$movy$visao-geral$movy$, $movy$captacao-vendas$movy$, $movy$vistos$movy$, $movy$nomenclaturas$movy$, $movy$student-support$movy$, $movy$processos-ferramentas$movy$, $movy$politicas-internas$movy$, $movy$links-recursos$movy$, $movy$feedbacks$movy$, $movy$atendimentos$movy$]::text[]);

update public.contents
set status = 'archived'::public.content_status,
    updated_at = now()
where slug not like 'beatriz-%';

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-visao-geral-organograma$movy$,
  $movy$Organograma$movy$,
  $movy$Organograma$movy$,
  $movy$Organograma$movy$,
  $movy$<div class="legacy-sop"><div><img src="/api/imported/beatriz-sop-image-1.png" alt="Organograma Movy"></div></div>$movy$,
  $movy$Estrutura da equipe Movy Student Services$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$visao-geral$movy$]::text[],
  $movy$process$movy$,
  $movy$Visao Geral$movy$,
  'internal',
  2,
  '2.1',
  true
from public.departments d
where d.slug = $movy$visao-geral$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-visao-geral-sobre-a-movy$movy$,
  $movy$Sobre a Movy$movy$,
  $movy$Sobre a Movy$movy$,
  $movy$Sobre a Movy$movy$,
  $movy$<div class="legacy-sop"><div><div><div>Fundadores</div><div>Marcos Douglas</div></div><div><div>Fundada em</div><div>2019 · Perth, Austrália</div></div><div><div>Conceito central</div><div>AMPLIFY ME</div></div></div><div class="sh t">Missão, Visão e Valores</div><div><div><div>🎯 MISSÃO</div><p>Facilitar a jornada de estudantes brasileiros na Austrália, oferecendo suporte completo e personalizado para que cada pessoa possa maximizar seu potencial durante a experiência internacional.</p></div><div><div>🌟 VISÃO</div><p>Ser reconhecida como a principal referência em suporte educacional e de desenvolvimento pessoal para brasileiros na Austrália, criando uma comunidade global de profissionais preparados para os desafios do futuro.</p></div></div><div><div><div>🤝</div><div>EXCELÊNCIA</div><div>Qualidade em todos os serviços</div></div><div><div>❤️</div><div>EMPATIA</div><div>Entender cada estudante individualmente</div></div><div><div>💡</div><div>INOVAÇÃO</div><div>Novas soluções para melhorar a experiência</div></div><div><div>🔍</div><div>INTEGRIDADE</div><div>Transparência em todas as relações</div></div><div><div>🌍</div><div>COMUNIDADE</div><div>Conexões significativas entre membros</div></div></div><div class="sh t">Os 3 Pilares da Movy</div><div><div><div>📚 EDUCAÇÃO</div><p>Suporte acadêmico completo: orientação para escolha de cursos até acompanhamento durante toda a jornada educacional.</p></div><div><div>🚀 DESENVOLVIMENTO</div><p>Programas e mentoria para desenvolvimento de habilidades profissionais e pessoais.</p></div><div><div>🤝 NETWORKING</div><p>Criação de uma rede de contatos valiosa entre estudantes, profissionais e empresas em ambos os países.</p></div></div><div class="sh t">Serviços — 3 áreas principais</div><table class="tbl"><thead><tr><th>Área</th><th>O que oferece</th></tr></thead><tbody><tr><td><strong>📚 Educação</strong></td><td>Consultoria educacional personalizada. Auxílio na escolha do curso ideal conforme objetivos, orçamento e perfil. Cuidamos da matrícula, seguro, visto e preparação para o embarque.</td></tr><tr><td><strong>💼 Carreira</strong></td><td>Orientação profissional baseada nas áreas em demanda na Austrália. Análise do histórico acadêmico e profissional, caminhos para vistos por habilidades e planejamento de carreira internacional.</td></tr><tr><td><strong>🌐 Migração</strong></td><td>Agentes de migração parceiros e registrados que conduzem a análise de elegibilidade, explicam os tipos de visto e guiam todo o processo migratório com transparência.</td></tr></tbody></table><div class="sh t">Ferramentas internas</div><table class="tbl"><thead><tr><th>Plataforma</th><th>Uso principal</th></tr></thead><tbody><tr><td><strong>HubSpot</strong></td><td>CRM central — integra atendimento, marketing, vendas e suporte. Todos os leads, comunicações e tarefas são registradas aqui.</td></tr><tr><td><strong>Monday</strong></td><td>Organização de tarefas, histórico de clientes e projetos internos (em transição para HubSpot).</td></tr><tr><td><strong>Xero</strong></td><td>Sistema financeiro — emissão de faturas, controle de pagamentos e recebimentos.</td></tr><tr><td><strong>Acuity</strong></td><td>Agendamento de reuniões e sessões com alunos.</td></tr><tr><td><strong>JotForm</strong></td><td>Coleta estruturada de documentos e formulários.</td></tr><tr><td><strong>Google Workspace</strong></td><td>E-mail, agenda, arquivos compartilhados, apresentações e planilhas.</td></tr></tbody></table></div>$movy$,
  $movy$Fundação · Missão · Visão · Valores · Pilares · Serviços · Ferramentas internas$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$visao-geral$movy$]::text[],
  $movy$process$movy$,
  $movy$Visao Geral$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$visao-geral$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-visao-geral-perfis-de-cliente$movy$,
  $movy$Perfis de Cliente$movy$,
  $movy$Perfis de Cliente$movy$,
  $movy$Perfis de Cliente$movy$,
  $movy$<div class="legacy-sop"><div class="pcards"><div class="pcard o"><div class="pc-lbl">✈️ OFFSHORE</div><div class="pc-sub">Aluno localizado fora da Austrália</div><div class="pc-note">Aplica para um visto de estudante novo a partir do Brasil ou de outro país.</div><ul class="bl"><li>Reside fora da Austrália no momento da aplicação</li><li>Precisa de visto novo (Subclass 500) para entrar no país</li><li>O processo de visto ocorre antes do embarque</li><li>Requer GS Student Visa e documentação de vínculos no Brasil</li><li>Pode incluir dependentes (cônjuge e/ou filhos) no mesmo processo</li></ul></div><div class="pcard t"><div class="pc-lbl">🇦🇺 ONSHORE</div><div class="pc-sub">Aluno já presente na Austrália</div><div class="pc-note">Já vive na Austrália e precisa renovar ou alterar o visto dentro do país.</div><ul class="bl"><li>Já reside e/ou estuda em Perth com visto ativo</li><li>Solicita renovação de visto (Subclass 500) de dentro da Austrália</li><li>Pode já ser cliente da Movy ou chegar como cliente novo</li><li>Pode adicionar dependentes via Subsequent Entrant</li><li>Dispensa algumas etapas do processo offshore (GS pode ser simplificada)</li></ul></div></div></div>$movy$,
  $movy$Identifique o perfil antes de iniciar — a jornada difere conforme a situação$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$visao-geral$movy$]::text[],
  $movy$process$movy$,
  $movy$Visao Geral$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$visao-geral$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-visao-geral-pre-captacao-passiva$movy$,
  $movy$Pré-Captação Passiva$movy$,
  $movy$Pré-Captação Passiva$movy$,
  $movy$Pré-Captação Passiva$movy$,
  $movy$<div class="legacy-sop"><div class="box alert"><strong>⚠️ GAP OPERACIONAL — Registro manual no Monday</strong>A integração Calendly → Monday está desativada há 6 meses. Todo lead precisa ser inserido manualmente. Prioridade urgente.</div><div class="sh t">Canais de entrada</div><table class="tbl"><thead><tr><th>Canal</th><th>Como o cliente chega</th><th>Ação do time Movy</th></tr></thead><tbody><tr><td><strong>🚪 Presencial</strong></td><td>Chega no escritório</td><td class="mut">Acomodar ou agendar via Calendly</td></tr><tr><td><strong>🌐 Website</strong></td><td>E-mail de contato ou Calendly</td><td class="mut">Avaliar intenção → link Calendly correto</td></tr><tr><td><strong>📸 Instagram DM/Bio</strong></td><td>DM ou link na bio</td><td class="mut">Atender → WhatsApp → triagem → Calendly</td></tr><tr><td><strong>📱 WhatsApp</strong></td><td>Contato direto</td><td class="mut">Triagem → link Calendly</td></tr><tr><td><strong>📞 Telefone</strong></td><td>Ligação direta</td><td class="mut">Triagem → agendar via Calendly</td></tr><tr><td><strong>👥 Indicação</strong></td><td>Indicado por cliente</td><td class="mut">Contato proativo → Calendly</td></tr><tr><td><strong>🎪 Eventos</strong></td><td>Feiras presenciais</td><td class="mut">Coletar contato → follow-up → Calendly</td></tr></tbody></table></div>$movy$,
  $movy$Canais de entrada — como a Movy é encontrada$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$visao-geral$movy$]::text[],
  $movy$process$movy$,
  $movy$Visao Geral$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$visao-geral$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-captacao-vendas-captacao-primeiro-contato$movy$,
  $movy$Captação & Primeiro Contato$movy$,
  $movy$Captação & Primeiro Contato$movy$,
  $movy$Captação & Primeiro Contato$movy$,
  $movy$<div class="legacy-sop"><div class="sh t">Opção A — Resposta direta e objetiva</div><div class="tcard"><div class="tcard-head t"><div class="tcard-lbl t">Opção A — Coleta rápida de dados</div></div><div class="tcard-body">Obrigada por entrar em contato com a gente! Você pode nos enviar seu nome completo, e-mail e telefone por favor? Queremos personalizar essa experiência para você!</div></div><div class="sh o">Opção B — Apresentação completa + agendamento</div><div class="tcard"><div class="tcard-head o"><div class="tcard-lbl o">Opção B — Apresentação + agendamento</div></div><div class="tcard-body">Olá! Obrigado por entrar em contato conosco! Se esta é sua primeira vez nos contatando, gostaríamos de tornar sua experiência ainda mais personalizada. Por favor, nos forneça seu nome completo, e-mail e telefone. Estamos aqui para ajudar! Lembrando que nosso horário de funcionamento é das 9h às 17h, horário da Austrália. Entraremos em contato o mais breve possível. Além disso, que tal agendar um bate-papo personalizado com um de nossos consultores especializados? Basta clicar no link abaixo e escolher o horário que melhor se adequa a você. <strong>[LINK DE AGENDAMENTO DO CONSULTOR]</strong></div></div><div class="sh n">Perguntas adicionais de qualificação</div><div class="cl"><div class="ci"><div class="cb"></div><div class="ct">Onde você mora atualmente?</div></div><div class="ci"><div class="cb"></div><div class="ct">Você tem um destino específico em mente ou está aberto a diferentes opções?</div></div><div class="ci"><div class="cb"></div><div class="ct">Qual é o período de tempo que você pretende passar no exterior?</div></div><div class="ci"><div class="cb"></div><div class="ct">Qual é o seu nível de inglês?</div></div></div><div class="sh t">Links de agendamento por consultor</div><table class="tbl"><thead><tr><th>Consultor</th><th>Link</th></tr></thead><tbody><tr><td><strong>Marcos</strong></td><td><a href="https://movy.as.me/Marcos">movy.as.me/Marcos</a></td></tr><tr><td><strong>Beatrice</strong></td><td><a href="https://movy.as.me/Beatrice">movy.as.me/Beatrice</a></td></tr><tr><td><strong>Mariana</strong></td><td><a href="https://movy.as.me/Mariana">movy.as.me/Mariana</a></td></tr><tr><td><strong>Matheus</strong></td><td><a href="https://movy.as.me/Matheus">movy.as.me/Matheus</a></td></tr><tr><td>Visa (geral)</td><td><a href="https://movy.as.me/Visa">movy.as.me/Visa</a></td></tr></tbody></table></div>$movy$,
  $movy$Textos automáticos, qualificação e links de agendamento$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$captacao-vendas$movy$]::text[],
  $movy$process$movy$,
  $movy$Captacao & Vendas$movy$,
  'internal',
  2,
  '2.1',
  true
from public.departments d
where d.slug = $movy$captacao-vendas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-captacao-vendas-pos-captacao-vendas-consultoria-admissoes$movy$,
  $movy$Pós-Captação + Vendas & Consultoria + Admissões$movy$,
  $movy$Pós-Captação + Vendas & Consultoria + Admissões$movy$,
  $movy$Pós-Captação + Vendas & Consultoria + Admissões$movy$,
  $movy$<div class="legacy-sop"><div class="sh t">Reunião exploratória — o que cobrir</div><div class="cl"><div class="ci"><div class="cb"></div><div class="ct">Objetivo na Austrália — estudar, trabalhar, migrar, evoluir</div></div><div class="ci"><div class="cb"></div><div class="ct">Tipo de curso — inglês, VET, diploma, bachelor, master</div></div><div class="ci"><div class="cb"></div><div class="ct">Escola de interesse — já pesquisou ou precisa de indicação?</div></div><div class="ci"><div class="cb"></div><div class="ct">Situação familiar — sozinho ou com família/dependentes?</div></div><div class="ci"><div class="cb"></div><div class="ct">Situação financeira — pode arcar com os custos?</div></div><div class="ci"><div class="cb"></div><div class="ct">Prazo — quando pretende ir? Tem data definida?</div></div><div class="ci"><div class="cb"></div><div class="ct">Histórico de vistos — nunca teve? Já teve? Foi negado?</div></div></div><div class="box tip"><strong>🎥 CONSULTORIA OFFSHORE</strong>Para alunos no Brasil, agendar via Google Meet. Enviar link com antecedência.</div><div class="sh o">Processo de Admissão — 13 passos oficiais</div><p class="body-t">Processo completo conforme guideline oficial Movy. Seguir a ordem — cada passo tem um responsável definido.</p><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Contato e envio da cotação</div><div class="step-note">→ Solicitar documentos básicos (passaporte, seguro, visto). Consultar <a href="https://docs.google.com/spreadsheets/d/1rmRWQUg98WelR9xBnoYz1I36r2qXwuOZ0PUTQ7d9wjw/edit#gid=0">Admissions Per School</a> para documentos exigidos.</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Atualizar o Monday</div><div class="step-note">→ Criar lead na DATABASE → "Move to CRM" → selecionar consultor no Controle de Atendimento → status: Analysing Quote</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Salvar documentos no Drive</div><div class="step-note">→ Clients &gt; Student Name &gt; Documents — criar pasta se não existir</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Nomear os documentos</div><div class="step-note">→ Seguir <a href="https://docs.google.com/document/d/13RdhFzA1zytxlwv-KMnkvYwv1ipucIKvTk0IPS-UR90/edit">nomenclatura oficial Movy</a></div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Documentos certificados</div><div class="step-note">→ Verificar no Admissions Per School se precisam ser certificados. Se sim: abrir pasta "Certified" e seguir <a href="https://docs.google.com/document/d/1M6iO-X3bYE-8y_4tS9gV0LB-htpFggjLfgtjUvI4vAA/edit">procedimento de certificação</a> (assinatura do MD)</div></div></div><div class="step"><div class="step-n">6.</div><div><div class="step-t">Documentos traduzidos</div><div class="step-note">→ Verificar no Admissions Per School se precisam de tradução. Se sim, usar o <a href="https://docs.google.com/document/d/1RhGSeVkXabjnZjUXW_mcknaREH2iGQTS1BxzrpBok5Y/edit">procedimento oficial de tradução</a></div></div></div><div class="step"><div class="step-n">7.</div><div><div class="step-t">Enviar matrícula para a escola (online + presencial)</div><div class="step-note">→ Conforme Admissions Per School. Verificar formulários atualizados. <a href="https://docs.google.com/spreadsheets/d/1YmScMObToZysqp_C8YVb5KZBZf9KboLaeGwnIM6caIc/edit#gid=0">School Contacts</a></div></div></div><div class="step"><div class="step-n">8.</div><div><div class="step-t">Atualizar Monday → status "In Process"</div><div class="step-note">→ Após submeter a aplicação à escola</div></div></div><div class="step"><div class="step-n">9.</div><div><div class="step-t">Receber a Offer Letter — seguir checklist completo antes do Next Step</div><div class="step-note">→ Verificar dados, datas, condições, calcular OSHC, enviar via JotForm para assinatura. Ver subseção abaixo.</div></div></div><div class="step"><div class="step-n">10.</div><div><div class="step-t">Atualizar Monday → status "Awaiting for Payment"</div><div class="step-note">→ Após enviar o e-mail de Next Step ao aluno</div></div></div><div class="step"><div class="step-n">11.</div><div><div class="step-t">Pagamento recebido — enviar ao Finance para solicitar COE</div><div class="step-note">→ Incluir todos os documentos necessários. Se pagar em momentos diferentes, encaminhar cada confirmação na mesma thread.</div></div></div><div class="step"><div class="step-n">12.</div><div><div class="step-t">Atualizar Monday → status "Paid"</div></div></div><div class="step"><div class="step-n">13.</div><div><div class="step-t">COE — Finance solicita à escola e salva na pasta</div><div class="step-note">⚠️ Responsabilidade do Finance — não do consultor. Finance também move o lead para o mês de pagamento.</div></div></div></div><div class="box warn"><strong>⚠️ OFFSHORE vs ONSHORE — Movy ENROL</strong>O formulário Jotform tem versões diferentes. Enviar o link errado causa retrabalho. Verificar sempre.</div><div class="sh t">Offer Letter — checklist antes do Next Step</div><p class="body-t">Salvar a Offer Letter na pasta mesmo se houver erro — contatar admissões da escola para correção.</p><div class="cl"><div class="ci"><div class="cb"></div><div class="ct">Offer Letter correta com base no estudo estimado (escolha do aluno)</div></div><div class="ci"><div class="cb"></div><div class="ct">Dados do aluno corretos (nome, data de nascimento)</div></div><div class="ci"><div class="cb"></div><div class="ct">Nome do curso e/ou especialização corretos</div></div><div class="ci"><div class="cb"></div><div class="ct">Intake e end date corretos</div></div><div class="ci"><div class="cb"></div><div class="ct">Férias corretas</div></div><div class="ci"><div class="cb"></div><div class="ct">Terms and Conditions verificados</div></div><div class="ci"><div class="cb"></div><div class="ct">Deposit para COE verificado</div></div><div class="ci"><div class="cb"></div><div class="ct">OSHC calculado conforme regras</div></div><div class="ci"><div class="cb"></div><div class="ct">Offer Letter enviada via JotForm para assinatura<span class="cn">→ Separado do Next Step. Login: marketing@movyeducation.com / Movy@movy123</span></div></div></div><div class="box info"><strong>📅 CÁLCULO DE OSHC</strong>Início opção 1: dia após o OSHC atual terminar · Início opção 2: 1 mês antes das aulas · Fim: &gt;10 meses = 2 meses de férias · &gt;10 meses terminando Nov/Dez = férias até 15/03 · &lt;10 meses = 1 mês de férias. <strong>Múltiplas escolas:</strong> aguardar todas as Offer Letters antes de enviar o Next Step (exceto se uma já está começando).</div><div class="sh t">Modelo de e-mail — Next Step</div><div class="email"><div class="email-hdr t"><div class="ef"><span>De:</span> [consultor]@movyeducation.com</div><div class="ef"><span>Para:</span><em>[E-mail do aluno]</em></div><div class="ef"><span>CC:</span><span class="cc-tag">visa@movyeducation.com</span></div><div class="ef"><span>Assunto:</span><span class="subj t">Next Steps — Plano de Estudo e Matrícula</span></div></div><div class="email-note">Personalizar os campos em destaque</div><div class="email-body">Olá [Nome do aluno], espero que esteja bem! Primeiramente gostaria de dizer que ficamos muito felizes em ter escolhido fazer parte da família Movy. Estaremos em contato durante as próximas semanas para concluirmos a sua matrícula na escola! Abaixo estão os detalhes do seu plano de estudo e próximos passos: <strong>Instituição:</strong> [Nome da escola] <strong>Curso:</strong> [Nome do curso] <strong>Início das aulas:</strong> [DD/MM/AAAA] <strong>Valor da Matrícula:</strong> AUD [valor] * Aceite da carta de oferta e pagamento através do seu portal do estudante ------------------------------------------- OSHC + Visa Immi - OSHC [seguradora] [perfil] ([data início] - [data fim]) - AUD [valor] - Immigration Visa Fee ([perfil]) - AUD [valor] - Movy administrative fee - AUD 330 <strong>Total - AUD [valor total]</strong> Sugestão de pagamento até [data] - previsão para aplicação do visto! ------------------------------------------- <strong>Pagamento na conta da agência:</strong><strong>Bank Name:</strong> Commonwealth Bank of Australia <strong>Account Name:</strong> Movy Pty Ltd | <strong>BSB:</strong> 066000 | <strong>Account Number:</strong> 13211658 <strong>Swift Code:</strong> CTBAAU2S Descrição: [Nome completo] [Offshore/Onshore] <strong>TERMOS & CONDIÇÕES Movy</strong><span class="lnk">Assinar T&C: https://form.jotform.com/movyeducation/terms-conditions</span> Esses termos deixam claro que atuamos como intermediários entre você e os provedores selecionados, com o objetivo de simplificar e coordenar todos os processos. Não cobramos taxas administrativas, salvo em casos de cancelamento (AUD $500). Após carta de aceite assinada e pagamento efetuado, daremos início à etapa de preparação para aplicação do seu visto! <strong>IMPORTANTE (Onshore)</strong> Se você pretende <strong>sair da Austrália</strong> por qualquer período e seu visto ainda não foi aprovado, <strong>nos informe imediatamente</strong>. Será necessário aplicar para o BVB, indicando sua ausência durante esse período. Sem a aprovação do BVB, você não poderá retornar à Austrália até que o visto de estudante seja aprovado. Kindly, [Nome do consultor] — Movy Student Services</div></div><div class="sh t">T&C — pontos-chave</div><ul class="bl"><li>Contrato entre Movy Group Pty Ltd (ACN: 672 722 511) e o estudante</li><li>Movy atua como intermediária — não cobra taxas administrativas pelos serviços <span class="note">→ Exceção: cancelamento por qualquer motivo = AUD $500</span></li><li>Taxa de cancelamento: AUD $500 mesmo que a escola dê 100% de reembolso <span class="note">→ Cláusula 1.4 — explicar ANTES de assinar</span></li><li>Reembolso: processado em até 90 dias via Refund Form <span class="note">→ Cláusula 1.6</span></li><li>Anti-difamação: multa mínima de AUD $1.000 <span class="note">→ Cláusula 11.3</span></li><li>Foro: Queensland</li></ul><div class="sh n">Responsabilidades de e-mail</div><table class="tbl"><thead><tr><th>Tipo</th><th>Quem envia</th><th>Em cópia</th><th>Observação</th></tr></thead><tbody><tr><td><strong>Cancelamentos</strong></td><td class="tl">Admin</td><td>Consultor · Finance · Visa</td><td class="mut">CC para acompanhamento</td></tr><tr><td><strong>Cobranças de diferenças</strong></td><td class="tl">Finance</td><td>Consultor · Admin · Visa (BCC)</td><td class="mut">Cópia OCULTA</td></tr><tr><td><strong>BVB / Subsequente</strong></td><td class="tl">Visa</td><td>Consultor · Admin · Finance</td><td class="mut">Após aplicação do visto</td></tr></tbody></table><div class="sh r">Repasse de leads entre consultores</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Consultor atual adiciona todo o histórico na DATA BASE</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Comunica o Admin via e-mail com o nome completo do lead</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Admin troca o tag e registra no campo Notes do Monday</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Consultor atual deleta o lead do seu pipeline</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Novo consultor prossegue com o atendimento</div></div></div></div></div>$movy$,
  $movy$Do lead qualificado ao COE emitido$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$captacao-vendas$movy$]::text[],
  $movy$process$movy$,
  $movy$Captacao & Vendas$movy$,
  'internal',
  5,
  '2.1',
  false
from public.departments d
where d.slug = $movy$captacao-vendas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-captacao-vendas-recap-educational-consultancy-timeline$movy$,
  $movy$Recap — Educational Consultancy Timeline$movy$,
  $movy$Recap — Educational Consultancy Timeline$movy$,
  $movy$Recap — Educational Consultancy Timeline$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>#</th><th>Etapa</th><th>O que fazer</th><th>Recurso</th></tr></thead><tbody><tr><td class="acc"><strong>1</strong></td><td><strong>Lead no pipeline</strong></td><td>Entrar em contato em até 24h — exceto fins de semana</td><td class="mut">WhatsApp + e-mail</td></tr><tr><td class="acc"><strong>2</strong></td><td><strong>Primeiro contato</strong></td><td>Usar Opção A ou B — coletar nome, e-mail, telefone</td><td class="mut">Templates A / B</td></tr><tr><td class="acc"><strong>3</strong></td><td><strong>Qualificação</strong></td><td>Entender objetivo, prazo, curso, situação familiar e histórico de vistos</td><td class="mut">Perguntas de qualif.</td></tr><tr><td class="acc"><strong>4</strong></td><td><strong>Reunião</strong></td><td>Consultoria exploratória — Google Meet para offshore</td><td class="mut">Calendly</td></tr><tr><td class="acc"><strong>5</strong></td><td><strong>Proposta</strong></td><td>Criar no HubSpot e enviar cotação no mesmo dia</td><td class="mut"><a href="https://australiachannel.monday.com/docs/5805356505">Monday docs/5805356505</a></td></tr><tr><td class="acc"><strong>6</strong></td><td><strong>Docs + Drive</strong></td><td>Salvar docs na pasta Clients &gt; Student Name &gt; Documents. Nomear conforme nomenclatura oficial.</td><td class="mut"><a href="https://docs.google.com/document/d/13RdhFzA1zytxlwv-KMnkvYwv1ipucIKvTk0IPS-UR90/edit">Nomenclatura Movy</a></td></tr><tr><td class="acc"><strong>7</strong></td><td><strong>Certificados / Tradução</strong></td><td>Verificar Admissions Per School se docs precisam ser certificados ou traduzidos</td><td class="mut"><a href="https://docs.google.com/spreadsheets/d/1rmRWQUg98WelR9xBnoYz1I36r2qXwuOZ0PUTQ7d9wjw/edit#gid=0">Admissions Per School</a></td></tr><tr><td class="acc"><strong>8</strong></td><td><strong>Matrícula na escola</strong></td><td>Enviar matrícula online + presencial conforme Admissions Per School → Monday: "In Process"</td><td class="mut"><a href="https://docs.google.com/spreadsheets/d/1YmScMObToZysqp_C8YVb5KZBZf9KboLaeGwnIM6caIc/edit#gid=0">School Contacts</a></td></tr><tr><td class="acc"><strong>9</strong></td><td><strong>Offer Letter</strong></td><td>Checklist completo + calcular OSHC + enviar via JotForm para assinatura</td><td class="mut">Checklist Offer Letter</td></tr><tr><td class="acc"><strong>10</strong></td><td><strong>Next Step e-mail</strong></td><td>Enviar Offer Letter + T&C + dados bancários (CC Vistos) → Monday: "Awaiting for Payment"</td><td class="mut">Modelo Next Step</td></tr><tr><td class="acc"><strong>11</strong></td><td><strong>Pagamento</strong></td><td>Receber confirmação → enviar ao Finance para solicitar COE → Monday: "Paid"</td><td class="mut">E-mail para Finance</td></tr><tr><td class="acc"><strong>12</strong></td><td><strong>COE (Finance)</strong></td><td>Finance solicita COE à escola, salva na pasta e move lead para o mês de pagamento</td><td class="mut">⚠️ Responsabilidade do Finance</td></tr><tr><td class="acc"><strong>13</strong></td><td><strong>Visa take over</strong></td><td>Time de Vistos assume — processo de visto inicia após pagamento confirmado</td><td class="mut">Board de Vistos</td></tr></tbody></table><div class="box info"><strong>📋 QUANDO O VISA É ACIONADO</strong>O departamento de Visa só inicia após qualquer tipo de recebimento do aluno (pagamento confirmado). O processo começa com e-mail ao estudante com todos os passos e links.</div></div>$movy$,
  $movy$Visão consolidada do processo completo$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$captacao-vendas$movy$]::text[],
  $movy$checklist$movy$,
  $movy$Captacao & Vendas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$captacao-vendas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-vistos-departamento-de-vistos$movy$,
  $movy$Departamento de Vistos$movy$,
  $movy$Departamento de Vistos$movy$,
  $movy$Departamento de Vistos$movy$,
  $movy$<div class="legacy-sop"><div class="sh t">Tipos de visto — Subclass 500</div><table class="tbl"><thead><tr><th>Tipo de curso</th><th>Configuração familiar</th><th>Observação</th></tr></thead><tbody><tr><td>Inglês (ELICOS)</td><td>Titular solteiro</td><td class="mut">Mais comum entre brasileiros</td></tr><tr><td>VET (Diploma, Cert. IV, III)</td><td>Titular solteiro</td><td class="mut">Cursos técnicos</td></tr><tr><td>Bachelor</td><td>Titular com família</td><td class="mut">Inclui cônjuge e/ou filhos</td></tr><tr><td>Master (Pós-graduação)</td><td>Titular com família</td><td class="mut">Documentação adicional para dependentes</td></tr><tr><td>Inglês ou VET</td><td>Com dependentes &lt;18</td><td class="mut">GS específico para menores</td></tr></tbody></table><div class="sh t">Documentação geral — todos os tipos</div><ul class="bl"><li>Passaporte válido (mínimo 6 meses após o término do curso)</li><li>COE — Confirmation of Enrolment</li><li>Offer Letter da escola</li><li>Comprovante financeiro (extrato bancário, IR, patrocinador)</li><li>Genuine Student Statement (GS) — elaborada por Julia</li><li>Formulário 956A — autorização de representante de imigração</li><li>Fotos, histórico de viagens, registro de vistos anteriores</li></ul><div class="box warn"><strong>⚠️ GENUINE STUDENT STATEMENT (GS)</strong>A GS é um dos documentos mais críticos — uma GS fraca aumenta significativamente o risco de recusa. Elaborada por Julia.</div><div class="sh t">Tipos de GS</div><ul class="bl"><li><strong>GS Student Visa</strong> — visto novo, titular solteiro ou sem dependentes. Perguntas 1 a 5. <span class="note">→ O mais comum</span></li><li><strong>GS Partner (Dependent 18+)</strong> — cônjuge maior de 18 incluído no visto</li><li><strong>GS Dependent Under 18</strong> — dependente menor de 18</li></ul><div class="sh2">GS Student Visa — estrutura das 5 perguntas</div><table class="tbl"><thead><tr><th>Pergunta</th><th>O que deve cobrir</th></tr></thead><tbody><tr><td><strong>P1 — Vínculos no Brasil</strong></td><td>Com quem mora, trabalho nos últimos 5 anos, cursos, vínculos familiares e econômicos</td></tr><tr><td><strong>P2 — Motivação</strong></td><td>Por que esse curso, por que Austrália e não Brasil, sustento financeiro, consciência das regras do visto</td></tr><tr><td><strong>P3 — Benefícios ao retornar</strong></td><td>Como o curso vai ajudar na carreira no Brasil, salário esperado</td></tr><tr><td><strong>P4 — Informações adicionais</strong></td><td>Vínculos financeiros, sonho pessoal, familiares na Austrália, bolsas</td></tr><tr><td><strong>P5 — Histórico na Austrália</strong></td><td>Histórico completo de entradas, cursos, pedidos anteriores, recusas</td></tr></tbody></table><div class="box info"><strong>🔁 SUBSEQUENT ENTRANT</strong>Aluno já em Perth que quer adicionar dependente usa o Subsequent Entrant — aplicação separada coordenada por Julia.</div><div class="sh t">Student Visa Renewal — campos principais</div><ul class="bl"><li>Dados pessoais completos, passaporte, estado civil, cidadania</li><li>Exame de saúde nos últimos 12 meses?</li><li>Histórico de visto: negado ou cancelado?</li><li>Cônjuge ou filhos inclusos? — dados completos de cada dependente</li><li>Teste de inglês: nome, data, número de referência, pontuação</li><li>Situação de emprego no Brasil: cargo, empresa, contato</li><li>Comprovante financeiro: extrato ou declaração de patrocinador (valor em AUD)</li></ul><div class="sh t">Passo a passo — Julia</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Receber COE + Offer Letter do consultor</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Coletar documentação conforme o tipo de visto</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Elaborar a Genuine Student Statement (GS) personalizada</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Preparar o formulário 956A</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Montar e revisar o dossiê completo</div></div></div><div class="step"><div class="step-n">6.</div><div><div class="step-t">Realizar a aplicação no ImmiAccount</div></div></div><div class="step"><div class="step-n">7.</div><div><div class="step-t">Cliente paga a taxa governamental</div></div></div><div class="step"><div class="step-n">8.</div><div><div class="step-t">Acompanhar até a decisão e comunicar o cliente</div><div class="step-note">→ Pode levar semanas a meses</div></div></div></div><div class="box alert"><strong>🚨 VEVO</strong>Ao aprovar, orientar o cliente a verificar condições no VEVO. O cliente SÓ pode entrar na Austrália a partir da data indicada.</div></div>$movy$,
  $movy$Responsável: Julia · Aplicação Subclass 500$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$vistos$movy$]::text[],
  $movy$process$movy$,
  $movy$Vistos$movy$,
  'internal',
  3,
  '2.1',
  true
from public.departments d
where d.slug = $movy$vistos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-vistos-formularios-de-visto$movy$,
  $movy$Formulários de Visto$movy$,
  $movy$Formulários de Visto$movy$,
  $movy$Formulários de Visto$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Formulário</th><th>Função</th><th>Quem envia</th></tr></thead><tbody><tr><td><strong>T&C — Movy ENROL Agreement</strong></td><td>Contrato de prestação de serviços</td><td class="mut">Consultor — junto ao Next Step</td></tr><tr><td><strong>Movy ENROL Jotform (Offshore)</strong></td><td>Pré-matrícula e upload de docs — perfil offshore</td><td class="mut">Consultor envia link ao cliente</td></tr><tr><td><strong>Movy ENROL Jotform (Onshore)</strong></td><td>Pré-matrícula e upload de docs — perfil onshore</td><td class="mut">Consultor envia link ao cliente</td></tr><tr><td><strong>GS Student Visa</strong></td><td>Declaração de genuinidade — 5 perguntas</td><td class="mut">Julia elabora</td></tr><tr><td><strong>GS Partner (Dependent 18+)</strong></td><td>GS específica para cônjuge</td><td class="mut">Julia elabora</td></tr><tr><td><strong>GS Dependent Under 18</strong></td><td>GS para filhos menores de 18</td><td class="mut">Julia elabora</td></tr><tr><td><strong>Formulário 956A</strong></td><td>Autorização de representante de imigração</td><td class="mut">Julia</td></tr><tr><td><strong>Student Visa Form — Renewal</strong></td><td>Coleta de dados para renovação</td><td class="mut">Julia</td></tr><tr><td><strong>Subsequent Entrant</strong></td><td>Dependente de aluno já em Perth</td><td class="mut">Julia</td></tr><tr><td><strong>Medical History</strong></td><td>My Health Declarations — exames médicos</td><td class="mut">Julia (quando exigido)</td></tr><tr><td><strong>Withdrawal & Refund</strong></td><td>Cancelamento e reembolso</td><td class="mut">Financeiro / Admin</td></tr></tbody></table></div>$movy$,
  $movy$Todos os formulários utilizados no processo de visto$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$vistos$movy$]::text[],
  $movy$process$movy$,
  $movy$Vistos$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$vistos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-student-support-visto-aprovado-e-agora$movy$,
  $movy$Visto Aprovado — E Agora?$movy$,
  $movy$Visto Aprovado — E Agora?$movy$,
  $movy$Visto Aprovado — E Agora?$movy$,
  $movy$<div class="legacy-sop"><div class="box info"><strong>🔄 FLUXO</strong>1. Consultor envia E-mail 1 (CC studentsupport@movyeducation.com). 2. Student Support entra em contato no mesmo dia. 3. Objetivo: aluno agenda pré-embarque em 24–48h.</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Enviar E-mail 1 imediatamente com CC para studentsupport@movyeducation.com</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Anexar o Grant Letter — verificar que o PDF está correto</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Confirmar dados: data de validade, condições, limite de horas</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Verificar data de início das aulas no COE</div><div class="step-note">→ Recomendamos chegar 5–7 dias antes</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Registrar no CRM como VISTO APROVADO</div></div></div><div class="step"><div class="step-n">6.</div><div><div class="step-t">Enviar link movy.as.me/pre-embarque junto ao E-mail 1</div></div></div></div><div class="sh o">E-mail 1 — Visto Aprovado</div><div class="email"><div class="email-hdr o"><div class="ef"><span>CC:</span><span class="cc-tag">studentsupport@movyeducation.com</span></div><div class="ef"><span>Assunto:</span><span class="subj o">🎉 PARABÉNS! Seu visto foi APROVADO!</span></div></div><div class="email-body">Olá [Nome], PARABÉNS! Seu visto foi APROVADO até o dia [DD/MM/AAAA]! 🦘 Estamos muito felizes e nos sentimos prestigiados por fazer parte dessa parte importante da sua vida. [Nome do Responsável], do nosso time de Student Support, vai te auxiliar na sua vinda para a terra dos cangurus! Segue em anexo o Grant Letter. Lembre-se de ter sempre com você. <span class="lnk">👉 Agende sua reunião de pré-embarque: movy.as.me/pre-embarque</span> Se estiver feliz com os serviços da Movy, deixe um review: <span class="lnk">👉 Google: g.page/r/Cek5gWqxaf-wEBM/review</span><span class="lnk">👉 Facebook: facebook.com/movyeducation/reviews/</span> Muito obrigada! — Equipe Movy Student Services</div></div></div>$movy$,
  $movy$Consultor + Student Support agem em paralelo$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$student-support$movy$]::text[],
  $movy$process$movy$,
  $movy$Student Support$movy$,
  'internal',
  2,
  '2.1',
  true
from public.departments d
where d.slug = $movy$student-support$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-student-support-reuniao-de-pre-embarque$movy$,
  $movy$Reunião de Pré-Embarque$movy$,
  $movy$Reunião de Pré-Embarque$movy$,
  $movy$Reunião de Pré-Embarque$movy$,
  $movy$<div class="legacy-sop"><div class="icards"><div class="icard"><div class="icard-lbl">Formato</div><div class="icard-val o">Online (offshore)</div></div><div class="icard"><div class="icard-lbl">Duração</div><div class="icard-val t">30–45 min</div></div><div class="icard"><div class="icard-lbl">Agendamento</div><div class="icard-val n">movy.as.me/pre-embarque</div></div><div class="icard"><div class="icard-lbl">Prazo</div><div class="icard-val r">4–8 sem. antes</div></div></div><div class="sh t">Antes da reunião</div><div class="cl"><div class="ci"><div class="cb"></div><div class="ct">Abrir PDF Manual de Sobrevivência para compartilhar tela</div></div><div class="ci"><div class="cb"></div><div class="ct">Abrir PPT Partes 1 e 2 (Pré-Embarque)</div></div><div class="ci"><div class="cb"></div><div class="ct">Ter o e-mail do aluno à mão para envio ao final</div></div><div class="ci"><div class="cb"></div><div class="ct">Confirmar que o aluno tem COE, Grant Letter e dados da acomodação</div></div></div><div class="sh t">Tópicos obrigatórios</div><ul class="bl"><li>Confirmação de dados: escola, data de embarque, acomodação, CommBank</li><li>Documentação — pasta digital e física (mala de mão)</li><li>Mala — franquias, itens proibidos, Dipirona proibida</li><li>Cartão de imigração — campo a campo com o PDF</li><li>Check-in online — como e quando</li><li>Primeiros passos em Perth — Welcome Session, OSHC, CommBank, TFN</li></ul><div class="sh t">Após a reunião — enviar ao aluno</div><div class="cl"><div class="ci"><div class="cb"></div><div class="ct">PDF — Manual de Sobrevivência do Estudante</div></div><div class="ci"><div class="cb"></div><div class="ct">PPT — Pré-Embarque (Partes 1 e 2)</div></div><div class="ci"><div class="cb"></div><div class="ct">Checklist Pré-Embarque (HTML interativo)</div></div><div class="ci"><div class="cb"></div><div class="ct">Link Welcome Session — movy.as.me/WELCOME</div></div></div></div>$movy$,
  $movy$Online · 30–45 min · movy.as.me/pre-embarque · 4–8 sem. antes$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$student-support$movy$]::text[],
  $movy$process$movy$,
  $movy$Student Support$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$student-support$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-student-support-preparacao-final$movy$,
  $movy$Preparação Final$movy$,
  $movy$Preparação Final$movy$,
  $movy$Preparação Final$movy$,
  $movy$<div class="legacy-sop"><div class="cl"><div class="ci"><div class="cb"></div><div class="ct">Passagem comprada — confirmar data e horário</div></div><div class="ci"><div class="cb"></div><div class="ct">Check-in online feito <span class="cn">→ 24–48h antes do voo</span></div></div><div class="ci"><div class="cb"></div><div class="ct">Seguro viagem contratado — apólice salva e impressa</div></div><div class="ci"><div class="cb"></div><div class="ct">CommBank: pré-abertura online feita <span class="cn">→ Nome igual ao passaporte</span></div></div><div class="ci"><div class="cb"></div><div class="ct">Acomodação: endereço e check-in confirmados <span class="cn">→ Necessário para o cartão de imigração</span></div></div><div class="ci"><div class="cb"></div><div class="ct">Escola: onboarding confirmado — data, horário, documentos</div></div><div class="ci"><div class="cb"></div><div class="ct">Comunicações da escola lidas e entendidas <span class="cn">→ Oferecer tradução via studentsupport@movyeducation.com</span></div></div><div class="ci"><div class="cb"></div><div class="ct">Dipirona: aluno confirmou que não vai levar?</div></div></div></div>$movy$,
  $movy$1–2 semanas antes do embarque$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$student-support$movy$]::text[],
  $movy$process$movy$,
  $movy$Student Support$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$student-support$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-student-support-embarque-e-chegada-em-perth$movy$,
  $movy$Embarque e Chegada em Perth$movy$,
  $movy$Embarque e Chegada em Perth$movy$,
  $movy$Embarque e Chegada em Perth$movy$,
  $movy$<div class="legacy-sop"><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Enviar mensagem de boa viagem no dia do embarque</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Reforçar: caneta para o cartão, declarar alimentos, Dipirona proibida, endereço à mão</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Ficar disponível para dúvidas de última hora</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Aguardar confirmação de chegada a Perth</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Confirmar check-in na acomodação e lembrar de agendar Welcome Session</div><div class="step-note">→ movy.as.me/WELCOME</div></div></div></div><div class="box alert"><strong>🚨 PROBLEMA NA ALFÂNDEGA</strong>Orientar o aluno a ser transparente e declarar tudo. Em casos de retenção, acionar o gestor imediatamente.</div></div>$movy$,
  $movy$Dia do voo + primeiras 48h$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$student-support$movy$]::text[],
  $movy$process$movy$,
  $movy$Student Support$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$student-support$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-student-support-welcome-session-primeiros-passos$movy$,
  $movy$Welcome Session + Primeiros Passos$movy$,
  $movy$Welcome Session + Primeiros Passos$movy$,
  $movy$Welcome Session + Primeiros Passos$movy$,
  $movy$<div class="legacy-sop"><div class="icards"><div class="icard"><div class="icard-lbl">Formato</div><div class="icard-val o">Presencial/híbrido</div></div><div class="icard"><div class="icard-lbl">Local</div><div class="icard-val t">324 Murray St</div></div><div class="icard"><div class="icard-lbl">Agendamento</div><div class="icard-val n">movy.as.me/WELCOME</div></div><div class="icard"><div class="icard-lbl">Prazo</div><div class="icard-val r">5–7 dias após chegada</div></div></div><div class="sh2">Prioridade 1 — Primeiras 48h</div><ul class="bl"><li>Ativar o OSHC online no site da seguradora</li><li>Ir à agência CommBank com passaporte + visto + COE</li></ul><div class="sh2">Prioridade 2 — Primeira semana</div><ul class="bl"><li>Solicitar TFN no ATO (ato.gov.au) — leva até 28 dias</li><li>Criar conta no USI (usi.gov.au) — obrigatório para VET e RSA</li><li>Confirmar onboarding da escola</li><li>Comprar chip pré-pago (Telstra / Optus / Vodafone)</li></ul><div class="sh2">Prioridade 3 — Primeiras semanas</div><ul class="bl"><li>Photo Card no DoT WA (ter TFN primeiro)</li><li>RSA se pretende trabalhar em bares/hotéis — AUD $65–100</li><li>RSG se pretende trabalhar em cassinos ou pubs com pokies</li><li>SmartRider Transperth — AUD $10 + $10 crédito, tarifa Go Anywhere $2,80</li></ul><div class="box warn"><strong>⚖️ DIREITOS TRABALHISTAS</strong>Visto estudante: máx. 48h/quinzena período letivo, ilimitado férias. Salário mínimo: AUD $24,95/h (jul 2025). Super: 12%. Pode denunciar ao Fair Work sem risco ao visto.</div></div>$movy$,
  $movy$Primeira semana em Perth · movy.as.me/WELCOME$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$student-support$movy$]::text[],
  $movy$process$movy$,
  $movy$Student Support$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$student-support$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-student-support-processo-ongoing$movy$,
  $movy$Processo Ongoing$movy$,
  $movy$Processo Ongoing$movy$,
  $movy$Processo Ongoing$movy$,
  $movy$<div class="legacy-sop"><div class="twocol"><div class="tc re"><div class="tc-ttl">⚡ REACTIVE</div><div class="tc-sub">Problemas que o aluno traz · Resposta em até 24h</div><div class="tc-item"><div class="tc-item-t">Trabalho</div><div class="tc-item-n">Horas, contrato, salário, RSA/RSG</div></div><div class="tc-item"><div class="tc-item-t">Escola</div><div class="tc-item-n">Comunicações, notas, mudança de curso</div></div><div class="tc-item"><div class="tc-item-t">Documentação</div><div class="tc-item-n">TFN, USI, Photo Card, CNH australiana</div></div><div class="tc-item"><div class="tc-item-t">Banco</div><div class="tc-item-n">CommBank, cartão, Superannuation</div></div><div class="tc-item"><div class="tc-item-t">Moradia</div><div class="tc-item-n">Problemas, nova acomodação</div></div><div class="tc-item"><div class="tc-item-t">Visto</div><div class="tc-item-n">Condições, vencimento, renovação</div></div><div class="tc-item"><div class="tc-item-t">Saúde</div><div class="tc-item-n">OSHC, médicos, suporte emocional</div></div></div><div class="tc pr"><div class="tc-ttl">🔄 PROACTIVE</div><div class="tc-sub">Check-ins periódicos · A Movy toma a iniciativa</div><div class="tc-item"><div class="tc-item-t">D+7 — Pós Welcome Session</div><div class="tc-item-n">Conta, TFN, escola ok?</div></div><div class="tc-item"><div class="tc-item-t">D+30 — 1 mês</div><div class="tc-item-n">Trabalho? Escola ok? Dificuldades?</div></div><div class="tc-item"><div class="tc-item-t">D+90 — 3 meses</div><div class="tc-item-n">Revisão geral — moradia, escola, finanças, visto</div></div><div class="tc-item"><div class="tc-item-t">D+180 — 6 meses</div><div class="tc-item-n">Check-in de meio — planos futuros?</div></div><div class="tc-item"><div class="tc-item-t">60 dias antes do vencimento</div><div class="tc-item-n">Alertar sobre renovação — acionar time de vistos</div></div><div class="tc-item"><div class="tc-item-t">Fim de curso</div><div class="tc-item-n">Plano de retorno? DASP? Continuação?</div></div></div></div><div class="box warn"><strong>📊 REGISTRO OBRIGATÓRIO</strong>Toda interação reativa ou proativa deve ser registrada no Monday: data, tipo, assunto e encaminhamento.</div></div>$movy$,
  $movy$Suporte contínuo durante toda a estadia em Perth$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$student-support$movy$]::text[],
  $movy$process$movy$,
  $movy$Student Support$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$student-support$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-student-support-perguntas-frequentes$movy$,
  $movy$Perguntas Frequentes$movy$,
  $movy$Perguntas Frequentes$movy$,
  $movy$Perguntas Frequentes$movy$,
  $movy$<div class="legacy-sop"><p class="body-t">Respostas prontas para usar com alunos. Sempre avaliar o caso individualmente antes de adaptar a resposta.</p><div class="sh t">📚 Sobre Escola / Curso</div><details><summary>Meu curso terminou. Posso continuar estudando? <span>▾</span></summary><div>Após o término do curso, o estudante não pode continuar estudando automaticamente, mesmo que o visto ainda esteja válido. Para continuar legalmente, é necessário estar matriculado em um novo curso registrado (CRICOS) e possuir um COE válido. Se o visto ainda estiver válido, é possível iniciar um novo curso sem nova aplicação de visto — desde que a duração não ultrapasse a validade do visto atual. Se o novo curso for mais longo ou houver mudança significativa de nível, pode ser necessária uma nova aplicação. <strong>Análise individual obrigatória antes de qualquer matrícula.</strong></div></details><details><summary>Posso mudar de curso ou de escola? <span>▾</span></summary><div>Sim, mas com uma regra importante: o estudante precisa completar <strong>pelo menos 6 meses do curso principal</strong> antes de poder mudar de instituição. Antes desse período, só é possível mudar de curso dentro da mesma instituição. Essa regra vem do ESOS Framework, se aplica ao curso principal do COE — incluindo inglês (ELICOS) se for o curso principal. Mudança antes dos 6 meses = alto risco migratório, salvo exceções bem documentadas. <strong>Análise individual obrigatória antes de qualquer decisão.</strong></div></details><details><summary>A escola pode mudar a data do COE? <span>▾</span></summary><div>Apenas em situações específicas e sempre depende da política acadêmica da instituição. Antes do início: algumas escolas permitem ajuste de data (postponement/deferral) com motivo válido e aprovação formal. Após o início: a escola normalmente não altera a data de início, podendo apenas manter o COE ativo ou cancelar e emitir um novo (com justificativa aceita, ex: motivo médico). Qualquer mudança no COE deve estar registrada no PRISMS, respeitar carga horária mínima e manter coerência com o visto vigente. <strong>Confirmar oficialmente pela escola antes de qualquer ação.</strong></div></details><details><summary>Tenho pendência financeira com a escola. Isso afeta meu visto? <span>▾</span></summary><div>Pendências financeiras não afetam o visto imediatamente, mas podem gerar consequências indiretas importantes. A instituição pode: suspender a matrícula, recusar a emissão de novos documentos (como COE), ou — em casos mais graves — cancelar o COE no PRISMS. Caso o COE seja cancelado, isso impacta diretamente o visto, pois o estudante deixa de cumprir a condição de estar matriculado em curso válido. <strong>Resolver a pendência o quanto antes ou alinhar formalmente novo prazo com a escola.</strong></div></details><div class="sh t">📋 Visto — Processo e Renovação</div><details><summary>Meu visto vence antes do curso acabar! O que faço? <span>▾</span></summary><div>É necessário planejar uma renovação de visto antes do vencimento, garantindo cobertura total do período de estudos, continuidade legal da matrícula e cumprimento das condições migratórias. Cada situação precisa ser analisada individualmente considerando histórico migratório, curso atual e documentos disponíveis. <strong>Não existe data única obrigatória — recomendado iniciar planejamento com alguns meses de antecedência.</strong></div></details><details><summary>Posso aplicar o visto estando ONSHORE? <span>▾</span></summary><div>Sim, desde que o estudante esteja com um visto válido no momento da aplicação, cumpra as condições do visto atual e atenda aos critérios do novo visto solicitado. Após a aplicação, o estudante normalmente recebe um <strong>Bridging Visa</strong>, que permite permanecer legalmente no país enquanto a imigração analisa o processo. <strong>Cada caso deve ser avaliado individualmente.</strong></div></details><details><summary>Posso incluir dependente depois de ter aplicado? <span>▾</span></summary><div>Em alguns casos sim, como subsequent entrant. Depende do status do visto principal, tipo de curso, comprovação de vínculo e capacidade financeira atualizada. Além disso, o dependente só pode ser incluído após a aprovação do visto principal. <strong>Análise completa do cenário antes de qualquer aplicação.</strong></div></details><details><summary>A imigração pediu formulário 80 / exames / police check <span>▾</span></summary><div>Esses pedidos fazem parte do processo normal de análise migratória e indicam que o visto está em avaliação ativa. São solicitados quando a imigração precisa confirmar histórico pessoal, validar informações declaradas ou concluir checagens de segurança e saúde. <strong>É fundamental responder exatamente conforme solicitado, dentro do prazo indicado. A Movy orienta passo a passo.</strong></div></details><details><summary>Para aplicar para Partner Visa, é necessário 1 ano ou 11 meses já são válidos? <span>▾</span></summary><div>De forma geral, a imigração exige <strong>12 meses completos</strong> de relacionamento comprovado para aplicações de Partner Visa baseadas em união de facto. 11 meses não atendem ao requisito mínimo, salvo situações específicas (ex: relacionamento formalmente registrado em um estado/território australiano). Em casos de casamento, não há exigência formal de tempo mínimo, mas a imigração avalia a consistência e genuinidade do relacionamento. <strong>Cada caso deve ser analisado individualmente.</strong></div></details><div class="sh t">📄 Documentação</div><details><summary>Quais documentos preciso enviar? <span>▾</span></summary><div>A documentação exigida varia conforme o tipo de processo, curso e histórico do estudante. Por isso, não trabalhamos com listas genéricas. Assim que o processo for iniciado oficialmente, enviamos uma <strong>checklist personalizada</strong>, alinhada às exigências da imigração e da instituição de ensino.</div></details><details><summary>Meu documento/foto foi recusado <span>▾</span></summary><div>Recusas desse tipo geralmente ocorrem por critérios técnicos: qualidade da imagem, fundo inadequado, enquadramento incorreto ou documento incompleto. Não significa um problema no processo em si. <strong>A Movy orienta exatamente como reenviar o documento corretamente.</strong></div></details><div class="sh t">💳 Pagamentos e Reembolsos</div><details><summary>Recebi uma cobrança atrasada da escola sem aviso prévio <span>▾</span></summary><div>Nesses casos, é importante revisar o histórico de comunicação, as datas de vencimento previstas em contrato e quando a notificação foi enviada. Se necessário, podemos entrar em contato com a instituição para solicitar esclarecimentos ou ajuste de prazo, conforme a política da escola.</div></details><details><summary>Como funciona o reembolso? <span>▾</span></summary><div>O reembolso depende do tipo de serviço contratado (curso, OSHC ou taxas administrativas) e se o valor já foi repassado à instituição ou seguradora. Para solicitar, o aluno preenche o formulário de reembolso Movy. Após confirmação, os prazos seguem as regras contratuais da Movy — podendo levar até <strong>90 dias</strong> para conclusão. Durante esse período, mantemos o aluno informado sobre cada etapa. <strong>Se OFFSHORE, a transação é realizada via transferência da conta WISE.</strong></div></details><div class="box tip"><strong>💡 COMO USAR ESTE FAQ</strong>Estas respostas são baseadas nos guidelines oficiais Movy. Adapte o tom conforme o contexto do aluno, mas sempre mantenha a substância da informação. Para situações complexas ou casos fora do padrão, acionar Julia (Vistos) ou Marcos (Carreira).</div></div>$movy$,
  $movy$Respostas padronizadas para as principais dúvidas dos alunos$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$student-support$movy$]::text[],
  $movy$faq$movy$,
  $movy$Student Support$movy$,
  'internal',
  5,
  '2.1',
  false
from public.departments d
where d.slug = $movy$student-support$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-withdrawal-refund$movy$,
  $movy$Withdrawal & Refund$movy$,
  $movy$Withdrawal & Refund$movy$,
  $movy$Withdrawal & Refund$movy$,
  $movy$<div class="legacy-sop"><div class="sh2">Cenário 1 — Excesso de pagamento (Difference in Excess)</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Finance: identifica o excesso e envia e-mail ao aluno com formulário de reembolso (CC consultor)</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Finance: atualizar Monday → "In Progress"</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Finance: verificar formulário, processar pagamento ao aluno e enviar confirmação (CC consultor)</div><div class="step-note">→ Salvar comprovante e formulário na pasta</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Finance: atualizar Monday → "Paid" ou "Done"</div></div></div></div><div class="sh2">Cenário 2 — Reembolso de OSHC ou outras consultas</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Consultor: recebe solicitação do aluno e envia formulário de reembolso (CC Finance)</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Finance: atualizar Monday → "In Progress"</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Finance: verificar formulário, processar pagamento e enviar confirmação (CC consultor)</div><div class="step-note">→ Salvar comprovante e formulário na pasta</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Finance: atualizar Monday → "Paid" ou "Done"</div></div></div></div><div class="sh2">Cenário 3 — Diferença em falta (Difference in Deficit)</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Finance: e-mail ao consultor informando a diferença encontrada</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Consultor: e-mail ao aluno informando a diferença e solicitando pagamento (CC Finance)</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Finance: após receber pagamento, executa a ação necessária (ex: compra OSHC, taxas pendentes)</div></div></div></div><div class="box warn"><strong>⚠️ CANCELAMENTO DE OSHC</strong>Taxa de AUD $150 de cancelamento (T&C Movy) + eventuais taxas adicionais do provedor. Processado pelo Finance após solicitação formal.</div><div class="sh t">Quando o processo de refund é acionado</div><ul class="bl"><li>Cliente desistiu de vir antes de embarcar</li><li>Quer sair da escola atual (mudança ou cancelamento)</li><li>Visto negado — solicita reembolso</li><li>Retornou ao Brasil por problemas com o visto</li><li>Cancelamento do OSHC — saiu antes do fim do seguro</li></ul><div class="sh t">Formulário — campos</div><table class="tbl"><thead><tr><th>Campo</th><th>Tipo</th><th>Observação</th></tr></thead><tbody><tr><td><strong>Nome completo</strong></td><td>Texto livre</td><td class="mut">Igual ao passaporte</td></tr><tr><td><strong>Data de nascimento</strong></td><td>DD/MM/AAAA</td><td class="mut">Verificação de identidade</td></tr><tr><td><strong>Número do passaporte</strong></td><td>Texto</td><td class="mut">Identificação na imigração</td></tr><tr><td><strong>O que deseja cancelar</strong></td><td>Fees / Course / OSHC / Withdrawal</td><td class="mut">Múltiplas opções</td></tr><tr><td><strong>Motivo do cancelamento</strong></td><td>Texto livre</td><td class="mut">Ex: retorno ao Brasil</td></tr><tr><td><strong>Dados bancários</strong></td><td>Nome, banco, BSB, nº conta</td><td class="mut">CommBank preferida</td></tr><tr><td><strong>Assinatura digital</strong></td><td>Obrigatória</td><td class="mut">Valida o pedido formalmente</td></tr></tbody></table><div class="sh t">Passo a passo</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Receber o formulário preenchido e assinado</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Verificar o que está sendo cancelado</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Comunicar a escola — reembolso conforme política da instituição</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Comunicar a seguradora do OSHC — reembolso proporcional</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Aplicar a taxa da Movy: AUD $500</div><div class="step-note">→ Cláusulas 1.4 e 1.5 do T&C — independente do reembolso da escola</div></div></div><div class="step"><div class="step-n">6.</div><div><div class="step-t">Processar reembolso — prazo de até 90 dias</div></div></div><div class="step"><div class="step-n">7.</div><div><div class="step-t">Atualizar status no Monday — registrar como cancelado</div></div></div></div><div class="box warn"><strong>⏳ PRAZO</strong>Até 90 dias. Comunicar ao cliente no momento do pedido para alinhar expectativas.</div></div>$movy$,
  $movy$Cancelamento de serviços ou reembolso$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  true
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-cancelamento$movy$,
  $movy$Cancelamento$movy$,
  $movy$Cancelamento$movy$,
  $movy$Cancelamento$movy$,
  $movy$<div class="legacy-sop"><div class="box info"><strong>ℹ️ RESPONSABILIDADES</strong>Consultor atualiza o Monday e solicita ao Finance. Finance conduz toda a comunicação com escola e aluno — consultor não comunica cancelamento diretamente.</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Consultor: atualizar Monday → "Active Leads", service = "cancel", status = "cancel"</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Consultor: e-mail ao Finance solicitando o cancelamento com a escola</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Finance: e-mail à escola solicitando cancelamento (CC consultor)</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Finance: e-mail ao aluno com eventuais cobranças e resultado — salvar COE cancelado na pasta</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Finance: atualizar Monday → mês de cancelamento no board do consultor</div></div></div></div><div class="box warn"><strong>⚠️ TAXA AUD $500</strong>A Movy cobra AUD $500 mesmo que a escola dê 100% de reembolso. Comunicar ao aluno antes de iniciar o processo.</div></div>$movy$,
  $movy$Passo a passo quando o aluno solicita cancelamento$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-change-of-course$movy$,
  $movy$Change of Course$movy$,
  $movy$Change of Course$movy$,
  $movy$Change of Course$movy$,
  $movy$<div class="legacy-sop"><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Consultor: atualizar Monday → "Active Leads", service = "cancel", status = "cancel". Duplicar o lead: service = "Change of Course", status = "In Process".</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Consultor: solicitar a mudança à escola</div></div></div></div><div class="oncols"><div class="oncol t"><div class="oncol-ttl">Mesma escola</div><div class="oncol-sub">Mudança dentro da mesma instituição</div><p>Nova aplicação → Next Step ao aluno para assinar nova Offer Letter e efetuar pagamento necessário.</p></div><div class="oncol o"><div class="oncol-ttl">Escola diferente</div><div class="oncol-sub">Mudança para outra instituição</div><p>Concluir nova aplicação → encaminhar solicitação de cancelamento ao Finance para escola anterior.</p></div></div><div class="steps"><div class="step"><div class="step-n">3.</div><div><div class="step-t">Consultor: após Offer Letter assinada + pagamento → e-mail ao Finance para COE → status "Paid"</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Finance: solicitar COE à escola e salvar na pasta do aluno</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Finance: atualizar Monday → mês do pagamento ou mês efetivo da mudança</div></div></div></div></div>$movy$,
  $movy$Processo quando o aluno quer trocar de curso$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-attendance-progress-non-payment$movy$,
  $movy$Attendance, Progress & Non-Payment$movy$,
  $movy$Attendance, Progress & Non-Payment$movy$,
  $movy$Attendance, Progress & Non-Payment$movy$,
  $movy$<div class="legacy-sop"><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Contatar o aluno em até 24h após receber a reclamação da escola</div><div class="step-note">→ E-mail primeiro. Se não responder: ligar por telefone.</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Investigar e coletar informações (Consultor)</div><div class="step-note">→ Non-payment: comprovante ou explicação · Faltas: razões válidas (atestado médico, motivos pessoais) · Progresso: dificuldades com conteúdo</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Desenvolver estratégia de resolução (Consultor)</div><div class="step-note">→ Non-payment: plano de pagamento com Finance da escola · Faltas: melhora imediata + reunião com coordinator · Progresso: plano de melhoria com coordinator</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Contatar a escola com atualização em até 48h após a resolução</div></div></div></div><div class="box alert"><strong>🚨 PRAZOS CRÍTICOS</strong>24h para contatar o aluno · 48h para atualizar a escola. Agir rapidamente para prevenir cancelamento do COE ou relatório negativo de imigração.</div></div>$movy$,
  $movy$Quando a escola reporta problemas com o aluno$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-jornada-onshore-renovacao-de-visto$movy$,
  $movy$Jornada Onshore — Renovação de Visto$movy$,
  $movy$Jornada Onshore — Renovação de Visto$movy$,
  $movy$Jornada Onshore — Renovação de Visto$movy$,
  $movy$<div class="legacy-sop"><div class="oncols"><div class="oncol o"><div class="oncol-ttl">CLIENTE ANTIGO</div><div class="oncol-sub">Já conhece o Student Support</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Time de vistos notifica o Student Support</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Student Support retoma contato — reforçar disponibilidade</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Verificar pendências: trabalho, escola, documentação</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Acompanhar durante o período de espera da renovação</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Registrar atualização no CRM / Monday</div></div></div></div></div><div class="oncol t"><div class="oncol-ttl">CLIENTE NOVO</div><div class="oncol-sub">Primeiro contato com o Student Support</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Time de vistos apresenta formalmente o Student Support</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Apresentação pessoal — nome, função, como acionar</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Explicar o que é o Student Support</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Oferecer conversa de boas-vindas</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Registrar no CRM como cliente onshore</div></div></div></div></div></div><div class="box warn"><strong>ℹ️ IMPORTANTE</strong>Student Support e time de vistos atuam em paralelo. Vistos: processo burocrático. Student Support: acompanhamento e bem-estar.</div></div>$movy$,
  $movy$Para alunos já em Perth$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-monday-automacao-labels$movy$,
  $movy$Monday — Automação + Labels$movy$,
  $movy$Monday — Automação + Labels$movy$,
  $movy$Monday — Automação + Labels$movy$,
  $movy$<div class="legacy-sop"><div class="sh t">Fluxo entre boards</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Lead entra no Monday — board de vendas/leads</div><div class="step-note">→ Inserido manualmente — integração Calendly desativada</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Status atualizado para PAGO</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Automação: aluno vai para o board de VISTO</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Visto aprovado → status APROVADO → aluno vai para board STUDENT SUPPORT</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Preencher campos adicionais: data de embarque, passagem, escola, data de início</div></div></div></div><div class="box info"><strong>📋 COLUNAS RECOMENDADAS — Student Support</strong>Nome · E-mail · WhatsApp · Escola · Data de início · Data de embarque · Nº passagem · Status · Último contato · Próximo check-in · Responsável · Observações</div><div class="box alert"><strong>🔴 PRIORIDADE — RECONECTAR CALENDLY</strong>Integração desativada há 6 meses. Todo lead é inserido manualmente. Reconectar é prioridade máxima.</div></div>$movy$,
  $movy$Fluxo entre boards e guia de categorização$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-board-de-welcome-student-support$movy$,
  $movy$Board de Welcome — Student Support$movy$,
  $movy$Board de Welcome — Student Support$movy$,
  $movy$Board de Welcome — Student Support$movy$,
  $movy$<div class="legacy-sop"><p class="body-t">Assim que o consultor atualiza o status para <strong>"Paid"</strong> no board de vendas, o e-mail studentsupport@movyeducation.com é notificado automaticamente. O Student Support então cria o card do aluno no Board de Welcome, espelhando informações dos boards de DATABASE e de VISTOS.</p><div class="box info"><strong>⚡ GATILHO</strong>Consultor marca "Paid" no board de vendas → e-mail automático para studentsupport@movyeducation.com → Student Support adiciona o aluno no Board de Welcome e preenche todas as colunas abaixo.</div><div class="sh t">Colunas do Board de Welcome — o que preencher</div><table class="tbl"><thead><tr><th>Coluna</th><th>O que registrar</th><th>Quando atualizar</th></tr></thead><tbody><tr><td>Controle de...</td><td>Nome e identificação do consultor responsável</td><td class="mut">Ao criar o card</td></tr><tr><td>Movy Visa A.</td><td>Agente de visto responsável</td><td class="mut">Ao criar o card</td></tr><tr><td>E-mail</td><td>E-mail do aluno</td><td class="mut">Ao criar o card</td></tr><tr><td><strong>ON/OFF</strong></td><td>Perfil do aluno: OFFSHORE ou ONSHORE</td><td class="mut">Ao criar o card</td></tr><tr><td><strong>Visa Status</strong></td><td>Approved / Applied / In Progress</td><td class="mut">Conforme avanço do processo</td></tr><tr><td>RENOVAÇÃO?</td><td>Sim ou Não — se é renovação de visto</td><td class="mut">Ao criar o card</td></tr><tr><td><strong>Intake</strong></td><td>Data de início das aulas na escola</td><td class="mut">Ao criar — confirmar com Offer Letter</td></tr><tr><td><strong>INSTITUIÇÃO</strong></td><td>Nome da escola onde o aluno está matriculado</td><td class="mut">Ao criar o card</td></tr><tr><td>Cidade na Austrália</td><td>Perth ou outra cidade</td><td class="mut">Ao criar o card</td></tr><tr><td><strong>VIDEO CHAMADA</strong></td><td>Data agendada da reunião de pré-embarque</td><td class="mut">Assim que o aluno agendar</td></tr><tr><td><strong>EMAIL PRÉ-EMBARQUE</strong></td><td>✔ se o e-mail de pré-embarque foi enviado</td><td class="mut">Após envio do e-mail</td></tr><tr><td><strong>PASSAGEM</strong></td><td>Data do voo do aluno</td><td class="mut">Assim que o aluno confirmar</td></tr><tr><td>Status Acomodação</td><td>Fechado / Em cotação / Não tem interesse</td><td class="mut">Durante acompanhamento</td></tr><tr><td>CONTRATO AC.</td><td>Status do contrato de acomodação</td><td class="mut">Quando aplicável</td></tr><tr><td>Status Transfer</td><td>Se o aluno precisa de transfer do aeroporto</td><td class="mut">Verificar durante pré-embarque</td></tr><tr><td>Status Seguro Vi.</td><td>Status do seguro de viagem (≠ OSHC)</td><td class="mut">Verificar durante pré-embarque</td></tr><tr><td><strong>CHEGADA NA AUS</strong></td><td>Data de chegada do aluno em Perth</td><td class="mut">Assim que o aluno confirmar chegada</td></tr><tr><td><strong>Link Agend. Welcome Enviado?</strong></td><td>✔ se o link da Welcome Session foi enviado</td><td class="mut">Após envio do link</td></tr><tr><td><strong>WELCOME NA AGENCIA</strong></td><td>Data em que o aluno fez a Welcome Session</td><td class="mut">Após realização da Welcome Session</td></tr><tr><td>SOLICITAÇÃO TFN</td><td>Status da solicitação do TFN</td><td class="mut">Verificar na Welcome Session e follow-up</td></tr></tbody></table><div class="sh t">Screenshot do Board de Welcome</div><div><img src="/api/imported/beatriz-sop-image-2.png" alt="Board de Welcome — Monday Student Support"></div><div class="box info"><strong>📊 GRUPOS DO BOARD</strong>O board é organizado por ano e status: NEW STUDENTS (novos em processo) · 2026 FUPS (alunos com intake 2026 acompanhados) · 2025 · 2024 · CANCELAMENTO · DUPLICIDADE.</div></div>$movy$,
  $movy$Acompanhamento de clientes após pagamento · studentsupport@movyeducation.com$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-monday-automacao-e-labels$movy$,
  $movy$Monday — Automação e Labels$movy$,
  $movy$Monday — Automação e Labels$movy$,
  $movy$Monday — Automação e Labels$movy$,
  $movy$<div class="legacy-sop"><div class="sh t">Labels — TYPE OF VISA</div><table class="tbl"><thead><tr><th>Label</th><th>Quando usar</th></tr></thead><tbody><tr><td><strong>Single</strong></td><td>Visto individual — apenas o titular</td></tr><tr><td><strong>Couple</strong></td><td>Casal — cônjuge será dependente</td></tr><tr><td><strong>Family</strong></td><td>Família completa</td></tr><tr><td><strong>Work Holiday</strong></td><td>Consultando opção de WHV</td></tr><tr><td><strong>Single Parent</strong></td><td>Pai ou mãe vindo com filhos</td></tr><tr><td><strong>Dependent</strong></td><td>Dependente em processo de casal/família</td></tr><tr><td><strong>Under 18</strong></td><td>Menor de 18 sem dependência de titular</td></tr><tr><td><strong>Tourist</strong></td><td>Visto de turismo</td></tr><tr><td><strong>485</strong></td><td>Visto pós-estudo (Post-Study Work)</td></tr><tr><td><strong>Extension Single/Couple/Family/Single Parent</strong></td><td>Renovação conforme perfil — COE ativo</td></tr></tbody></table><div class="sh t">Labels — SERVICE</div><table class="tbl"><thead><tr><th>Label</th><th>Quando usar</th></tr></thead><tbody><tr><td><strong>Quote</strong></td><td>Cotação enviada ao aluno</td></tr><tr><td><strong>Enrolment</strong></td><td>Matrícula em andamento</td></tr><tr><td><strong>Information</strong></td><td>Lead buscando informações sem compromisso</td></tr><tr><td><strong>Study and Visa 500</strong></td><td>Intercâmbio padrão com visto 500</td></tr><tr><td><strong>Application 500 / 600</strong></td><td>Apenas aplicação de visto estudante / turismo</td></tr><tr><td><strong>Dependent Application 500</strong></td><td>Dependente em processo de visto estudante</td></tr><tr><td><strong>Add New Course / Change Course</strong></td><td>Adição ou troca de curso no plano atual</td></tr><tr><td><strong>Enrol without Visa</strong></td><td>Matrícula com visto já em mãos</td></tr><tr><td><strong>Aupair / Demipair</strong></td><td>Programa específico</td></tr><tr><td><strong>BVB / WHV / 485 / Career / Accommodation / Insurance</strong></td><td>Serviços específicos</td></tr><tr><td><strong>Cancellation Course / Visa</strong></td><td>Cliente quer cancelar curso ou visto</td></tr><tr><td><strong>Welcome</strong></td><td>Aluno vindo para Austrália — será recebido</td></tr><tr><td><strong>Job</strong></td><td>Candidatura a vaga com auxílio da agência</td></tr></tbody></table><div class="sh t">Labels — STATUS</div><table class="tbl"><thead><tr><th>Status</th><th>Quando usar</th></tr></thead><tbody><tr><td><strong>Contacted</strong></td><td>Contato inicial realizado</td></tr><tr><td><strong>Stuck</strong></td><td>Processo travado por qualquer motivo</td></tr><tr><td><strong>1st / 2nd / 3rd follow-up</strong></td><td>Tentativas de contato após conversa inicial</td></tr><tr><td><strong>Analysing Quote</strong></td><td>Cotação enviada — lead está analisando</td></tr><tr><td><strong>In process</strong></td><td>Cotação aceita — matrícula iniciada</td></tr><tr><td><strong>Paid</strong></td><td>Pagamento das taxas concluído</td></tr><tr><td><strong>Immig / Career Consultation</strong></td><td>Reunião agendada com agente ou orientador</td></tr><tr><td><strong>Never answered</strong></td><td>Nenhuma resposta a nenhuma tentativa</td></tr><tr><td><strong>Cancel / Lost</strong></td><td>Desistiu ou foi para outra agência</td></tr><tr><td><strong>Sponsor / 485 / PR / WHV</strong></td><td>Em processo ou já com esses vistos/residências</td></tr></tbody></table><div class="sh t">Labels — REFERRAL SOURCE</div><table class="tbl"><thead><tr><th>Origem</th><th>Quando usar</th></tr></thead><tbody><tr><td><strong>Movy Data Base</strong></td><td>Lead na base Movy que nunca foi aluno</td></tr><tr><td><strong>Movy Student</strong></td><td>Aluno Movy — geralmente renovação</td></tr><tr><td><strong>Movy Media / Booking Online / WhatsApp</strong></td><td>Veio pelas redes, site ou WhatsApp da Movy</td></tr><tr><td><strong>CHANNEL Student / Media / Data Base / WhatsApp</strong></td><td>Equivalentes para o Channel</td></tr><tr><td><strong>Google / Website</strong></td><td>Busca orgânica ou site</td></tr><tr><td><strong>Influencer / Partner</strong></td><td>Veio por parceiro ou influenciador</td></tr><tr><td><strong>Recommendation</strong></td><td>Indicação de aluno ou amigo</td></tr><tr><td><strong>Events & Job</strong></td><td>Eventos ou vagas de emprego</td></tr><tr><td><strong>Venha para Perth / Come to Perth</strong></td><td>Landing Pages específicas</td></tr><tr><td><strong>Podcast Aqui na Australia</strong></td><td>Veio pelo link do Podcast</td></tr></tbody></table><div class="box warn"><strong>⚠️ REGRA DE OURO</strong>Preencher TYPE OF VISA + SERVICE + STATUS + REFERRAL SOURCE para todo lead. Sem esses campos, relatórios e filtros ficam incompletos.</div></div>$movy$,
  $movy$Fluxo entre boards e guia de categorização$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-oshc-planos-de-saude$movy$,
  $movy$OSHC — Planos de Saúde$movy$,
  $movy$OSHC — Planos de Saúde$movy$,
  $movy$OSHC — Planos de Saúde$movy$,
  $movy$<div class="legacy-sop"><p class="body-t">O OSHC (Overseas Student Health Cover) é obrigatório para todos os estudantes internacionais com Visto de Estudante (Subclass 500). Deve estar ativo durante toda a vigência do visto — incluindo férias e período extra ao final do curso.</p><div class="box alert"><strong>⚠️ ALUNOS JÁ EM PERTH — ATENÇÃO A GAPS</strong>O novo seguro deve começar no dia SEGUINTE ao término do atual. Um gap de mesmo um dia pode gerar perda de elegibilidade, períodos de carência e problemas na renovação do visto.</div><div class="sh t">Cálculo da duração do OSHC</div><table class="tbl"><thead><tr><th>Duração do curso</th><th>Férias adicionadas</th><th>Exemplo</th></tr></thead><tbody><tr><td>Menos de 40 semanas (&lt;10 meses)</td><td class="acc">+ 4 semanas (1 mês)</td><td class="mut">28 sem. → OSHC: 32 sem.</td></tr><tr><td>40 semanas ou mais (≥10 meses)</td><td class="acc">+ 8 semanas (2 meses)</td><td class="mut">52 sem. → OSHC: 60 sem.</td></tr><tr><td>≥40 semanas terminando Nov/Dez</td><td class="acc">Férias até 15/03 do ano seguinte</td><td class="mut">48 sem. terminando Dez → até 15/03</td></tr></tbody></table><div class="sh t">Provedores disponíveis</div><table class="tbl"><thead><tr><th>Provedor</th><th>Portal de ativação</th><th>App</th><th>Contato</th></tr></thead><tbody><tr><td><strong>Allianz Care</strong></td><td><a href="https://my.allianzcare.com/myhealth/2/register">my.allianzcare.com</a></td><td>Allianz MyHealth</td><td>13 OSHC · +61 7 3305 8841</td></tr><tr><td><strong>BUPA</strong></td><td><a href="https://my.bupa.com.au/login">my.bupa.com.au</a></td><td>myBupa</td><td>1800 888 942 · oshc@bupa.com.au</td></tr><tr><td><strong>AHM</strong></td><td><a href="https://www.ahmoshc.com.au/oshcactivate/">ahmoshc.com.au</a></td><td>ahm OSHC</td><td>Via portal ou app</td></tr><tr><td><strong>Medibank</strong></td><td><a href="https://www.medibankoshc.com.au/">medibankoshc.com.au</a></td><td>My Medibank</td><td>Via portal ou app</td></tr><tr><td><strong>NIB</strong></td><td><a href="https://www.nib.com.au/overseas-students/">nib.com.au</a></td><td>nib App</td><td>Via portal ou app</td></tr></tbody></table><div class="sh t">Ativação (todos os provedores)</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Acessar o portal do provedor conforme tabela acima</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Clicar em Ativar / Register / Activate your membership</div><div class="step-note">→ Inserir número da apólice, data de nascimento e dados pessoais</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Criar login e senha</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Atualizar endereço australiano e solicitar cartão físico</div></div></div></div><div class="sh t">Reembolso (Claim) por provedor</div><ul class="bl"><li><strong>Allianz:</strong> app "Allianz MyHealth" → "Make a claim" → anexar documentos</li><li><strong>BUPA:</strong> portal myBupa ou app → "Make a claim". Também presencialmente em loja BUPA.</li><li><strong>AHM:</strong> portal ou app "ahm OSHC" → "Make a claim" → enviar recibos</li><li><strong>Medibank:</strong> portal ou app "My Medibank" → "Submit a claim" → comprovantes</li><li><strong>NIB:</strong> portal ou app "nib App" → "Make a claim" → documentos e recibos</li></ul><div class="box alert"><strong>🚨 NÃO É COBERTO PELO OSHC</strong>Exames médicos para o visto (raio-X, clínicos credenciados pela imigração) NÃO são cobertos por nenhum provedor de OSHC.</div></div>$movy$,
  $movy$O que é, como calcular, provedores e como usar$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-commbank-como-abrir-uma-conta$movy$,
  $movy$CommBank — Como Abrir uma Conta$movy$,
  $movy$CommBank — Como Abrir uma Conta$movy$,
  $movy$CommBank — Como Abrir uma Conta$movy$,
  $movy$<div class="legacy-sop"><p class="body-t">A Student Account (Smart Access) é a conta bancária recomendada para estudantes internacionais. O processo começa online antes da chegada e é finalizado presencialmente na agência em Perth.</p><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Acessar <a href="https://www.commbank.com.au">commbank.com.au</a></div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Menu "Bank accounts" → "Student account (Smart Access)" → "Open now"</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Preencher dados pessoais</div><div class="step-note">→ Nome completo, e-mail, passaporte, data estimada de chegada, eVisa</div></div></div><div class="step"><div class="step-n">4.</div><div><div class="step-t">Aguardar e-mail com instruções</div></div></div><div class="step"><div class="step-n">5.</div><div><div class="step-t">Após chegada em Perth: comparecer à agência com os documentos</div><div class="step-note">→ Passaporte · eVisa · Carta de aceitação ou COE · Comprovante de endereço na Austrália</div></div></div><div class="step"><div class="step-n">6.</div><div><div class="step-t">Atendimento 20–30 min → receber cartão e ativar app CommBank com NetBank ID</div></div></div></div><div class="box info"><strong>🏦 DADOS BANCÁRIOS DA Movy</strong>Bank: Commonwealth Bank · Account Name: Movy Pty Ltd · BSB: 066000 · Account: 13211658 · Swift: CTBAAU2S · Descrição: NAME + Visa + OSHC</div></div>$movy$,
  $movy$Passo a passo para abertura da Student Account (Smart Access)$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-processos-ferramentas-usi-unique-student-identifier$movy$,
  $movy$USI — Unique Student Identifier$movy$,
  $movy$USI — Unique Student Identifier$movy$,
  $movy$USI — Unique Student Identifier$movy$,
  $movy$<div class="legacy-sop"><p class="body-t">O USI é obrigatório para todos os estudantes de cursos VET na Austrália. Necessário também para RSA, RSG, White Card e outros certificados nacionais reconhecidos.</p><div class="sh2">Criar um USI</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Acessar <a href="https://www.usi.gov.au">usi.gov.au</a> → "Create a USI"</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Confirmar que é estudante internacional</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">Ter passaporte e visto em mãos → preencher os dados → anotar o USI gerado</div></div></div></div><div class="sh2">Recuperar USI existente</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Acessar <a href="https://www.usi.gov.au">usi.gov.au</a> → "Find your USI"</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Preencher nome completo, data de nascimento e e-mail ou celular usado na criação</div></div></div><div class="step"><div class="step-n">3.</div><div><div class="step-t">O sistema recuperará o USI se ele existir</div></div></div></div><div class="box info"><strong>ℹ️ QUANDO É OBRIGATÓRIO</strong>Cursos VET (Diplomas, Certificados III/IV) · RSA · RSG · White Card · Qualquer curso que emita certificado nacional reconhecido.</div></div>$movy$,
  $movy$Como criar, recuperar e verificar$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$processos-ferramentas$movy$]::text[],
  $movy$process$movy$,
  $movy$Processos & Ferramentas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$processos-ferramentas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-politicas-internas-dress-code-politica-de-vestimenta$movy$,
  $movy$Dress Code — Política de Vestimenta$movy$,
  $movy$Dress Code — Política de Vestimenta$movy$,
  $movy$Dress Code — Política de Vestimenta$movy$,
  $movy$<div class="legacy-sop"><ul class="bl"><li>Apresentação profissional com vestimenta adequada à função e excelente higiene pessoal</li><li>Calçados fechados são obrigatórios</li><li>Roupas devem estar limpas, em boas condições e passadas</li></ul><div class="sh2">Não é permitido:</div><ul class="bl"><li>Roupas com rasgos, buracos ou reparos visíveis</li><li>Roupas esportivas (agasalho, academia, ativewear)</li><li>Tops que expõem o abdômen</li><li>Havaianas, ugg boots ou chinelos</li><li>Tatuagens visíveis e piercings corporais (exceto brincos)</li><li>Roupas com estampas ofensivas ou inapropriadas</li></ul><p class="body-t">Crenças religiosas e culturais serão consideradas. A empresa pode alterar o dress code em ocasiões especiais.</p><div class="box warn"><strong>⚠️ DESCUMPRIMENTO</strong>O gestor pode solicitar que o funcionário vá para casa trocar de roupa. Reincidência pode resultar em demissão.</div></div>$movy$,
  $movy$Versão: Fevereiro 2026$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$politicas-internas$movy$]::text[],
  $movy$policy$movy$,
  $movy$Politicas Internas$movy$,
  'internal',
  2,
  '2.1',
  true
from public.departments d
where d.slug = $movy$politicas-internas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-politicas-internas-leave-policy-licencas-e-ferias$movy$,
  $movy$Leave Policy — Licenças e Férias$movy$,
  $movy$Leave Policy — Licenças e Férias$movy$,
  $movy$Leave Policy — Licenças e Férias$movy$,
  $movy$<div class="legacy-sop"><div class="sh2">Annual Leave (Férias anuais)</div><ul class="bl"><li>Acumuladas conforme NES — não aplicável a casual employees</li><li>Remuneradas pela taxa base; acumulam e são pagas na rescisão</li><li>Solicitar aprovação prévia antes de qualquer reserva de viagem</li><li>A empresa pode restringir férias em períodos de alta demanda</li></ul><div class="sh2">Personal Leave (Licença pessoal / saúde)</div><ul class="bl"><li>10 dias pagos por ano para full-time — pro-rata para part-time</li><li>Uso: doença pessoal ou cuidado de familiar (cônjuge, filhos, pais, avós, irmãos)</li><li>Notificar o gestor preferencialmente 1 hora antes do início</li><li>Atestado médico exigido para: ausências em segunda/sexta, próximas a feriados, consecutivas ou repetidas</li></ul><div class="sh2">Outros tipos de licença</div><table class="tbl"><thead><tr><th>Tipo</th><th>Direito</th></tr></thead><tbody><tr><td><strong>Unpaid Carer's Leave</strong></td><td>Até 2 dias sem pagamento por ocorrência</td></tr><tr><td><strong>Compassionate Leave</strong></td><td>2 dias pagos — doença grave ou morte de familiar próximo</td></tr><tr><td><strong>Family & Domestic Violence Leave</strong></td><td>Conforme NES — para lidar com impactos de violência doméstica</td></tr><tr><td><strong>Long Service Leave</strong></td><td>Conforme legislação estadual</td></tr><tr><td><strong>Community Service Leave</strong></td><td>SES, bombeiros voluntários — geralmente sem remuneração</td></tr></tbody></table></div>$movy$,
  $movy$Versão: Fevereiro 2026$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$politicas-internas$movy$]::text[],
  $movy$policy$movy$,
  $movy$Politicas Internas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$politicas-internas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-politicas-internas-anti-discrimination-harassment-bullying$movy$,
  $movy$Anti-Discrimination, Harassment & Bullying$movy$,
  $movy$Anti-Discrimination, Harassment & Bullying$movy$,
  $movy$Anti-Discrimination, Harassment & Bullying$movy$,
  $movy$<div class="legacy-sop"><p class="body-t">A Movy tem política clara de igualdade de oportunidades e não tolera discriminação, assédio, bullying ou vitimização.</p><div class="sh2">O que é bullying e assédio?</div><ul class="bl"><li>Comportamento repetido e irrazoável que cria risco à saúde e segurança</li><li><strong>Direto:</strong> ameaças, violência, linguagem abusiva, humilhação pública</li><li><strong>Indireto:</strong> exclusão deliberada, rumores maliciosos, retenção de informações</li></ul><div class="sh2">O que NÃO é bullying?</div><ul class="bl"><li>Definição de metas, gestão de desempenho, feedbacks construtivos</li><li>Comunicação de comportamento inadequado ou mudanças organizacionais</li></ul><div class="sh2">Assédio sexual</div><ul class="bl"><li>Avanços sexuais, pedidos de favores sexuais ou qualquer conduta sexual indesejada que ofenda, humilhe ou intimide — mesmo que não intencional</li><li>Pode ser por qualquer pessoa, presencial ou fora do trabalho, único ou repetido</li></ul><div class="sh2">Como reportar?</div><ul class="bl"><li>Reportar ao gestor direto — se o problema envolver o gestor, reportar ao nível seguinte</li><li>Nunca é necessário confrontar diretamente a pessoa que é objeto da reclamação</li></ul><div class="box alert"><strong>🚫 ZERO TOLERÂNCIA</strong>Qualquer violação pode resultar em demissão. A Movy proíbe retaliação contra quem registre uma reclamação.</div></div>$movy$,
  $movy$Política de zero tolerância$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$politicas-internas$movy$]::text[],
  $movy$policy$movy$,
  $movy$Politicas Internas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$politicas-internas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-politicas-internas-whs-work-health-safety$movy$,
  $movy$WHS — Work Health & Safety$movy$,
  $movy$WHS — Work Health & Safety$movy$,
  $movy$WHS — Work Health & Safety$movy$,
  $movy$<div class="legacy-sop"><div class="sh2">Obrigações do trabalhador:</div><ul class="bl"><li>Conhecer e seguir os procedimentos de segurança</li><li>Zelar pela própria saúde e segurança e a de colegas</li><li>Identificar e reportar riscos ou perigos imediatamente</li><li>Reportar qualquer acidente, lesão ou quase-acidente ao gestor</li><li>Não interferir com equipamentos de segurança</li><li>Cooperar com inspeções e investigações</li></ul><div class="sh2">Álcool e drogas:</div><ul class="bl"><li>O local de trabalho deve ser livre de álcool e drogas</li><li>Consumo de álcool durante o trabalho é proibido, salvo autorização do gestor</li><li>Nenhum funcionário pode estar sob efeito de álcool nas instalações da Movy</li></ul><div class="box warn"><strong>⚠️ DESCUMPRIMENTO</strong>Falha em cumprir pode resultar em ação disciplinar, incluindo demissão.</div></div>$movy$,
  $movy$Saúde, segurança e bem-estar no trabalho$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$politicas-internas$movy$]::text[],
  $movy$policy$movy$,
  $movy$Politicas Internas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$politicas-internas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-politicas-internas-it-policy-tecnologia-da-informacao$movy$,
  $movy$IT Policy — Tecnologia da Informação$movy$,
  $movy$IT Policy — Tecnologia da Informação$movy$,
  $movy$IT Policy — Tecnologia da Informação$movy$,
  $movy$<div class="legacy-sop"><div class="sh2">E-mail — uso aceitável:</div><ul class="bl"><li>Comunicações de trabalho dentro e fora da Movy</li><li>Uso pessoal incidental e ocasional — excessivo é desencorajado</li><li>Usar linguagem profissional e cortês sempre</li></ul><div class="sh2">E-mail — NÃO permitido:</div><ul class="bl"><li>Distribuição de piadas, fofocas ou boatos</li><li>Conteúdo que assedia, insulta ou discrimina</li><li>Correntes, spam ou conteúdo que viola direitos autorais</li><li>Envio de e-mails que aparentem ser de outra pessoa</li><li>Distribuição de informações confidenciais sem autorização</li></ul><div class="sh2">Internet:</div><ul class="bl"><li>Acesso a material pornográfico é totalmente proibido</li><li>Não baixar softwares sem autorização do gestor</li></ul><div class="sh2">Redes Sociais:</div><ul class="bl"><li>Somente pessoas autorizadas podem publicar em nome da Movy</li><li>Não fornecer informações confidenciais ou mencionar colegas sem aprovação prévia</li><li>Informar a gestão sobre comentários negativos sobre a Movy nas redes</li></ul><div class="box info"><strong>🔍 MONITORAMENTO</strong>A Movy realiza monitoramento contínuo dos sistemas de TI. Não há expectativa de privacidade no uso dos sistemas da Movy.</div></div>$movy$,
  $movy$E-mail, internet e redes sociais$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$politicas-internas$movy$]::text[],
  $movy$policy$movy$,
  $movy$Politicas Internas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$politicas-internas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-politicas-internas-company-property-equipment$movy$,
  $movy$Company Property & Equipment$movy$,
  $movy$Company Property & Equipment$movy$,
  $movy$Company Property & Equipment$movy$,
  $movy$<div class="legacy-sop"><ul class="bl"><li>Todos os equipamentos fornecidos pela Movy pertencem à empresa</li><li>É responsabilidade individual cuidar e proteger os equipamentos</li><li>Exemplos: veículos, móveis, equipamentos de TI, celulares, cartões de dados</li></ul><div class="sh2">Em caso de perda, dano ou roubo:</div><div class="steps"><div class="step"><div class="step-n">1.</div><div><div class="step-t">Notificar a Movy dentro de 48 horas</div></div></div><div class="step"><div class="step-n">2.</div><div><div class="step-t">Se roubado: registrar BO na delegacia ou online em 48h e encaminhar o comprovante à Movy</div></div></div></div><div class="sh2">Responsabilidade e substituição:</div><ul class="bl"><li>Desgaste normal não é responsabilidade do funcionário</li><li>Em casos de negligência grave ou roubo pelo funcionário: Movy pode descontar o custo</li><li><strong>Celular:</strong> aparelho usado em boas condições</li><li><strong>Notebook:</strong> primeiro ou segundo uso, funcionalidade equivalente</li><li><strong>Cartão 3G/4G:</strong> após o funcionário reembolsar o custo integral</li></ul><div class="box info"><strong>📧 NOTIFICAÇÃO</strong>Reportar simultaneamente ao RH e ao Departamento Financeiro.</div></div>$movy$,
  $movy$Propriedade e equipamentos da empresa$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$politicas-internas$movy$]::text[],
  $movy$policy$movy$,
  $movy$Politicas Internas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$politicas-internas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-links-recursos-links-imigracao$movy$,
  $movy$Links — Imigração$movy$,
  $movy$Links — Imigração$movy$,
  $movy$Links — Imigração$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Recurso</th><th>URL</th></tr></thead><tbody><tr><td><strong>VEVO Check</strong> — verificar condições do visto</td><td><a href="https://online.immi.gov.au/evo/firstParty?actionType=query">online.immi.gov.au — VEVO</a></td></tr><tr><td><strong>Cálculo de Férias</strong> — comprimento da estadia</td><td><a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/length-of-stay">immi.homeaffairs.gov.au — Length of Stay</a></td></tr><tr><td><strong>Check list Tool</strong> — documentação exigida</td><td><a href="https://immi.homeaffairs.gov.au/visas/web-evidentiary-tool">immi.homeaffairs.gov.au — Evidentiary Tool</a></td></tr><tr><td><strong>Health Examination</strong> — exames médicos</td><td><a href="https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/health/arrange-your-health-examinations">immi.homeaffairs.gov.au — Health</a></td></tr><tr><td><strong>Translate Free</strong> — tradução oficial gratuita</td><td><a href="https://translating.homeaffairs.gov.au/en">translating.homeaffairs.gov.au</a></td></tr><tr><td><strong>Regras de Tradução</strong> — Student Visa</td><td><a href="https://uk.embassy.gov.au/lhlh/DocumentTranslations.html">uk.embassy.gov.au — Document Translations</a></td></tr></tbody></table></div>$movy$,
  $movy$Department of Home Affairs + ferramentas$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$links-recursos$movy$]::text[],
  $movy$reference$movy$,
  $movy$Links & Recursos$movy$,
  'internal',
  2,
  '2.1',
  true
from public.departments d
where d.slug = $movy$links-recursos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-links-recursos-intake-dates-datas-de-inicio-por-escola$movy$,
  $movy$Intake Dates — Datas de Início por Escola$movy$,
  $movy$Intake Dates — Datas de Início por Escola$movy$,
  $movy$Intake Dates — Datas de Início por Escola$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Instituição</th><th>URL</th></tr></thead><tbody><tr><td><strong>Torrens University</strong></td><td><a href="https://www.torrens.edu.au/how-to-apply/key-dates">torrens.edu.au/how-to-apply/key-dates</a></td></tr><tr><td><strong>Murdoch University</strong></td><td><a href="https://www.murdoch.edu.au/mymurdoch/support-advice/student-admin/key-dates/teaching-periods">murdoch.edu.au — Teaching Periods</a></td></tr><tr><td><strong>Acknowledge / Stotts</strong></td><td><a href="https://www.acknowledgeeducation.edu.au/important-dates/">acknowledgeeducation.edu.au/important-dates</a></td></tr><tr><td><strong>Kaplan Business School</strong></td><td><a href="https://www.kbs.edu.au/documents/academic-calendar">kbs.edu.au — Academic Calendar</a></td></tr></tbody></table></div>$movy$,
  $movy$Links oficiais das instituições parceiras$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$links-recursos$movy$]::text[],
  $movy$reference$movy$,
  $movy$Links & Recursos$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$links-recursos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-links-recursos-links-australia-estudante$movy$,
  $movy$Links — Austrália (estudante)$movy$,
  $movy$Links — Austrália (estudante)$movy$,
  $movy$Links — Austrália (estudante)$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Recurso</th><th>URL</th></tr></thead><tbody><tr><td>CommBank — Student Account</td><td><a href="https://commbank.com.au">commbank.com.au</a></td></tr><tr><td>TFN — ATO</td><td><a href="https://ato.gov.au">ato.gov.au → "Apply for a TFN"</a></td></tr><tr><td>USI</td><td><a href="https://usi.gov.au">usi.gov.au</a></td></tr><tr><td>Photo Card — DoT WA</td><td><a href="https://transport.wa.gov.au">transport.wa.gov.au</a></td></tr><tr><td>RSA/RSG — Pinnacle Safety</td><td><a href="https://pinnaclesafety.com.au">pinnaclesafety.com.au</a></td></tr><tr><td>RSA/RSG — AHA WA</td><td><a href="https://ahawa.asn.au">ahawa.asn.au</a></td></tr><tr><td>Transperth</td><td><a href="https://transperth.wa.gov.au">transperth.wa.gov.au</a></td></tr><tr><td>Fair Work Ombudsman</td><td><a href="https://fairwork.gov.au">fairwork.gov.au</a></td></tr><tr><td>Australian Border Force</td><td><a href="https://abf.gov.au">abf.gov.au</a></td></tr></tbody></table></div>$movy$,
  $movy$Documentação, banco, transporte e trabalho$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$links-recursos$movy$]::text[],
  $movy$reference$movy$,
  $movy$Links & Recursos$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$links-recursos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-links-recursos-links-manter-se-informado$movy$,
  $movy$Links — Manter-se Informado$movy$,
  $movy$Links — Manter-se Informado$movy$,
  $movy$Links — Manter-se Informado$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Recurso</th><th>URL</th></tr></thead><tbody><tr><td><strong>ICEF Monitor</strong> — notícias do setor</td><td><a href="https://monitor.icef.com">monitor.icef.com</a></td></tr><tr><td><strong>Study Australia</strong> — plataforma oficial do governo</td><td><a href="https://studyaustralia.gov.au">studyaustralia.gov.au</a></td></tr><tr><td><strong>Insider Guides</strong> — guia para estudantes internacionais</td><td><a href="https://insiderguides.com.au">insiderguides.com.au</a></td></tr></tbody></table></div>$movy$,
  $movy$Publicações do setor de educação internacional$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$links-recursos$movy$]::text[],
  $movy$reference$movy$,
  $movy$Links & Recursos$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$links-recursos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-links-recursos-materiais-movy-o-que-enviar-em-cada-fase$movy$,
  $movy$Materiais Movy — o que enviar em cada fase$movy$,
  $movy$Materiais Movy — o que enviar em cada fase$movy$,
  $movy$Materiais Movy — o que enviar em cada fase$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Fase</th><th>Material</th><th>Quando</th></tr></thead><tbody><tr><td class="acc"><strong>Fase 1</strong></td><td>PDF — Manual de Sobrevivência do Estudante</td><td class="mut">Após visto aprovado</td></tr><tr><td class="acc"><strong>Fase 2</strong></td><td>PPT Partes 1 e 2 — Pré-Embarque + Checklist</td><td class="mut">Após reunião de pré-embarque</td></tr><tr><td class="acc"><strong>Fase 5</strong></td><td>PPT Parte 3 — Chegada em Perth</td><td class="mut">Após Welcome Session</td></tr></tbody></table></div>$movy$,
  $movy$Links uteis, recursos oficiais, intake dates e contatos internos.$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$links-recursos$movy$]::text[],
  $movy$reference$movy$,
  $movy$Links & Recursos$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$links-recursos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-links-recursos-equipe-e-contatos-internos$movy$,
  $movy$Equipe e Contatos Internos$movy$,
  $movy$Equipe e Contatos Internos$movy$,
  $movy$Equipe e Contatos Internos$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Função</th><th>Responsável</th></tr></thead><tbody><tr><td>Agentes — visto de estudante</td><td>Matheus e Mari</td></tr><tr><td>Consultoria de carreira</td><td>Marcos (diretor)</td></tr><tr><td>Departamento de Vistos / Admin / Finance</td><td>Julia</td></tr><tr><td>Student Support</td><td>Beatrice · studentsupport@movyeducation.com</td></tr><tr><td>Site</td><td><a href="https://movyeducation.com">movyeducation.com</a></td></tr><tr><td>Instagram</td><td>@movyeducation</td></tr><tr><td>Agendamentos</td><td><a href="https://movy.as.me">movy.as.me</a></td></tr><tr><td>Endereço</td><td>Level 1/324 Murray St, Perth WA 6000</td></tr></tbody></table></div>$movy$,
  $movy$Links uteis, recursos oficiais, intake dates e contatos internos.$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$links-recursos$movy$]::text[],
  $movy$reference$movy$,
  $movy$Links & Recursos$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$links-recursos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-nomenclaturas-pasta-documents$movy$,
  $movy$Pasta: Documents$movy$,
  $movy$Pasta: Documents$movy$,
  $movy$Pasta: Documents$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Nomenclatura</th><th>Tipo / Descrição</th></tr></thead><tbody><tr><td><code>Passport - {Name SURNAME}</code></td><td>Passaporte do aluno. Não pode vencer em menos de 6 meses. Se o aluno tiver dupla cidadania, salvar ambos. Atualizar no sistema se houver passaporte novo.</td></tr><tr><td><code>Visa Grant [Subclass] - [Exp date] - {Name SURNAME}</code></td><td>Visto atual — salvar na pasta Documents (não Visa)</td></tr><tr><td><code>{Name of Insurance provider} OSHC - {Expiration date} - {Name SURNAME}</code></td><td>Seguro de saúde (BUPA / AHM / Allianz...)</td></tr><tr><td><code>Marriage Certificate - [original and translated] - {Name SURNAME}</code></td><td>Certidão de casamento</td></tr><tr><td><code>VISA + OSHC Payment receipt - {Name SURNAME}</code></td><td>Comprovante de pagamento do visto e seguro feito na conta Movy</td></tr><tr><td><code>CoE - {School name} - {course name} - {Name SURNAME}</code></td><td>COEs anteriores (histórico)</td></tr><tr><td><code>Resume - {Name SURNAME}</code></td><td>Currículo do aluno</td></tr><tr><td><code>Translation Payment Receipt - {Name SURNAME}</code></td><td>Comprovante de pagamento de tradução NAATI</td></tr><tr><td><code>{School name} Certificate - {Course name} - {Name SURNAME}</code></td><td>Certificados de cursos ONSHORE</td></tr><tr><td><code>{Level of study} - Award [original and translated] - (Course Name) - {Name SURNAME}</code></td><td>Certificados de cursos OFFSHORE (com tradução)</td></tr><tr><td><code>Ac. Transcript - {Course Name} - {Name SURNAME}</code></td><td>Histórico acadêmico de cursos ONSHORE</td></tr><tr><td><code>{Level of study} - Academic transcript [original and translated] - {Name SURNAME}</code></td><td>Histórico acadêmico de cursos OFFSHORE (com tradução)</td></tr><tr><td><code>{English test name} - {Name SURNAME}</code></td><td>Teste de inglês (PTE / IELTS / CAMBRIDGE)</td></tr></tbody></table></div>$movy$,
  $movy$Documentos pessoais, acadêmicos e de identificação do aluno$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$nomenclaturas$movy$]::text[],
  $movy$reference$movy$,
  $movy$Nomenclaturas$movy$,
  'internal',
  2,
  '2.1',
  true
from public.departments d
where d.slug = $movy$nomenclaturas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-nomenclaturas-pasta-enrolments-school-folder$movy$,
  $movy$Pasta: Enrolments → {School folder}$movy$,
  $movy$Pasta: Enrolments → {School folder}$movy$,
  $movy$Pasta: Enrolments → {School folder}$movy$,
  $movy$<div class="legacy-sop"><table class="tbl"><thead><tr><th>Nomenclatura</th><th>Tipo / Descrição</th></tr></thead><tbody><tr><td><code>Enrolment form - [Course name] - {Name SURNAME}</code></td><td>Formulário de matrícula</td></tr><tr><td><code>Movy School application form - {Name SURNAME}</code></td><td>Formulário preenchido pelo aluno no Cognito</td></tr><tr><td><code>{School name} Offer letter - {Name SURNAME}</code></td><td>Offer Letter padrão</td></tr><tr><td><code>{School name} Offer letter [signed] - {Name SURNAME}</code></td><td>Offer Letter assinada pelo aluno</td></tr><tr><td><code>{School name} Conditional offer letter - {Name SURNAME}</code></td><td>Offer Letter com condições</td></tr><tr><td><code>{School name} Conditional offer letter [signed] - {Name SURNAME}</code></td><td>Offer Letter com condições — assinada</td></tr><tr><td><code>{School} Amended Offer Letter {Name SURNAME}</code></td><td>Offer Letter corrigida/alterada</td></tr><tr><td><code>{School} Wrong Offer Letter {Name SURNAME}</code></td><td>Offer Letter com erro (salvar mesmo assim)</td></tr><tr><td><code>{School name} Payment Receipt - {Name SURNAME}</code></td><td>Comprovante de pagamento à escola</td></tr><tr><td><code>CoE {Name of the course} - {Name SURNAME}</code></td><td>COE atual (Confirmation of Enrolment)</td></tr><tr><td><code>CoE Cancelled {Name of the course} - {Name SURNAME}</code></td><td>COE cancelado</td></tr><tr><td><code>Change of agency form - {Name SURNAME}</code></td><td>Formulário de mudança de agência</td></tr></tbody></table></div>$movy$,
  $movy$Todos os documentos relacionados à matrícula em cada escola$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$nomenclaturas$movy$]::text[],
  $movy$reference$movy$,
  $movy$Nomenclaturas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$nomenclaturas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-nomenclaturas-pasta-visa$movy$,
  $movy$Pasta: Visa$movy$,
  $movy$Pasta: Visa$movy$,
  $movy$Pasta: Visa$movy$,
  $movy$<div class="legacy-sop"><div class="sh2">Formulário 956 (Autorização de Representante)</div><table class="tbl"><thead><tr><th>Nomenclatura</th><th>Tipo / Descrição</th></tr></thead><tbody><tr><td><code>Form 956 to be signed - {Name SURNAME}</code></td><td>Formulário 956 aguardando assinatura</td></tr><tr><td><code>Form 956 signed - {Name SURNAME}</code></td><td>Formulário 956 — versão final assinada</td></tr></tbody></table><div class="sh2">GTE / GS — Genuine Student Statement</div><table class="tbl"><thead><tr><th>Nomenclatura</th><th>Tipo / Descrição</th></tr></thead><tbody><tr><td><code>GTE Letter [old] - {Name SURNAME}</code></td><td>GTE do visto anterior</td></tr><tr><td><code>GTE Letter [student draft] - {Name SURNAME}</code></td><td>Rascunho enviado pelo aluno</td></tr><tr><td><code>GTE Letter [to be approved] - {Name SURNAME}</code></td><td>GTE recebida do departamento de vistos — para revisão do Educational Agent + aluno</td></tr><tr><td><code>GTE Letter [student draft version 2] - {Name SURNAME}</code></td><td>Versões intermediárias (quando o aluno pede alterações — manter todas até ter a versão "approved")</td></tr><tr><td><code>GTE Letter [approved] - {Name SURNAME}</code></td><td>Versão final editável aprovada pelo aluno (.Pages ou .doc)</td></tr><tr><td><code>GTE Letter - {Name SURNAME}</code></td><td>Versão final em PDF</td></tr><tr><td><code>{Name of School} GTE Letter {Name SURNAME}</code></td><td>GTE solicitada pela escola</td></tr></tbody></table><div class="sh2">Aplicação do Visto</div><table class="tbl"><thead><tr><th>Nomenclatura</th><th>Tipo / Descrição</th></tr></thead><tbody><tr><td><code>Last visa application - {Name SURNAME}</code></td><td>Última aplicação de visto importada</td></tr><tr><td><code>Visa application form - {Name SURNAME}</code></td><td>Formulário preenchido pelo aluno no Cognito</td></tr><tr><td><code>Draft new visa application - {Name SURNAME}</code></td><td>Rascunho — consultor usa a última aplicação para verificar mudanças com o aluno, adiciona notas em azul para montagem do documento</td></tr><tr><td><code>Student Visa Application [to be approved] - {Name SURNAME}</code></td><td>Versão enviada ao aluno para revisão e edição</td></tr><tr><td><code>Student Visa Application [approved] - {Name SURNAME}</code></td><td>Versão final — enviada quando o visto é aplicado</td></tr><tr><td><code>Request Checklist and Details - {Name SURNAME}</code></td><td>Salvar na pasta Visa com nome completo do aluno</td></tr><tr><td><code>s56 Request for More Information - {Name SURNAME}</code></td><td>Pedido de informações adicionais pela imigração — salvar na pasta Visa</td></tr></tbody></table><div class="sh2">Notificações e Resultados</div><table class="tbl"><thead><tr><th>Nomenclatura</th><th>Tipo / Descrição</th></tr></thead><tbody><tr><td><code>IMMI Grant Notification Exp [dd-mm-yyyy] - {Name SURNAME}</code></td><td>Novo visto aprovado — salvar na pasta Visa</td></tr><tr><td><code>IMMI Refusal Notification - {Name SURNAME}</code></td><td>Recusa do visto</td></tr><tr><td><code>IMMI Acknowledgement of Application Received - {Name SURNAME}</code></td><td>Confirmação de recebimento da aplicação</td></tr><tr><td><code>IMMI Bridging Visa Grant Notification - {Name SURNAME}</code></td><td>Concessão do Bridging Visa</td></tr></tbody></table><div class="sh2">Exames Médicos e Biometria</div><table class="tbl"><thead><tr><th>Nomenclatura</th><th>Tipo / Descrição</th></tr></thead><tbody><tr><td><code>Medical Examination - HAP ID - {Name SURNAME}</code></td><td>Organização do HAP (Health Assessment Priority)</td></tr><tr><td><code>HAP ID - {Name SURNAME}</code></td><td>HAP anterior ou novo</td></tr><tr><td><code>Biometrics - ID - {Name SURNAME}</code></td><td>Solicitação de biometria</td></tr></tbody></table></div>$movy$,
  $movy$Todos os documentos relacionados ao processo de visto$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$nomenclaturas$movy$]::text[],
  $movy$reference$movy$,
  $movy$Nomenclaturas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$nomenclaturas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-nomenclaturas-onde-salvar-guia-rapido-por-tipo-de-documento$movy$,
  $movy$Onde salvar — guia rápido por tipo de documento$movy$,
  $movy$Onde salvar — guia rápido por tipo de documento$movy$,
  $movy$Onde salvar — guia rápido por tipo de documento$movy$,
  $movy$<div class="legacy-sop"><div><div><div>📂 DOCUMENTS</div><ul class="bl"><li>Passaporte</li><li>Visto atual (Visa Grant)</li><li>OSHC / seguro</li><li>Comprovante VISA + OSHC</li><li>Certidão de casamento</li><li>Certificados de cursos</li><li>Históricos acadêmicos</li><li>Testes de inglês</li><li>Currículo (resume)</li><li>COEs anteriores</li><li>Comprovante tradução NAATI</li></ul></div><div><div>📂 ENROLMENTS / {school}</div><ul class="bl"><li>Formulários de matrícula</li><li>Offer Letter (todas as versões)</li><li>Offer Letter assinada</li><li>COE atual</li><li>COE cancelado</li><li>Comprovante de pagamento à escola</li><li>Change of Agency form</li></ul></div><div><div>📂 VISA</div><ul class="bl"><li>Form 956 (todas as versões)</li><li>GTE Letter (todas as versões)</li><li>Aplicação do visto (rascunhos + final)</li><li>IMMI Grant Notification</li><li>IMMI Refusal</li><li>Bridging Visa</li><li>Acknowledgement</li><li>Exames médicos (HAP ID)</li><li>Biometria</li><li>s56 Request</li></ul></div></div><div class="box warn"><strong>⚠️ ATENÇÃO</strong>O <strong>Visa Grant</strong> (visto atual) vai na pasta <strong>Documents</strong> — não na pasta Visa. A pasta Visa é para documentos do processo de aplicação, não para o visto em si.</div><div class="box tip"><strong>💡 LINK OFICIAL</strong>Consulte sempre o documento oficial de nomenclaturas no Google Drive: <a href="https://docs.google.com/document/d/13RdhFzA1zytxlwv-KMnkvYwv1ipucIKvTk0IPS-UR90/edit">docs.google.com/document — Nomenclature Movy</a></div></div>$movy$,
  $movy$Consulta rápida sem precisar rolar as tabelas acima$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$nomenclaturas$movy$]::text[],
  $movy$reference$movy$,
  $movy$Nomenclaturas$movy$,
  'internal',
  2,
  '2.1',
  false
from public.departments d
where d.slug = $movy$nomenclaturas$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-feedbacks-feedbacks$movy$,
  $movy$Feedbacks$movy$,
  $movy$Feedbacks$movy$,
  $movy$Feedbacks$movy$,
  $movy$<div class="legacy-sop"><div class="fdb-wrap"><!-- HEADER --><div class="fdb-header"><div class="fdb-logo-block"><div><div><div class="fdb-logo-text">Movy</div><div class="fdb-dots"><div class="fdb-dot"></div><div class="fdb-dot"></div><div class="fdb-dot"></div></div></div><div class="fdb-header-sub">FEEDBACK DASHBOARD · PERTH, WA</div></div></div><div class="fdb-meta"><div class="fdb-meta-label">Período analisado</div><div class="fdb-meta-val">Jan – Abr 2026</div><div>11 respostas · 2 formulários</div></div></div><!-- INNER TABS --><div class="fdb-tabs"><div>Visão Geral</div><div>Atendimento</div><div>Serviços</div><div>Google Reviews</div><div>Insights & Ações</div></div><!-- PANEL: VISÃO GERAL --><div class="fdb-panel active" id="fdbp-overview"><div class="fdb-sh">Métricas Principais</div><div class="fdb-metrics"><div class="fdb-mc"><div class="fdb-mc-lbl">NPS Score</div><div class="fdb-mc-val">67</div><div class="fdb-mc-sub"><span class="fdb-nps-badge">Excelente</span></div><div>5 promotores · 0 passivos · 1 detrator</div></div><div class="fdb-mc"><div class="fdb-mc-lbl">NPS Médio</div><div class="fdb-mc-val">9<span>.3</span></div><div class="fdb-mc-sub">escala de 0 a 10</div></div><div class="fdb-mc"><div class="fdb-mc-lbl">Satisfação Atendimento</div><div class="fdb-mc-val">4<span>.9/5</span></div><div class="fdb-mc-sub">média geral</div></div><div class="fdb-mc"><div class="fdb-mc-lbl">Comunicação</div><div class="fdb-mc-val">5<span>/5</span></div><div class="fdb-mc-sub">clareza percebida</div></div><div class="fdb-mc"><div class="fdb-mc-lbl">Recomendam Movy</div><div class="fdb-mc-val">60<span>%</span></div><div class="fdb-mc-sub">com certeza · 20% talvez</div></div><div class="fdb-mc"><div class="fdb-mc-lbl">1º Contato Adequado</div><div class="fdb-mc-val">100<span>%</span></div><div class="fdb-mc-sub">todos os respondentes</div></div></div><div class="fdb-2col"><div><div class="fdb-sh">Motivos de Satisfação</div><div class="fdb-bar-row"><div class="fdb-bar-lbl"><span>Resolução do problema</span><strong>3x</strong></div><div class="fdb-bar-track"><div class="fdb-bar-fill"></div></div></div><div class="fdb-bar-row"><div class="fdb-bar-lbl"><span>Organização / Acompanhamento</span><strong>1x</strong></div><div class="fdb-bar-track"><div class="fdb-bar-fill"></div></div></div><div class="fdb-bar-row"><div class="fdb-bar-lbl"><span>Clareza nas orientações</span><strong>1x</strong></div><div class="fdb-bar-track"><div class="fdb-bar-fill"></div></div></div><div class="fdb-bar-row"><div class="fdb-bar-lbl"><span>Agilidade</span><strong>1x</strong></div><div class="fdb-bar-track"><div class="fdb-bar-fill"></div></div></div><div class="fdb-div"></div><div class="fdb-sh">Distribuição por Serviço</div><div class="fdb-bar-row"><div class="fdb-bar-lbl"><span>Intercâmbio</span><strong>4 clientes</strong></div><div class="fdb-bar-track"><div class="fdb-bar-fill"></div></div></div><div class="fdb-bar-row"><div class="fdb-bar-lbl"><span>Carreira</span><strong>2 clientes</strong></div><div class="fdb-bar-track"><div class="fdb-bar-fill"></div></div></div></div><div><div class="fdb-sh">Equipe em Destaque</div><div class="fdb-staff-grid"><div class="fdb-staffcard"><div class="fdb-stavatar">BE</div><div class="fdb-stname">Beatrice</div><div class="fdb-stcount">3 menções</div></div><div class="fdb-staffcard"><div class="fdb-stavatar">MA</div><div class="fdb-stname">Matheus</div><div class="fdb-stcount">3 menções</div></div><div class="fdb-staffcard"><div class="fdb-stavatar">MR</div><div class="fdb-stname">Marcos</div><div class="fdb-stcount">2 menções</div></div><div class="fdb-staffcard"><div class="fdb-stavatar">MA</div><div class="fdb-stname">Mariana</div><div class="fdb-stcount">2 menções</div></div><div class="fdb-staffcard"><div class="fdb-stavatar">AL</div><div class="fdb-stname">Allana</div><div class="fdb-stcount">1 menção</div></div></div><div class="fdb-div"></div><div class="fdb-sh">NPS por Resposta</div><div><div class="fdb-nps-row"><div class="fdb-nps-dot"></div><span>Giselle Oliver</span><span>7</span><span>passivo</span></div><div class="fdb-nps-row"><div class="fdb-nps-dot"></div><span>Luana</span><span>10</span><span>promotor</span></div><div class="fdb-nps-row"><div class="fdb-nps-dot"></div><span>Camila Lacerda</span><span>10</span><span>promotor</span></div><div class="fdb-nps-row"><div class="fdb-nps-dot"></div><span>Allana Costa</span><span>10</span><span>promotor</span></div><div class="fdb-nps-row"><div class="fdb-nps-dot"></div><span>Tiago Felipe</span><span>10</span><span>promotor</span></div><div class="fdb-nps-row"><div class="fdb-nps-dot"></div><span>Karina</span><span>10</span><span>promotor</span></div></div></div></div><div class="fdb-sh">Comparativo por Setor</div><div class="fdb-sectors"><div class="fdb-scard"><div class="fdb-scard-ttl">Consultoria Inicial</div><div class="fdb-sscore">4<span>.6/5</span></div><div class="fdb-sbar"><div></div></div></div><div class="fdb-scard"><div class="fdb-scard-ttl">Setor de Visto</div><div class="fdb-sscore">4<span>.6/5</span></div><div class="fdb-sbar"><div></div></div></div><div class="fdb-scard"><div class="fdb-scard-ttl">Pós-Aplicação</div><div class="fdb-sscore">4<span>.2/5</span></div><div class="fdb-sbar"><div></div></div></div></div><div></div></div><!-- PANEL: ATENDIMENTO --><div class="fdb-panel" id="fdbp-atendimento"><div class="fdb-sh">Como Foi o Seu Atendimento?</div><div class="fdb-card-grid"><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Giselle Oliver</div><div class="fdb-card-meta">29/01/2026</div></div><span class="fdb-sbadge fdb-b-int">Intercâmbio</span></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div><div class="fdb-quote">"Elogio à Beatrice que me ajudou a resolver um grande problema na escola. NPS 7 pois tive problemas de visto com outro funcionário."</div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">NPS</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">7/10</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Comunicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div><div class="fdb-staff-tags"><span class="fdb-stag">Beatrice</span></div><div class="fdb-sug"><strong>Sugestão</strong>Estejam sempre alinhados internamente no processo de visto.</div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Luana</div><div class="fdb-card-meta">29/01/2026</div></div><span class="fdb-sbadge fdb-b-car">Carreira</span></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div><div class="fdb-quote">"Suporte ao estudante muito prático e prompt, sem palavras para o nível profissional da Movy."</div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">NPS</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">10/10</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Comunicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div><div class="fdb-staff-tags"><span class="fdb-stag">Matheus</span></div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Camila Oliveira de Lacerda</div><div class="fdb-card-meta">30/01/2026</div></div><span class="fdb-sbadge fdb-b-int">Intercâmbio</span></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div><div class="fdb-quote">"Desde o início a equipe se mostrou disposta. O mais incrível é poder falar direto com o Marcos — isso faz toda diferença."</div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">NPS</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">10/10</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Comunicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div><div class="fdb-staff-tags"><span class="fdb-stag">Marcos</span></div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Allana Costa</div><div class="fdb-card-meta">15/02/2026</div></div><span class="fdb-sbadge fdb-b-int">Intercâmbio</span></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div><div class="fdb-quote">"A Beatrice ouviu meus questionamentos e prontamente iniciou a tratativa com a universidade — e foi resolvido!"</div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">NPS</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">10/10</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Comunicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div><div class="fdb-staff-tags"><span class="fdb-stag">Beatrice</span></div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Tiago Felipe</div><div class="fdb-card-meta">17/03/2026</div></div><span class="fdb-sbadge fdb-b-car">Carreira</span></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div><div class="fdb-quote">"Sempre dispostos a ajudar e solucionar qualquer problema."</div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">NPS</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">10/10</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Comunicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Karina</div><div class="fdb-card-meta">20/04/2026</div></div><span class="fdb-sbadge fdb-b-int">Intercâmbio</span></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div><div class="fdb-quote">"Matheus e Bia acompanharam o caso com a ILSC com todas as providências necessárias até o final. Super recomendo!"</div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">NPS</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">10/10</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Comunicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div><div class="fdb-staff-tags"><span class="fdb-stag">Matheus</span><span class="fdb-stag">Beatrice</span></div></div></div></div><!-- PANEL: SERVIÇOS --><div class="fdb-panel" id="fdbp-servicos"><div class="fdb-sh">Comparativo por Setor</div><div class="fdb-sectors"><div class="fdb-scard"><div class="fdb-scard-ttl">Consultoria Inicial</div><div class="fdb-sscore">4<span>.6/5</span></div><div class="fdb-sbar"><div></div></div></div><div class="fdb-scard"><div class="fdb-scard-ttl">Setor de Visto</div><div class="fdb-sscore">4<span>.6/5</span></div><div class="fdb-sbar"><div></div></div></div><div class="fdb-scard"><div class="fdb-scard-ttl">Pós-Aplicação</div><div class="fdb-sscore">4<span>.2/5</span></div><div class="fdb-sbar"><div></div></div></div></div><div class="fdb-sh">Como Nos Saímos? — Respostas Individuais</div><div class="fdb-card-grid"><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Camila</div><div class="fdb-card-meta">10/02/2026 · Consultor: Mariana</div></div><span class="fdb-rbadge fdb-r-no">Não recomenda</span></div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">Consultoria</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Visto</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">3/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Pós-Aplicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">1/5</div></div></div><div class="fdb-sug"><strong>Motivo do Visto</strong>Falaram uma data e não aplicaram na data exata.</div><div class="fdb-sug"><strong>Pós-Aplicação</strong>Não responde. — Nota crítica: ação imediata necessária.</div><div class="fdb-quote">"A Mari é maravilhosa, amei o atendimento dela."</div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Camila (2ª resposta)</div><div class="fdb-card-meta">10/02/2026 · Consultor: Mariana</div></div><span class="fdb-rbadge fdb-r-yes">Com certeza</span></div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">Consultoria</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Visto</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Pós-Aplicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Dayse</div><div class="fdb-card-meta">02/03/2026 · Consultor: Marcos</div></div><span class="fdb-rbadge fdb-r-yes">Com certeza</span></div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">Consultoria</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Visto (Allana)</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Pós-Aplicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div><div class="fdb-sug"><strong>Sugestão importante</strong>Faltou organização no início: demora em respostas, envio de documentação e comunicação interna — corri o risco de perder a matrícula.</div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Filipe Campos Gerdes</div><div class="fdb-card-meta">06/03/2026 · Consultor: Marcos</div></div><span class="fdb-rbadge fdb-r-yes">Com certeza</span></div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">Consultoria</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Visto</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Pós-Aplicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div><div class="fdb-quote">"Muito feliz de fazer minha segunda aplicação de visto com eles!"</div></div><div class="fdb-card"><div class="fdb-card-hdr"><div><div class="fdb-card-name">Marina Costa Ferreira</div><div class="fdb-card-meta">12/03/2026 · Consultor: Matheus</div></div><span class="fdb-rbadge fdb-r-maybe">Talvez</span></div><div class="fdb-stats"><div class="fdb-stat"><div class="fdb-stat-lbl">Consultoria</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">3/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Visto</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div><div class="fdb-stat"><div class="fdb-stat-lbl">Pós-Aplicação</div><div class="fdb-mini-track"><div class="fdb-mini-fill"></div></div><div class="fdb-stat-val">5/5</div></div></div><div class="fdb-sug"><strong>Sugestão</strong>Atendimento e clareza das informações deixaram a desejar — retorno demorou dias. Segunda renovação de visto, qualidade do serviço é boa mas comunicação piorou.</div></div></div></div><!-- PANEL: GOOGLE REVIEWS --><div class="fdb-panel" id="fdbp-google"><div class="fdb-metrics"><div class="fdb-mc"><div class="fdb-mc-lbl">Nota Média Google</div><div class="fdb-mc-val">4<span>.7</span></div><div class="fdb-mc-sub">★ Google Reviews</div></div><div class="fdb-mc"><div class="fdb-mc-lbl">5 Estrelas</div><div class="fdb-mc-val">67<span>%</span></div><div class="fdb-mc-sub">4 de 6 avaliações</div></div><div class="fdb-mc"><div class="fdb-mc-lbl">3 Estrelas</div><div class="fdb-mc-val">17<span>%</span></div><div class="fdb-mc-sub">1 de 6 avaliações</div></div><div class="fdb-mc"><div class="fdb-mc-lbl">4 Estrelas</div><div class="fdb-mc-val">17<span>%</span></div><div class="fdb-mc-sub">1 de 6 avaliações</div></div></div><div class="fdb-sh">Avaliações Recentes</div><div class="fdb-gg"><div class="fdb-gc"><div class="fdb-gc-hdr"><div class="fdb-avatar">IM</div><div><div class="fdb-gname">Isabela Mendonça</div><div class="fdb-gdate">Mar 2025</div></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div></div><div class="fdb-gquote">"Equipe incrível! O Marcos me ajudou a entender todos os meus direitos como estudante e as melhores opções para Perth. Recomendo demais."</div></div><div class="fdb-gc"><div class="fdb-gc-hdr"><div class="fdb-avatar">RS</div><div><div class="fdb-gname">Rafael Souza</div><div class="fdb-gdate">Jan 2025</div></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div></div><div class="fdb-gquote">"Atendimento impecável desde o primeiro contato. A Beatrice foi extremamente dedicada e paciente em cada etapa do processo de intercâmbio."</div></div><div class="fdb-gc"><div class="fdb-gc-hdr"><div class="fdb-avatar">JA</div><div><div class="fdb-gname">Júlia Andrade</div><div class="fdb-gdate">Dez 2024</div></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star off">★</span></div></div><div class="fdb-gquote">"Muito profissionais e atenciosos. O processo de visto demorou um pouco mais que o esperado, mas no geral foi ótima experiência."</div></div><div class="fdb-gc"><div class="fdb-gc-hdr"><div class="fdb-avatar">PL</div><div><div class="fdb-gname">Pedro Lemos</div><div class="fdb-gdate">Nov 2024</div></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div></div><div class="fdb-gquote">"A Movy transformou meu sonho em realidade. Matheus me acompanhou em cada detalhe. Melhor agência de Perth!"</div></div><div class="fdb-gc"><div class="fdb-gc-hdr"><div class="fdb-avatar">FC</div><div><div class="fdb-gname">Fernanda Castro</div><div class="fdb-gdate">Out 2024</div></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star off">★</span><span class="fdb-star off">★</span></div></div><div class="fdb-gquote">"O serviço é bom, mas às vezes a comunicação demora. No final tudo foi resolvido, mas gerou ansiedade no processo."</div></div><div class="fdb-gc"><div class="fdb-gc-hdr"><div class="fdb-avatar">LB</div><div><div class="fdb-gname">Lucas Braga</div><div class="fdb-gdate">Set 2024</div></div><div class="fdb-stars"><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span><span class="fdb-star on">★</span></div></div><div class="fdb-gquote">"Movy é sinônimo de confiança! Segunda vez que utilizo os serviços e sempre saio satisfeito. Equipe comprometida com resultado."</div></div></div></div><!-- PANEL: INSIGHTS --><div class="fdb-panel" id="fdbp-insights"><div class="fdb-sh">Pontos Fortes</div><div class="fdb-insight-grid"><div class="fdb-insight fdb-ig"><div class="fdb-iico">✓</div><div><div class="fdb-ittl">NPS Score 67 — zona de excelência</div><div class="fdb-idesc">Com 5 promotores e apenas 1 detrator, a Movy supera a média do setor de intercâmbio (NPS ~40–50).</div></div></div><div class="fdb-insight fdb-ig"><div class="fdb-iico">✓</div><div><div class="fdb-ittl">Atendimento humano é o principal diferencial</div><div class="fdb-idesc">Clientes valorizam o contato direto e pessoal com Marcos, Beatrice e Matheus — o fator humano drive a fidelização.</div></div></div><div class="fdb-insight fdb-ig"><div class="fdb-iico">✓</div><div><div class="fdb-ittl">Setor de Visto recupera percepção negativa</div><div class="fdb-idesc">Mesmo clientes insatisfeitos com a consultoria deram nota 5 para o visto — demonstra competência técnica sólida.</div></div></div><div class="fdb-insight fdb-ig"><div class="fdb-iico">✓</div><div><div class="fdb-ittl">60% recomendam sem hesitação</div><div class="fdb-idesc">3 de 5 respondentes do formulário "Como Nos Saímos" indicaram "Com certeza" ao serem perguntados sobre indicação.</div></div></div></div><div class="fdb-sh">Alertas Críticos</div><div class="fdb-insight-grid"><div class="fdb-insight fdb-ib"><div class="fdb-iico">!</div><div><div class="fdb-ittl">Pós-aplicação: nota 1/5 registrada</div><div class="fdb-idesc">Um cliente não recebeu retorno algum após aplicação do visto. Ponto mais crítico — pode comprometer fidelização.</div></div></div><div class="fdb-insight fdb-iw"><div class="fdb-iico">!</div><div><div class="fdb-ittl">Comunicação interna inconsistente</div><div class="fdb-idesc">Dois clientes independentes mencionaram falta de alinhamento — promessas de datas não cumpridas e demora em retornos.</div></div></div><div class="fdb-insight fdb-iw"><div class="fdb-iico">!</div><div><div class="fdb-ittl">Demora em orçamentos e documentação</div><div class="fdb-idesc">Marina precisou solicitar o mesmo documento várias vezes. O processo de onboarding carece de padronização.</div></div></div><div class="fdb-insight fdb-iw"><div class="fdb-iico">!</div><div><div class="fdb-ittl">2 clientes com experiência mista</div><div class="fdb-idesc">Giselle (NPS 7) e Marina ("Talvez") representam risco de churn de indicação — não são promotores ativos.</div></div></div></div><div class="fdb-sh">Plano de Ação — 5 Recomendações</div><div class="fdb-rec-list"><div class="fdb-rec"><div class="fdb-rec-num">01</div><div><div class="fdb-rec-ttl">Implementar SLA de resposta máxima de 24h úteis</div><div class="fdb-rec-desc">Definir tempo máximo de retorno e comunicar ao cliente desde o primeiro contato — elimina a principal queixa de demora.</div></div></div><div class="fdb-rec"><div class="fdb-rec-num">02</div><div><div class="fdb-rec-ttl">Criar checklist de onboarding padronizado</div><div class="fdb-rec-desc">Lista de documentos e etapas obrigatória para todos os consultores — evita o cliente precisar correr atrás de informações.</div></div></div><div class="fdb-rec"><div class="fdb-rec-num">03</div><div><div class="fdb-rec-ttl">Reuniões de alinhamento interno semanais</div><div class="fdb-rec-desc">Especialmente antes de comunicar prazos de visto ao cliente — o gap apareceu em 2 feedbacks independentes.</div></div></div><div class="fdb-rec"><div class="fdb-rec-num">04</div><div><div class="fdb-rec-ttl">Pesquisa proativa de satisfação pós-aplicação</div><div class="fdb-rec-desc">Enviar formulário 2 semanas após a aplicação do visto — automatizar via WhatsApp ou e-mail.</div></div></div><div class="fdb-rec"><div class="fdb-rec-num">05</div><div><div class="fdb-rec-ttl">Solicitar avaliações Google de forma sistemática</div><div class="fdb-rec-desc">Cada cliente com NPS 9–10 deve receber link direto para Google Reviews imediatamente após o feedback positivo.</div></div></div></div></div><div class="fdb-footer"><p>Movy · Perth, WA · Dashboard de Feedbacks 2026 · 11 respostas analisadas</p><div class="fdb-dots"><div class="fdb-dot"></div><div class="fdb-dot"></div><div class="fdb-dot"></div></div></div></div></div>$movy$,
  $movy$Dashboard e analise de feedbacks de estudantes.$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$feedbacks$movy$]::text[],
  $movy$reference$movy$,
  $movy$Feedbacks$movy$,
  'internal',
  5,
  '2.1',
  true
from public.departments d
where d.slug = $movy$feedbacks$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  $movy$beatriz-atendimentos-atendimentos$movy$,
  $movy$Atendimentos$movy$,
  $movy$Atendimentos$movy$,
  $movy$Atendimentos$movy$,
  $movy$<div class="legacy-sop"><div class="atd-hero"><div class="atd-hero-t">Dashboard <span>CSAT</span></div><div class="atd-hero-s">Customer Satisfaction · Atualiza ao importar novo Excel</div><div class="atd-hero-row"><div class="atd-sync"><label class="atd-sync-btn atd-sync-sheets"><span>📤</span> Atualizar com novo Excel <input type="file" id="atd-file-input" accept=".xlsx,.xls"></label><span class="atd-sync-status" id="atd-status">✓ 84 atendimentos carregados · Clique para importar versão atualizada</span></div></div></div><div class="atd-body"><!-- KPIs --><div class="atd-kpis" id="atd-kpis"></div><!-- TOP: Tabela + Motivos lado a lado --><div class="atd-top"><!-- Tabela --><div class="atd-table-wrap"><div class="atd-table-header"><div class="atd-table-title">Todos os Atendimentos</div><div class="atd-filter"><input class="atd-search" id="atd-search" placeholder="🔍 Buscar..."><select id="atd-filter-score"><option value="">Todas as notas</option><option value="10">Nota 10</option><option value="9">Nota 9</option><option value="8">Nota 8</option><option value="7">Nota 7</option><option value="6">Nota 6</option><option value="5">≤ 5</option></select><select id="atd-filter-motivo"><option value="">Todos os motivos</option></select></div></div><div><table class="atd-t"><thead><tr><th>Cliente</th><th>Motivo</th><th>Tempo</th><th>Follow-up</th><th>Resolução</th><th>Aderência</th><th>Nota</th><th>Observação</th></tr></thead><tbody id="atd-tbody"></tbody></table></div><div id="atd-count"></div></div><!-- Motivos --><div class="atd-motivos-card"><div class="atd-chart-title">Top Motivos de Contato</div><div id="atd-motivos-bars"></div></div></div></div></div>$movy$,
  $movy$Base de atendimentos, indicadores e motivos de contato.$movy$,
  d.id,
  'published'::public.content_status,
  ARRAY[$movy$beatriz$movy$, $movy$movy$movy$, $movy$atendimentos$movy$]::text[],
  $movy$reference$movy$,
  $movy$Atendimentos$movy$,
  'internal',
  2,
  '2.1',
  true
from public.departments d
where d.slug = $movy$atendimentos$movy$
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();
