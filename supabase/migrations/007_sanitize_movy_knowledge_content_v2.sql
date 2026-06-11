-- Remove sensitive/legacy text from already-imported knowledge content.

update public.contents
set
  body_pt = regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          coalesce(body_pt, ''),
          'legacy' || '-sop',
          'knowledge-sop',
          'g'
        ),
        '<span class="cn">[^<]*Login:[^<]*</span>',
        '<span class="cn">Link a adicionar</span>',
        'g'
      ),
      '<strong>Pagamento na conta da [^<]*</strong>.*<strong>TERMOS & CONDI[^<]* Movy</strong>',
      '<strong>Pagamento:</strong><span class="lnk">Dados bancários: Link a adicionar</span> <strong>TERMOS & CONDIÇÕES Movy</strong>',
      'g'
    ),
    '<div class="box info"><strong>[^<]*DADOS BANC[^<]* DA Movy</strong>[^<]*</div>',
    '<div class="box info"><strong>DADOS BANCÁRIOS</strong>Link a adicionar.</div>',
    'g'
  ),
  updated_at = now()
where
  coalesce(body_pt, '') like ('%legacy' || '-sop%')
  or coalesce(body_pt, '') like '%Login:%'
  or coalesce(body_pt, '') like '%Pagamento na conta da%'
  or coalesce(body_pt, '') like '%DADOS BANC% DA Movy%';
