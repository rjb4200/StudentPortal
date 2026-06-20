ALTER TABLE registration_fields ADD CONSTRAINT ck_registration_fields_field_type
  CHECK (field_type IN ('text', 'email', 'tel', 'textarea', 'select'));

ALTER TABLE students ADD CONSTRAINT ck_students_phone_length
  CHECK (phone IS NULL OR length(phone) <= 30);

ALTER TABLE evaluations ADD CONSTRAINT ck_evaluations_comments_length
  CHECK (comments IS NULL OR length(comments) <= 5000);
