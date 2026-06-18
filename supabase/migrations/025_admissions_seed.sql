-- 025_admissions_seed.sql — Seed of admissions instructions per school.
-- Generated from "ADMISSIONS PER SCHOOL (2).xlsx" by scripts/parse-admissions-xlsx.mjs,
-- then hand-normalized for sheets with merged/irregular cells.
-- Idempotent: resolves/creates the institution, upserts the admissions record + credential.
do $$
declare
  v_org  uuid := '11111111-1111-4111-8111-111111111111';
  v_inst uuid;
  v_adm  uuid;
begin

  -- Academies Aus → Academies Australasia
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Academies Australasia') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Academies Australasia', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Application Form","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - if applicable (school will analyse if needed)","tags":[]}]'::jsonb, '[]'::jsonb, 'Translations can be completed by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Send the application by email to Language Links')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- ACMI → ACMI
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('ACMI') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'ACMI', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, 'https://acmi.wa.edu.au/easy-apply.html', array['english','he']::text[], '[{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]}]'::jsonb, '[]'::jsonb, 'Translations can be completed by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
24 to 48 Hours')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- AILFE → AILFE
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('AILFE') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'AILFE', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Application Form","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"Financial Proof","tags":[]},{"label":"GTE - requested by school (mandatory)","tags":[]},{"label":"Send the application by email","tags":[]}]'::jsonb, '[]'::jsonb, 'Translations can be completed by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Package: enrolments have to be done separately
Offer letter signature must be the same as the passport, suggest student to come to the office or print, sign and scan the offer letter')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- AIWT → AIWT
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('AIWT') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'AIWT', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Application Form","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GS - if applicable (school will analyse if needed)","tags":[]}]'::jsonb, '[{"email":"futurestudents@aiwt.edu.au"},{"name":"whatsapp assistance - 0452577565"}]'::jsonb, 'Translations can be completed by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Send the application by email
Package: enrolments have to be done separately')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- APSI → APSI
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('APSI') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'APSI', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, 'Package: enrolments have to be done separately', null, array['english','he']::text[], '[{"label":"Application Link","tags":[]},{"label":"Apolice OSHC current","tags":[]},{"label":"USI Number","tags":[]},{"label":"Curriculo","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - if applicable (school will analyse if needed)","tags":[]},{"label":"Family Form - requested by school (mandatory)","tags":["couple"]}]'::jsonb, '[{"email":"info@apsi.edu.au"},{"name":"Aliny"},{"name":"whatsapp - 470 324 106","email":"aliny.conceicio@apsi.edu.au"}]'::jsonb, 'Translations can be completed by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Curtin College → Curtin College
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Curtin College') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Curtin College', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, 'DIRECT ENTRY (NO PACKAGE)', null, array['english']::text[], '[{"label":"Passport","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Award and Transcript","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"If couple ou family, all passports, visas, marriage certificate and birth certificate [original and translations]","tags":["visa","couple"]}]'::jsonb, '[{"name":"Admissions Manager","role":"admissions","email":"Marilia.fernandes@curtincollege.edu.au"},{"name":"Marketing Manager","role":"marketing","email":"Camila.Cuellar@curtincollege.edu.au"}]'::jsonb, 'Translations must be NAATI or made by sworn tranlastors
Awards and Transcripts must be certified by Movy (original documents and translations)
Passport must be certified by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
To get COE it is necessary send the OSHC policy')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Curtin University → Curtin University
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Curtin University') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Curtin University', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Passport","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Award and Transcript","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"If couple ou family, all passports, visas, marriage certificate and birth certificate [original and translations]","tags":["visa","couple"]},{"label":"GTE","tags":[]},{"label":"Financial Form","tags":[]},{"label":"Please send all the documenttion to the Provider","tags":[]}]'::jsonb, '[]'::jsonb, 'The Application must be sent by the Provider
Translations must be NAATI or made by sworn tranlastors
Awards and Transcripts must be certified by Movy (original documents and translations)
Passport must be certified by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
English Test must be requested by ask international (Curtin Portal)
Package - english provider does the app and COE paid direclty to approved partner provider (check with provider first)
To get COE it is necessary send the OSHC policy
15 Business Days (3 weeks)
Begonia Sanchez')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- ECU → ECU
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('ECU') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'ECU', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Passport","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate and transcript or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"If couple ou family, all passports, visas, marriage certificate and birth certificate [original and translations]","tags":["visa","couple"]},{"label":"GTE - if applicable (school will analyse if needed)","tags":[]},{"label":"S.O.P - not mandatory but I usually send (letter)","tags":[]}]'::jsonb, '[{"email":"enquiries@ecu.edu.au"},{"name":"Karen Rancon","email":"k.rinconfitzgerald@ecu.edu.au"}]'::jsonb, 'Translations must be NAATI or juramentada
Awards and Transcripts must be certified by Movy (original documents and translations)
Passport must be certified by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
COE paid direclty to approved partner provider
10 business day
5 business day for the CoE')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- EIT → EIT
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('EIT') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'EIT', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Passport (certified by Movy)","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate and transcript or higher completed degree (certified by Movy)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]}]'::jsonb, '[]'::jsonb, 'Translations must be NAATI or juramentada
Awards and Transcripts must be certified by Movy (original documents and translations)
Passport must be certified by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
COE paid direclty to approved partner provider
10 business day
5 business day for the CoE')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Empyrean → Empyrean
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Empyrean') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Empyrean', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, 'Package: enrolments have to be done separately', null, array['english','he']::text[], '[{"label":"Application Link","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - havent requested so far","tags":[]}]'::jsonb, '[{"name":"Tanya"},{"email":"Admissions@eei.wa.edu.au","phone":"(08) 9228 1600"}]'::jsonb, 'Translations can be completed by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Greenwich → Greenwich College
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Greenwich College') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Greenwich College', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Application form","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - requested by school (mandatory)","tags":[]}]'::jsonb, '[{"email":"admissions@greenwichcollege.com.au"},{"name":"Joao Felipe","role":"comercial","email":"joao.meira@greenwichcollege.edu.au","phone":"415 797 816"}]'::jsonb, 'Translations can be completed by Movy (certified)
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Package: enrolments have to be done separately')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- ILSCGreystone → ILSC
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('ILSC') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'ILSC', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','vet','he']::text[], '[{"label":"Application Form","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - if applicable (scholl will analyse if is needed)","tags":[]}]'::jsonb, '[]'::jsonb, 'Translations can be completed by Movy (certified)
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Package: enrolments have to be done separately
The offer letter signing date must be before or same date of payment')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Kaplan Business School → Kaplan Business School
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Kaplan Business School') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Kaplan Business School', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree - Degree award certificate","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"SOP - requested by school - carta em pdf (mandatory)","tags":[]},{"label":"Passport","tags":[]},{"label":"Marriage Certificate (original and translated)","tags":["couple"]}]'::jsonb, '[{"email":"kbs.admissions@kbs.edu.au"},{"name":"Marcela Duarte","role":"marketing","email":"marcela.duarte1@kbs.edu.au","phone":"400 807 655"}]'::jsonb, 'Translations must be NAATI certified or juramentado
Kaplan English test must be requested to admissions team by email (KTE Test) - if required
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Package: enrolments have to be done separately. Obtain the package offer letter before sending the application to Kaplan')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- KCBT → KCBT
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('KCBT') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'KCBT', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, 'https://kcbt.edu.au/register/', array['english','he']::text[], '[{"label":"Application Form - online","tags":[]},{"label":"Passport","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - havent requested so far","tags":[]}]'::jsonb, '[]'::jsonb, 'Translations can be completed by Movy (certified)
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Package: enrolments have to be done separately
Timeframe to receive the Offer Letter and CoE: Onshore (2-3 days), Offshore (5 days)')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Language Links → Language Links
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Language Links') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Language Links', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english']::text[], '[{"label":"Application Form","tags":[]},{"label":"Passport","tags":[]},{"label":"All Visa (if onshore)","tags":["visa"]},{"label":"All COEs (if onshore)","tags":["all"]},{"label":"Evidence of English language proficiency if the student does not have one (if applicable)","tags":["english"]},{"label":"GTE - if applicable (school will analyse if needed)","tags":[]}]'::jsonb, '[{"email":"admissions@languagelinks.wa.edu.au"},{"name":"Juan and marketing team","role":"marketing","email":"santiago@languagelinks.wa.edu.au","phone":"494 138 656"}]'::jsonb, 'If canceling course ou requesting deferral, send the forms
Book english test via LL site (online)')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Lexis → Lexis
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Lexis') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Lexis', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','vet','he']::text[], '[{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - if applicable (school will analyse if needed)","tags":[]}]'::jsonb, '[{"email":"registrations@lexisenglish.com"},{"name":"Priscila Campos","role":"marketing","email":"pcampos@lexisenglish.com","phone":"55 19 99769 165"},{"name":"Lizandra Muraca","role":"comercial","email":"lmuraca@lexisenglish.com","phone":"412 755 063"},{"name":"Jason","role":"admissions","phone":"0466870537"}]'::jsonb, 'Translations can be completed by Movy
Admissions Team handle both the english and VET app (same email)
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Package: enrolments have to be done separately')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Milner → Milner
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Milner') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Milner', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english']::text[], '[{"label":"Application Form","tags":[]},{"label":"Passport","tags":[]},{"label":"All Visa (if onshore)","tags":["visa"]},{"label":"All COEs (if onshore)","tags":["all"]},{"label":"Evidence of English language proficiency if the student does not have one (if applicable)","tags":["english"]},{"label":"GTE - if applicable (school will analyse if needed)","tags":[]}]'::jsonb, '[{"email":"admissions@milner.wa.edu.au"},{"name":"Rayemberg","phone":"481 190 559"}]'::jsonb, 'There is no requirements
Onshore and Offshore 24/48 Hours')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Murdoch → Murdoch University
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Murdoch University') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Murdoch University', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, 'DIRECT ENTRY (NO PACKAGE) AND WITH APPROVED PROVIDER', null, array['english','he']::text[], '[{"label":"Passport","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GS Stage 1 (mandatory)","tags":[]},{"label":"S.O.P - not mandatory but I usually send (letter)","tags":[]}]'::jsonb, '[{"email":"international.admissions@murdoch.edu.au"},{"name":"Conor","email":"Conor.Murphy@murdoch.edu.au","phone":"418 613 568"}]'::jsonb, 'Translations must be NAATI or juramentada
Awards and Transcripts must be certified by Movy (original documents and translations)
Passport must be certified by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
COE paid direclty to approved partner provider
To get COE it is necessary the OSHC policy
10 business day / 5 business day for the CoE')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Navitas → Navitas
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Navitas') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Navitas', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english']::text[], '[{"label":"Form for enrolment","tags":[]},{"label":"Passport","tags":[]},{"label":"All Visa (if onshore)","tags":["visa"]},{"label":"All COEs (if onshore)","tags":["all"]},{"label":"All Australians certificates","tags":[]},{"label":"Financial Proof","tags":[]},{"label":"GTE (mandatory)","tags":[]}]'::jsonb, '[{"email":"admissions@navitasenglish.com"},{"name":"Camila Sa","email":"Camila.deSa@navitas.com","phone":"482 188 519"}]'::jsonb, 'Can request finacial proof but it depends on their analyses
All students must take the OPT (english test). Rules vary for offshore/onshore. All materials available in the school folder.')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- NIT → NIT Australia
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('NIT Australia') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'NIT Australia', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - havent requested so far","tags":[]}]'::jsonb, '[{"name":"Stella","email":"admissions@nitaustralia.edu.au","phone":"452 579 891"}]'::jsonb, 'Translations can be completed by Movy
Package: enrolments have to be done separately')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- PICE → PICE
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('PICE') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'PICE', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english']::text[], '[{"label":"Form for enrolment","tags":[]},{"label":"All Visa (if onshore)","tags":["visa"]},{"label":"All COEs (if onshore)","tags":["all"]},{"label":"GTE - havent requested so far","tags":[]}]'::jsonb, '[{"name":"Trish LUCA","email":"info@pice.com.au","phone":"8 9221 2295"}]'::jsonb, null)
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- PCBT → PCBT
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('PCBT') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'PCBT', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english']::text[], '[{"label":"Form for enrolment","tags":[]},{"label":"Passport","tags":[]},{"label":"All Visa (if onshore)","tags":["visa"]},{"label":"All COEs (if onshore)","tags":["all"]}]'::jsonb, '[{"email":"admissions@pcbt.wa.edu.au"},{"name":"Sabeen"},{"name":"Marketing Manager","role":"marketing","email":"marketing@pcbt.wa.edu.au","phone":"420 329 380"}]'::jsonb, null)
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Phoenix → Phoenix
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Phoenix') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Phoenix', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english']::text[], '[{"label":"Form for enrolment","tags":[]},{"label":"Passport","tags":[]},{"label":"All Visa (if onshore)","tags":["visa"]},{"label":"All COEs (if onshore)","tags":["all"]},{"label":"GTE - havent requested so far","tags":[]}]'::jsonb, '[{"email":"admissions@phoenix.wa.edu.au"},{"phone":"(08) 9235 6000"}]'::jsonb, 'Send the application by email
Onshore and Offshore 48 Hours')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Stanley → Stanley College
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Stanley College') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Stanley College', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, 'Package: enrolments have to be done separately', 'https://highereducation.formstack.com/forms/gst_form', array['english','he']::text[], '[{"label":"Application Link","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE (mandatory)","tags":[]},{"label":"Financial Form - if applicable (school will analyse if needed)","tags":[]},{"label":"Credit Transfer Form - if applicable","tags":[]}]'::jsonb, '[{"email":"admissions2@stanleycollege.edu.au"},{"name":"Gabriela Reis","phone":"414 833 555","email":"gabriela.reis@stanleycollege.edu.au"}]'::jsonb, 'Translations can be completed by Movy
If the student needs a differente payment plan, they need to request it directly to the school (payment plan is fixed)
Higher Education must be applied via paper form')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- SAI → Skills Australia Institute (SAI)
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Skills Australia Institute (SAI)') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Skills Australia Institute (SAI)', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, 'Package: enrolments have to be done separately', null, array['english','he']::text[], '[{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - havent requested so far","tags":[]}]'::jsonb, '[{"email":"admissions@skillsaustralia.edu.au"},{"name":"Yelim","email":"yelim.kim@skillsaustralia.edu.au","phone":"410 001 429"}]'::jsonb, 'Translations can be completed by Movy
Academic Requirements may vary depending on each course, please check the course requirements at the school website
Students need to complete the Digital Literacy Test (school will send directly to student)')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- Stotts → Stotts
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('Stotts') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'Stotts', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Application Link","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - if applicable (school will analyse if is needed)","tags":[]},{"label":"S.O.P - if applicable (school will analyse if is needed)","tags":[]}]'::jsonb, '[]'::jsonb, 'Awards and Transcripts must be certified by Movy (original documents and translations)')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- TAFE WA → TAFE WA
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('TAFE WA') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'TAFE WA', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, null, null, array['english','he']::text[], '[{"label":"Application Link with all the details","tags":[]},{"label":"Passport (main applicant)","tags":[]},{"label":"All COEs","tags":["all"]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree (depends on level of study)","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"GTE - if applicable (school will analyse if needed)","tags":[]}]'::jsonb, '[{"email":"Admissions.TIWA@dtwd.wa.gov.au"},{"name":"Michael","email":"Michael.Ingram@dtwd.wa.gov.au","phone":"439 634 232"}]'::jsonb, 'Translations can be completed by Movy - 2 Business Days
Awards and Transcripts must be certified by Movy (original documents and translations)
Packages with English schools: send TAFE the English offer letter and request $500 first deposit in the application')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

  -- WAIFS → WAIFS
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower('WAIFS') and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, 'WAIFS', 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, 'Package: enrolments have to be done separately', null, array['english','he']::text[], '[{"label":"Application Form","tags":[]},{"label":"Evidence of English language proficiency if the student does not have one.","tags":["english"]},{"label":"Year 12 certificate or higher completed degree","tags":[]},{"label":"If package with English School (send offer letter from English School)","tags":["package","english"]},{"label":"Certificate for all courses the student has done in Australia","tags":[]},{"label":"USI Transcript","tags":[]}]'::jsonb, '[{"email":"Admissions@waifs.wa.edu.au"},{"name":"Jenny","phone":"08 6200 6200"}]'::jsonb, 'Translations can be completed by Movy')
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;

end $$;
