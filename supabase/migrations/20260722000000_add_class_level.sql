ALTER TABLE public.training_classes
  ADD COLUMN IF NOT EXISTS level text,
  ADD CONSTRAINT training_classes_level_check
    CHECK (level IN ('First Responder', 'EMT', 'AEMT', 'Paramedic', 'Critical Care', 'Community Paramedic', 'Wilderness Paramedic'));
