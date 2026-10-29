## Context

The registration page stores validation messages by schema path but currently renders only message text.

## Goals / Non-Goals

**Goals:** Present readable field labels and remove duplicate feedback.

**Non-Goals:** Change validation rules or registration payloads.

## Decisions

Map known schema paths to the public form labels in the registration page. Fall back to a readable path when a new schema field is not mapped.

## Risks / Trade-offs

- New fields can lack a label mapping → the path-derived fallback still identifies the affected field.
