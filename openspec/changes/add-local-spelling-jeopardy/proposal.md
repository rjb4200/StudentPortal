# Add Local Spelling Jeopardy Web App

## Why

Homeschool students need a simple, replayable spelling practice game that focuses on the current week's spelling list while continuing to review past words. The game should be easy for a parent to update weekly without needing to edit code.

## What Changes

- Build a local React web app for a spelling Jeopardy-style game.
- Support parent-managed spelling word lists.
- Allow importing new weekly words from CSV or copy/paste.
- Store all words locally in the browser.
- Generate Jeopardy boards using current-week words and past review words.
- Include categories such as:
  - This Week
  - Definitions
  - Missing Letters
  - Sentence Clues
  - Past Words
- Track score during a game.
- Mark used questions as completed.
- Run locally without requiring internet access after setup.

## Out of Scope

- Online accounts
- Cloud syncing
- Multiplayer over the internet
- Complex animations
- AI-generated questions
- Mobile-first design
- Database server

## Impact

- Adds a new React/Vite frontend app.
- Adds local word storage using browser localStorage.
- Adds CSV/copy-paste import workflow for parents.
- Creates a foundation for future games using the same spelling word database.
