## Context

The scheduling calendar has separate single-day and period-block cards, but both currently use the same reason state. The visible textarea appears only in the single-day card, leaving the period action without an obvious place to enter its student-visible reason.

## Goals / Non-Goals

**Goals:**
- Place an optional student-visible reason textarea inside the period-block card.
- Keep period and single-day reason values independent.

**Non-Goals:**
- Do not change range validation, storage, or the API contract.
- Do not make a reason required.

## Decisions

Use a dedicated period-reason state value and submit it in the existing range request. This prevents selected-date changes from replacing draft text for a period closure.

## Risks / Trade-offs

- [Two reason fields could be mistaken for the same value] → Label each field with the scope it applies to.
