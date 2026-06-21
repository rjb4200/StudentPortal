# Fix Quiz Media Fallback UI

## Why

GitHub issue #31 reports that quiz media can fail to load without enough handling for students. The current photo card displays a fallback after an image error, but the quiz still allows students to select failed media and submit an answer, which can force them to answer from missing visual information.

## What Changes

- Track quiz photo image load failures in `KnowledgeGate`.
- Disable selection for failed quiz photos.
- Block quiz submission while any current-rule photo has failed to load.
- Show clear student-facing guidance when media is unavailable.

## GitHub Issue

- Fixes #31: Bug: quiz media needs fallback UI

## Root Cause

`QuizPhotoCard` owns image error state locally and does not report failures to `KnowledgeGate`, so the parent quiz cannot prevent selection or submission when required media is missing.

## Proposed Solution

Add an optional image-error callback and disabled state to the photo card, then have `KnowledgeGate` maintain failed image IDs for the active rule and block submission until the media problem is resolved.

## Scope

- Student quiz media fallback behavior.
- Selection and submission behavior for failed media in the active quiz rule.

## Non-Goals

- No database or Supabase schema changes.
- No admin-side URL validation in this change.
- No redesign of quiz layout or scoring behavior.

## Risk Assessment

- Regression risk is low to moderate because the change is limited to quiz image failure state and selection/submission controls.
- The normal successful image path remains unchanged.

## Verification Plan

- Run `openspec validate fix-quiz-media-fallback-ui`.
- Run `npm run build`.
- Inspect the diff to confirm unavailable media cannot be selected or submitted.

## Rollback Plan

Revert the changes to `KnowledgeGate`, `QuizPhotoCard`, and the archived OpenSpec/spec updates.
