-- Migration 013: Add uniform footwear onboarding quiz rule
-- Adds a boot policy question to the photo-based onboarding quiz.

WITH inserted_rule AS (
  INSERT INTO public.quiz_rules (title, rule_text, instruction, sort_order, is_active)
  SELECT
    'Uniform Footwear: Boots and Socks',
    'When wearing uniform pants, students must wear boots. A polishable boot is acceptable as long as it is solid black. Tennis shoes are only permitted with authorized uniform shorts and must be all black and low cut. Any visible socks while in uniform must be solid black.',
    'Select every photo that is not in compliance with the uniform footwear standard.',
    60,
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.quiz_rules WHERE title = 'Uniform Footwear: Boots and Socks'
  )
  RETURNING id
), target_rule AS (
  SELECT id FROM inserted_rule
  UNION ALL
  SELECT id FROM public.quiz_rules WHERE title = 'Uniform Footwear: Boots and Socks'
  LIMIT 1
)
INSERT INTO public.quiz_photos (rule_id, label, image_url, is_non_compliant, reason, sort_order, is_active)
SELECT target_rule.id, photo.label, photo.image_url, photo.is_non_compliant, photo.reason, photo.sort_order, true
FROM target_rule
CROSS JOIN LATERAL (
  VALUES
    ('Solid black polishable boots with uniform pants', 'https://placehold.co/420x320/1f7a3f/white?text=Black+Boots', false, 'Boots are worn with uniform pants and are solid black and polishable.', 10),
    ('Brown work boots with uniform pants', 'https://placehold.co/420x320/9b1c1f/white?text=Brown+Boots', true, 'Boots worn with uniform pants must be solid black.', 20),
    ('Black low-cut tennis shoes with uniform pants', 'https://placehold.co/420x320/9b1c1f/white?text=Tennis+Shoes+Pants', true, 'Tennis shoes are only permitted with authorized shorts, not uniform pants.', 30),
    ('Black low-cut tennis shoes with authorized shorts', 'https://placehold.co/420x320/1f7a3f/white?text=Shoes+With+Shorts', false, 'All-black, low-cut tennis shoes are permitted with authorized uniform shorts.', 40),
    ('Visible white socks with uniform shoes', 'https://placehold.co/420x320/9b1c1f/white?text=Visible+White+Socks', true, 'Any visible sock while in uniform must be solid black.', 50),
    ('Visible solid black socks with uniform shoes', 'https://placehold.co/420x320/1f7a3f/white?text=Black+Socks', false, 'Visible socks are compliant when they are solid black.', 60)
) AS photo(label, image_url, is_non_compliant, reason, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.quiz_photos
  WHERE quiz_photos.rule_id = target_rule.id
    AND quiz_photos.label = photo.label
);
