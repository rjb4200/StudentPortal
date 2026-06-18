-- Migration 011: Clean sort_order duplicates & add UNIQUE constraints
-- Fixes issue #46: admin field reorder logic can create confusing sort order

begin;

-- 1. Reassign all sort_order values to clean multiples of 10

-- Global tables: no scope, just order by existing sort_order
with numbered as (
  select id, (row_number() over (order by sort_order, created_at)) * 10 as new_order
  from registration_fields
)
update registration_fields
set sort_order = numbered.new_order
from numbered
where registration_fields.id = numbered.id;

with numbered as (
  select id, (row_number() over (order by sort_order, created_at)) * 10 as new_order
  from quiz_rules
)
update quiz_rules
set sort_order = numbered.new_order
from numbered
where quiz_rules.id = numbered.id;

with numbered as (
  select id, (row_number() over (order by sort_order, created_at)) * 10 as new_order
  from legal_documents
)
update legal_documents
set sort_order = numbered.new_order
from numbered
where legal_documents.id = numbered.id;

with numbered as (
  select id, (row_number() over (order by sort_order, created_at)) * 10 as new_order
  from resource_categories
)
update resource_categories
set sort_order = numbered.new_order
from numbered
where resource_categories.id = numbered.id;

-- Scoped tables: reassign within each parent group
with numbered as (
  select id, (row_number() over (partition by rule_id order by sort_order, created_at)) * 10 as new_order
  from quiz_photos
)
update quiz_photos
set sort_order = numbered.new_order
from numbered
where quiz_photos.id = numbered.id;

with numbered as (
  select id, (row_number() over (partition by category_id order by sort_order, created_at)) * 10 as new_order
  from resource_documents
)
update resource_documents
set sort_order = numbered.new_order
from numbered
where resource_documents.id = numbered.id;

-- 2. Add UNIQUE constraints

-- Global scope
alter table registration_fields add constraint uq_registration_fields_sort_order unique (sort_order);
alter table quiz_rules add constraint uq_quiz_rules_sort_order unique (sort_order);
alter table legal_documents add constraint uq_legal_documents_sort_order unique (sort_order);
alter table resource_categories add constraint uq_resource_categories_sort_order unique (sort_order);

-- Scoped: per-rule for quiz_photos, per-category for resource_documents
alter table quiz_photos add constraint uq_quiz_photos_rule_sort_order unique (rule_id, sort_order);
alter table resource_documents add constraint uq_resource_documents_cat_sort_order unique (category_id, sort_order);

commit;
