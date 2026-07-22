-- Backfill: create calendar_feeds rows for all certified students without one
INSERT INTO public.calendar_feeds (feed_type, entity_id, token, generated_at, created_at)
SELECT 'student', s.id, gen_random_uuid(), now(), now()
FROM public.students s
WHERE s.status = 'certified'
  AND NOT EXISTS (SELECT 1 FROM public.calendar_feeds cf WHERE cf.feed_type = 'student' AND cf.entity_id = s.id);

-- Backfill: create aggregate row if missing
INSERT INTO public.calendar_feeds (feed_type, entity_id, token, generated_at, created_at)
SELECT 'aggregate', NULL, gen_random_uuid(), now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.calendar_feeds WHERE feed_type = 'aggregate' AND entity_id IS NULL);
