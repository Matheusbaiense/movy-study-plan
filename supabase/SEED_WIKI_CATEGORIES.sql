-- Movy Internal Hub — Wiki Category Seed
-- Run once in Supabase SQL editor to populate departments + seed wiki article stubs
-- Based on Movy SOP (Bia's processes), excluding Admissions (not a real Movy process)

-- ─────────────────────────────────────────────────────────────
-- 1. Ensure departments exist with correct slugs & colors
-- ─────────────────────────────────────────────────────────────
INSERT INTO departments (slug, name_pt, name_en, name_es, color, icon, is_active, description_pt, description_en, description_es)
VALUES
  ('commercial',      'Comercial',       'Commercial',      'Comercial',       '#E72C03', '💼', true,
   'Gestão de parcerias, propostas comerciais e pipeline de vendas.',
   'Partnership management, commercial proposals and sales pipeline.',
   'Gestión de asociaciones, propuestas comerciales y pipeline de ventas.'),

  ('visa',            'Visa',            'Visa',            'Visa',            '#FF8B00', '🛂', true,
   'Processos migratórios, vistos estudantis e compliance regulatório.',
   'Migration processes, student visas and regulatory compliance.',
   'Procesos migratorios, visados estudiantiles y cumplimiento normativo.'),

  ('student-support', 'Student Support', 'Student Support', 'Student Support', '#057570', '🎓', true,
   'Suporte completo ao estudante desde a matrícula até a graduação.',
   'Full student support from enrollment through graduation.',
   'Soporte completo al estudiante desde la matrícula hasta la graduación.'),

  ('marketing',       'Marketing',       'Marketing',       'Marketing',       '#8B5CF6', '📣', true,
   'Campanhas, conteúdo, growth e brand da Movy.',
   'Campaigns, content, growth and Movy brand.',
   'Campañas, contenido, growth y marca Movy.'),

  ('technology',      'Tecnologia',      'Technology',      'Tecnología',      '#03182D', '⚙️', true,
   'Infraestrutura, integrações, automações e produto digital.',
   'Infrastructure, integrations, automation and digital product.',
   'Infraestructura, integraciones, automatizaciones y producto digital.')
ON CONFLICT (slug) DO UPDATE SET
  name_pt = EXCLUDED.name_pt,
  name_en = EXCLUDED.name_en,
  name_es = EXCLUDED.name_es,
  color   = EXCLUDED.color,
  icon    = EXCLUDED.icon,
  is_active = true,
  description_pt = EXCLUDED.description_pt,
  description_en = EXCLUDED.description_en,
  description_es = EXCLUDED.description_es;

-- ─────────────────────────────────────────────────────────────
-- 2. Seed wiki article stubs per Movy SOP process areas
-- ─────────────────────────────────────────────────────────────
-- NOTE: Replace <SUPER_ADMIN_USER_ID> with a real profile ID before running.
-- You can find it with: SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1;

DO $$
DECLARE
  v_commercial      uuid;
  v_visa            uuid;
  v_student_support uuid;
  v_marketing       uuid;
  v_technology      uuid;
  v_author          uuid;
BEGIN
  SELECT id INTO v_commercial      FROM departments WHERE slug = 'commercial';
  SELECT id INTO v_visa            FROM departments WHERE slug = 'visa';
  SELECT id INTO v_student_support FROM departments WHERE slug = 'student-support';
  SELECT id INTO v_marketing       FROM departments WHERE slug = 'marketing';
  SELECT id INTO v_technology      FROM departments WHERE slug = 'technology';
  -- Use first super_admin as stub author; replace if needed
  SELECT id INTO v_author          FROM profiles WHERE role = 'super_admin' LIMIT 1;

  -- COMMERCIAL processes (from Bia's SOP: Commercial section)
  INSERT INTO contents (slug, title_pt, title_en, body_pt, department_id, status, tags, created_by, updated_by)
  VALUES
    ('commercial-parceria-universidades', 'Parceria com Universidades', 'University Partnerships',
     '<p>Este artigo descreve o processo de captação e gestão de parcerias com universidades internacionais.</p><h2>Etapas</h2><ol><li>Identificação de universidades-alvo</li><li>Contato inicial e proposta</li><li>Negociação de termos</li><li>Formalização do acordo</li><li>Onboarding e monitoramento</li></ol>',
     v_commercial, 'draft', ARRAY['parceria','universidade','comercial'], v_author, v_author),

    ('commercial-proposta-comercial', 'Elaboração de Proposta Comercial', 'Commercial Proposal Process',
     '<p>Processo padrão para elaboração e envio de propostas comerciais a parceiros e estudantes.</p>',
     v_commercial, 'draft', ARRAY['proposta','comercial'], v_author, v_author),

    ('commercial-pipeline-crm', 'Gestão do Pipeline no Monday CRM', 'Monday CRM Pipeline Management',
     '<p>Como gerenciar o pipeline de vendas e leads no Monday.com.</p><h2>Boards utilizados</h2><ul><li>Leads Inbound</li><li>Propostas Enviadas</li><li>Contratos Fechados</li></ul>',
     v_commercial, 'draft', ARRAY['crm','monday','pipeline'], v_author, v_author),

    ('commercial-followup-leads', 'Follow-up de Leads', 'Lead Follow-up Process',
     '<p>Processo de acompanhamento de leads desde o primeiro contato até a conversão.</p>',
     v_commercial, 'draft', ARRAY['leads','followup','comercial'], v_author, v_author)
  ON CONFLICT (slug) DO NOTHING;

  -- VISA processes (from Bia's SOP: Visa section)
  INSERT INTO contents (slug, title_pt, title_en, body_pt, department_id, status, tags, created_by, updated_by)
  VALUES
    ('visa-visto-estudantil-australia', 'Processo de Visto Estudantil - Austrália', 'Student Visa Process - Australia',
     '<p>Guia completo do processo de solicitação do visto estudantil australiano (subclasse 500).</p><h2>Documentos necessários</h2><ul><li>CoE (Confirmation of Enrolment)</li><li>Comprovante de seguro saúde (OSHC)</li><li>Extrato bancário</li><li>Passaporte válido</li></ul>',
     v_visa, 'draft', ARRAY['visto','australia','estudante','coe'], v_author, v_author),

    ('visa-coe-emissao', 'Emissão de COE', 'COE Issuance Process',
     '<p>Processo para solicitar e acompanhar a emissão do Certificate of Enrolment (COE).</p>',
     v_visa, 'draft', ARRAY['coe','matricula','visto'], v_author, v_author),

    ('visa-oshc-seguro-saude', 'OSHC - Seguro Saúde Estudantil', 'OSHC - Overseas Student Health Cover',
     '<p>Como contratar e verificar o seguro saúde obrigatório para estudantes internacionais na Austrália.</p>',
     v_visa, 'draft', ARRAY['oshc','seguro','saude'], v_author, v_author),

    ('visa-compliance-migratorio', 'Compliance Migratório', 'Migration Compliance',
     '<p>Requisitos de compliance migratório que a Movy deve garantir para cada estudante.</p>',
     v_visa, 'draft', ARRAY['compliance','migratorio','regulatorio'], v_author, v_author)
  ON CONFLICT (slug) DO NOTHING;

  -- STUDENT SUPPORT processes (from Bia's SOP: Student Support section)
  INSERT INTO contents (slug, title_pt, title_en, body_pt, department_id, status, tags, created_by, updated_by)
  VALUES
    ('student-support-onboarding', 'Onboarding do Estudante', 'Student Onboarding',
     '<p>Processo de boas-vindas e integração do estudante após a confirmação da matrícula.</p><h2>Checklist</h2><ul><li>Confirmação de chegada</li><li>Orientação sobre moradia</li><li>Abertura de conta bancária</li><li>Registro no TFN</li></ul>',
     v_student_support, 'draft', ARRAY['onboarding','estudante','chegada'], v_author, v_author),

    ('student-support-moradia', 'Suporte à Moradia', 'Housing Support',
     '<p>Guia de opções de moradia para estudantes internacionais e como a Movy auxilia na busca.</p>',
     v_student_support, 'draft', ARRAY['moradia','acomodacao','estudante'], v_author, v_author),

    ('student-support-conta-bancaria', 'Abertura de Conta Bancária', 'Bank Account Opening',
     '<p>Passo a passo para abertura de conta bancária australiana para estudantes internacionais.</p>',
     v_student_support, 'draft', ARRAY['banco','conta','financeiro'], v_author, v_author),

    ('student-support-tfn-tax', 'TFN e Obrigações Fiscais', 'TFN and Tax Obligations',
     '<p>Como obter o Tax File Number (TFN) e entender as obrigações fiscais na Austrália.</p>',
     v_student_support, 'draft', ARRAY['tfn','tax','australia'], v_author, v_author),

    ('student-support-acompanhamento', 'Acompanhamento Acadêmico', 'Academic Follow-up',
     '<p>Processo de monitoramento do progresso acadêmico e suporte contínuo ao estudante.</p>',
     v_student_support, 'draft', ARRAY['academico','progresso','suporte'], v_author, v_author)
  ON CONFLICT (slug) DO NOTHING;

  -- MARKETING processes (from Bia's SOP: Processes / RH sections)
  INSERT INTO contents (slug, title_pt, title_en, body_pt, department_id, status, tags, created_by, updated_by)
  VALUES
    ('marketing-calendario-conteudo', 'Calendário de Conteúdo', 'Content Calendar',
     '<p>Como planejar e executar o calendário editorial de conteúdo da Movy.</p>',
     v_marketing, 'draft', ARRAY['conteudo','calendario','social'], v_author, v_author),

    ('marketing-gestao-redes-sociais', 'Gestão de Redes Sociais', 'Social Media Management',
     '<p>Processo de criação, aprovação e publicação de conteúdo nas redes sociais da Movy.</p>',
     v_marketing, 'draft', ARRAY['social','instagram','marketing'], v_author, v_author),

    ('marketing-campanhas-pagas', 'Campanhas Pagas (Meta / Google)', 'Paid Campaigns (Meta / Google)',
     '<p>Processo de criação e gestão de campanhas de tráfego pago.</p>',
     v_marketing, 'draft', ARRAY['ads','meta','google','trafego'], v_author, v_author)
  ON CONFLICT (slug) DO NOTHING;

  -- TECHNOLOGY & RH processes
  INSERT INTO contents (slug, title_pt, title_en, body_pt, department_id, status, tags, created_by, updated_by)
  VALUES
    ('technology-monday-automacoes', 'Automações no Monday.com', 'Monday.com Automations',
     '<p>Guia das automações configuradas no Monday.com e como mantê-las.</p>',
     v_technology, 'draft', ARRAY['monday','automacao','crm'], v_author, v_author),

    ('technology-onboarding-colaboradores', 'Onboarding de Colaboradores', 'Employee Onboarding',
     '<p>Processo de integração de novos colaboradores: ferramentas, acessos e treinamentos.</p>',
     v_technology, 'draft', ARRAY['rh','onboarding','colaborador'], v_author, v_author),

    ('technology-offboarding', 'Offboarding de Colaboradores', 'Employee Offboarding',
     '<p>Checklist e processo de desligamento de colaboradores.</p>',
     v_technology, 'draft', ARRAY['rh','offboarding','colaborador'], v_author, v_author)
  ON CONFLICT (slug) DO NOTHING;

END $$;
