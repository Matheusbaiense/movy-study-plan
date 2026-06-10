-- ============================================================
-- Movy Internal Hub — Seed de conteúdo rico com blocos
-- Execute APÓS a migration 002 estar aplicada
-- ============================================================

-- Limpa seeds anteriores por slug (safe re-run)
DELETE FROM contents WHERE slug IN (
  'pre-embarque-student-support',
  'visto-subclass-500',
  'follow-up-offshore',
  'politica-licencas'
);

-- 1. Student Support — Pre-Embarque (checklist + steps + infobox)
INSERT INTO contents (
  slug, title_pt, title_en, title_es,
  summary,
  department_id,
  content_type, category,
  status, visibility, read_minutes, version,
  body_pt, body_en, body_es,
  blocks
) VALUES (
  'pre-embarque-student-support',
  'Checklist Pré-Embarque do Estudante',
  'Student Pre-Departure Checklist',
  'Lista de Verificación Pre-Embarque del Estudiante',
  'Tudo que o estudante precisa fazer e verificar antes de embarcar para a Austrália.',
  (SELECT id FROM departments WHERE slug = 'student-support'),
  'checklist', 'Onboarding',
  'published', 'internal', 8, '1.0',
  '', '', '',
  '[
    {"type":"infobox","variant":"info","title":"Sobre este checklist","content":"Este documento deve ser compartilhado com o estudante pelo menos 2 semanas antes do embarque. Cada item tem um responsável (estudante ou Movy)."},
    {"type":"checklist","id":"pre-embarque-docs","title":"Documentos obrigatórios","items":[
      {"id":"passaporte","label":"Passaporte válido por pelo menos 6 meses após o visto"},
      {"id":"visto","label":"Confirmação de visto Subclass 500 aprovado"},
      {"id":"coe","label":"CoE (Confirmation of Enrolment) da instituição"},
      {"id":"seguro","label":"OSHC (Overseas Student Health Cover) ativo"},
      {"id":"passagem","label":"Passagem de ida confirmada e impressa"}
    ]},
    {"type":"checklist","id":"pre-embarque-financeiro","title":"Financeiro","items":[
      {"id":"conta-au","label":"Conta bancária australiana aberta (ANZ, CommBank ou equivalente)"},
      {"id":"cartao","label":"Cartão de débito internacional habilitado"},
      {"id":"dinheiro","label":"Mínimo AUD 2.000 disponível para os primeiros dias"},
      {"id":"aluguel","label":"Primeiro mês de aluguel/acomodação confirmado e pago"}
    ]},
    {"type":"steps","title":"Sequência de ações Movy","items":[
      {"title":"Enviar CoE ao estudante","body":"Confirmar que o CoE está no nome correto e com as datas certas. Enviar PDF por email."},
      {"title":"Verificar OSHC","body":"Checar no sistema da seguradora se a cobertura começa antes da chegada.","note":"Crítico: estudante não pode entrar em AU sem OSHC ativo."},
      {"title":"Orientação de chegada","body":"Enviar o guia de chegada com instruções de transporte do aeroporto, contato de emergência Movy e endereço da escola."},
      {"title":"Follow-up D+3","body":"Entrar em contato 3 dias após a chegada para confirmar que está tudo bem e que o estudante chegou na escola."}
    ]},
    {"type":"infobox","variant":"warn","title":"Atenção — Prazo de matrícula","content":"O estudante deve comparecer à escola no máximo 3 dias úteis após a chegada. Ausências sem justificativa são reportadas ao Departamento de Imigração."}
  ]'::jsonb
);

-- 2. Visa — Subclass 500 (steps + table + checklist)
INSERT INTO contents (
  slug, title_pt, title_en, title_es,
  summary,
  department_id,
  content_type, category,
  status, visibility, read_minutes, version,
  body_pt, body_en, body_es,
  blocks
) VALUES (
  'visto-subclass-500',
  'Processo Visto Subclass 500',
  'Subclass 500 Student Visa Process',
  'Proceso Visa Subclase 500',
  'Passo a passo completo para solicitação do visto de estudante australiano Subclass 500.',
  (SELECT id FROM departments WHERE slug = 'visa'),
  'process', 'Vistos de Estudante',
  'published', 'internal', 12, '2.1',
  '', '', '',
  '[
    {"type":"infobox","variant":"tip","title":"Tempo médio de processamento","content":"Vistos Subclass 500 estão sendo processados em 4–8 semanas para brasileiros. Sempre aplicar com pelo menos 3 meses de antecedência do início do curso."},
    {"type":"table","headers":["Documento","Obrigatório","Observação"],"rows":[
      ["Passaporte válido","Sim","Válido por 6+ meses após fim do visto"],
      ["CoE da instituição","Sim","Obtido após matrícula confirmada"],
      ["OSHC","Sim","Mínimo cobrindo duração do visto"],
      ["Comprovante financeiro","Sim","AUD 21.041/ano + mensalidade do curso"],
      ["Histórico escolar","Sim","Tradução juramentada se não for em inglês"],
      ["Carta de motivação","Recomendado","Explica objetivo de estudo na Austrália"],
      ["Extrato bancário 3 meses","Sim","Conta principal do requerente ou responsável"]
    ]},
    {"type":"steps","title":"Fluxo de aplicação","items":[
      {"title":"Confirmar matrícula e obter CoE","body":"A CoE só é emitida após pagamento das taxas iniciais pela instituição."},
      {"title":"Contratar OSHC","body":"Contratar antes da aplicação. Operadoras aceitas: Medibank, Allianz, BUPA, NIB, AHM."},
      {"title":"Reunir documentação financeira","body":"Extrato dos últimos 3 meses + carta do banco + comprovante de renda do responsável financeiro."},
      {"title":"Criar conta ImmiAccount","body":"Acessar immi.homeaffairs.gov.au → Create account → Individual.","note":"Usar o mesmo email que constará no visto."},
      {"title":"Submeter aplicação online","body":"Form 157A no ImmiAccount. Pagar taxa AUD 710 via cartão internacional."},
      {"title":"Biométricos (se necessário)","body":"Verificar se o país de origem requer biometria. Brasil: geralmente não requer."},
      {"title":"Aguardar decisão","body":"Acompanhar status no ImmiAccount. Grant Notice chega por email."}
    ]},
    {"type":"checklist","id":"subclass500-docs","title":"Checklist de documentos","items":[
      {"id":"passaporte-500","label":"Passaporte com validade suficiente"},
      {"id":"coe-500","label":"CoE emitida pela instituição"},
      {"id":"oshc-500","label":"OSHC contratada e comprovante em mãos"},
      {"id":"financeiro-500","label":"Documentação financeira completa"},
      {"id":"historico-500","label":"Histórico escolar traduzido (se aplicável)"},
      {"id":"immiaccount-500","label":"Conta ImmiAccount criada"},
      {"id":"taxa-500","label":"Taxa AUD 710 disponível no cartão"}
    ]}
  ]'::jsonb
);

-- 3. Commercial — Follow-up Offshore (email templates + steps)
INSERT INTO contents (
  slug, title_pt, title_en, title_es,
  summary,
  department_id,
  content_type, category,
  status, visibility, read_minutes, version,
  body_pt, body_en, body_es,
  blocks
) VALUES (
  'follow-up-offshore',
  'Follow-up Lead Offshore',
  'Offshore Lead Follow-up',
  'Seguimiento de Lead Offshore',
  'Templates e processo de follow-up para leads que estão no exterior e têm interesse em estudar na Austrália.',
  (SELECT id FROM departments WHERE slug = 'commercial'),
  'template', 'Follow-up',
  'published', 'internal', 6, '1.3',
  '', '', '',
  '[
    {"type":"infobox","variant":"tip","title":"Contexto","content":"Leads offshore geralmente estão em fusos diferentes. Sempre mencionar o fuso horário de Perth (AWST) ao marcar reuniões. Resposta esperada em até 48h para esses leads."},
    {"type":"steps","title":"Cadência de follow-up","items":[
      {"title":"Dia 1 — Primeiro contato","body":"Enviar email de boas-vindas com apresentação da Movy e perguntas sobre objetivo de estudo."},
      {"title":"Dia 3 — WhatsApp de verificação","body":"Mensagem curta perguntando se recebeu o email e se tem disponibilidade para uma call."},
      {"title":"Dia 7 — Email com recursos","body":"Enviar guia de cursos recomendados baseado no perfil do lead."},
      {"title":"Dia 14 — Última tentativa","body":"Email final com urgência suave. Se não responder, marcar como nurturing no CRM."}
    ]},
    {"type":"email","id":"email-boas-vindas","label":"Email D+1 — Boas-vindas","from":"comercial@movyeducation.com","to":"{{lead_email}}","subject":"Bem-vindo à Movy — Seu futuro na Austrália começa aqui 🇦🇺","body":"Olá, {{nome}}!\n\nÉ um prazer ter você no radar da Movy.\n\nSomos uma agência especializada em educação e imigração para a Austrália, com sede em Perth. Ajudamos centenas de brasileiros a realizar o sonho de estudar e morar aqui.\n\nPara que possamos te ajudar melhor, gostaria de entender um pouco mais sobre você:\n\n• Qual curso ou área de interesse você tem em mente?\n• Você tem alguma preferência de cidade na Austrália?\n• Qual seria sua janela ideal para começar?\n\nEstou à disposição para uma conversa sem compromisso — pode ser por call ou WhatsApp, no horário que for melhor pra você.\n\nAbraço,\n{{nome_consultor}}\nMovy Education\n+61 (8) XXXX-XXXX | comercial@movyeducation.com"},
    {"type":"email","id":"email-recursos","label":"Email D+7 — Recursos","from":"comercial@movyeducation.com","to":"{{lead_email}}","subject":"{{nome}}, separei isso especialmente para você","body":"Olá, {{nome}}!\n\nPassei a semana pensando no que poderia ser mais útil para você neste momento.\n\nSeparei um material sobre os cursos mais procurados por brasileiros em Perth:\n\n• English + Vocational: ótimo para quem quer chegar, trabalhar e melhorar o inglês\n• Certificate III/IV: qualificação profissional reconhecida no mercado australiano\n• Bachelor Degree: para quem quer investir em carreira de longo prazo\n\nQual desses ressoa mais com o que você está pensando?\n\nMe responde essa mensagem e a gente agenda 30 minutos para explorar as opções.\n\nAté breve,\n{{nome_consultor}}\nMovy Education"}
  ]'::jsonb
);

-- 4. Administrative — Leave Policy (section + infobox + table + steps)
INSERT INTO contents (
  slug, title_pt, title_en, title_es,
  summary,
  department_id,
  content_type, category,
  status, visibility, read_minutes, version,
  body_pt, body_en, body_es,
  blocks
) VALUES (
  'politica-licencas',
  'Política de Licenças e Ausências',
  'Leave and Absence Policy',
  'Política de Licencias y Ausencias',
  'Tipos de licença disponíveis, processo de solicitação e aprovação para toda a equipe Movy.',
  (SELECT id FROM departments WHERE slug = 'administrative'),
  'policy', 'RH',
  'published', 'internal', 5, '1.0',
  '', '', '',
  '[
    {"type":"section","title":"Tipos de Licença","children":[
      {"type":"table","headers":["Tipo","Dias/Ano","Aviso mínimo","Aprovação"],"rows":[
        ["Férias anuais","20 dias úteis","30 dias","Manager direto"],
        ["Licença médica","10 dias","N/A (atestado até 3 dias úteis depois)","RH"],
        ["Licença pessoal","5 dias","24h (exceto emergência)","Manager direto"],
        ["Licença por luto","3–5 dias","Assim que possível","RH + Manager"],
        ["Day off aniversário","1 dia","7 dias","Manager direto"]
      ]}
    ]},
    {"type":"section","title":"Como Solicitar","children":[
      {"type":"steps","title":"Processo de solicitação","items":[
        {"title":"Verificar disponibilidade","body":"Confirmar que o período não conflita com datas críticas do departamento."},
        {"title":"Notificar o manager","body":"Enviar mensagem no Slack ao manager direto com datas e motivo (quando aplicável)."},
        {"title":"Registrar no sistema","body":"Após aprovação verbal, registrar no calendário compartilhado da equipe e no sistema de RH."},
        {"title":"Handover","body":"Para ausências de 3+ dias: documentar o que está em andamento e designar responsável temporário."}
      ]},
      {"type":"infobox","variant":"warn","title":"Licença médica","content":"Atestado médico é obrigatório para ausências superiores a 2 dias consecutivos. Enviar para rh@movyeducation.com em até 3 dias úteis do retorno."}
    ]},
    {"type":"infobox","variant":"info","title":"Dúvidas?","content":"Entre em contato com o time de RH via rh@movyeducation.com ou no canal #rh no Slack."}
  ]'::jsonb
);
