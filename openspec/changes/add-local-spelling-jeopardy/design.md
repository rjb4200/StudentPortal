# Design: Local Spelling Jeopardy

## Technology

Use:

- React
- Vite
- Plain CSS
- localStorage
- PapaParse or simple CSV parser

## App Screens

### 1. Game Board

Displays a Jeopardy-style board with categories and point tiles.

Example categories:

- This Week
- Definitions
- Missing Letters
- Sentence Clues
- Past Words

### 2. Question Modal

When a tile is selected, show:

- Point value
- Prompt
- Answer input
- Check Answer button
- Correct/incorrect feedback

### 3. Parent Word Manager

Allows the parent to:

- Add a word manually
- Import CSV text
- Select current week
- View all stored words
- Delete or edit words

## Data Model

Each spelling word should use this structure:

```ts
type SpellingWord = {
  id: string;
  word: string;
  week: number;
  definition?: string;
  sentence?: string;
  hint?: string;
  partOfSpeech?: string;
  difficulty?: 100 | 200 | 300 | 400 | 500;
  masteredCount?: number;
  missedCount?: number;
};
```

## Game Generation Rules

The game shall generate a 5x5 board.

Current-week words should be favored.

Recommended mix:

- 60% current week
- 40% past words

The Past Words category should only use words from earlier weeks.

## Local Storage Keys

```text
spellingWords
currentWeek
```

## Answer Checking

Initial answer checking should be exact spelling match after trimming spaces and ignoring capitalization.

Example:

```text
"Rescue" = "rescue"
" rescue " = "rescue"
"resque" = incorrect
```

## Future Extensions

- Sound effects
- Printable word reports
- Student profiles
- Review mode for missed words
- Word Fishing game using the same word database
