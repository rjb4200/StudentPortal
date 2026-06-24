# Spelling Jeopardy Spec

## ADDED Requirements

### Requirement: Local React Web App

The system SHALL provide a React-based spelling Jeopardy game that runs locally in a browser.

#### Scenario: Run locally

Given the app has been installed  
When the parent starts the development server or opens the built app  
Then the game shall run on the local PC without requiring a hosted backend.

---

### Requirement: Parent Word Management

The system SHALL allow a parent to add and manage spelling words.

#### Scenario: Add weekly word

Given the parent is on the word manager screen  
When the parent enters a word and week number  
Then the system shall save the word locally.

#### Scenario: Import words

Given the parent has a CSV or copied spreadsheet text  
When the parent imports the list  
Then the system shall add the words to local storage.

---

### Requirement: Preserve Past Words

The system SHALL retain words from previous weeks unless the parent deletes them.

#### Scenario: Add new week

Given Week 1 words already exist  
When the parent imports Week 2 words  
Then Week 1 words shall remain available for review.

---

### Requirement: Generate Jeopardy Board

The system SHALL generate a Jeopardy-style board using spelling words.

#### Scenario: Start game

Given stored spelling words exist  
When the player starts a new game  
Then the system shall display a board with categories and point-value tiles.

---

### Requirement: Use Current and Past Words

The system SHALL prioritize the current week's words while including past review words.

#### Scenario: Current week practice

Given the current week is set to 5  
When the board is generated  
Then most questions shall use Week 5 words.

#### Scenario: Past word review

Given words exist from Weeks 1 through 4  
When the board is generated  
Then at least one category shall include past words.

---

### Requirement: Answer Checking

The system SHALL check typed answers against the correct spelling word.

#### Scenario: Correct answer

Given the correct answer is "rescue"  
When the player types "Rescue"  
Then the system shall mark the answer correct.

#### Scenario: Incorrect answer

Given the correct answer is "rescue"  
When the player types "resque"  
Then the system shall mark the answer incorrect and show the correct spelling.

---

### Requirement: Score Tracking

The system SHALL track the player's score during a game.

#### Scenario: Award points

Given a tile is worth 300 points  
When the player answers correctly  
Then the system shall add 300 points to the score.

#### Scenario: Incorrect answer

Given a tile is worth 300 points  
When the player answers incorrectly  
Then the system shall not add points.

---

### Requirement: Completed Tiles

The system SHALL prevent already-used Jeopardy tiles from being reused in the same game.

#### Scenario: Tile completed

Given the player has answered a tile  
When the board is shown again  
Then the tile shall appear completed and shall not open again.
