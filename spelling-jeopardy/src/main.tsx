import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

type Difficulty = 100 | 200 | 300 | 400 | 500;

type SpellingWord = {
  id: string;
  word: string;
  week: number;
  definition?: string;
  sentence?: string;
  hint?: string;
  partOfSpeech?: string;
  difficulty?: Difficulty;
  masteredCount?: number;
  missedCount?: number;
};

type CategoryId = "this-week" | "definitions" | "missing" | "sentences" | "past";

type Category = {
  id: CategoryId;
  name: string;
};

type Tile = {
  id: string;
  category: Category;
  points: Difficulty;
  word: SpellingWord;
  prompt: string;
  answer: string;
  completed: boolean;
};

const WORDS_KEY = "spellingWords";
const WEEK_KEY = "currentWeek";
const HISTORY_KEY = "gameHistory";
const POINTS: Difficulty[] = [100, 200, 300, 400, 500];
const CATEGORIES: Category[] = [
  { id: "this-week", name: "This Week" },
  { id: "definitions", name: "Definitions" },
  { id: "missing", name: "Missing Letters" },
  { id: "sentences", name: "Sentence Clues" },
  { id: "past", name: "Past Words" },
];

const sampleWords: SpellingWord[] = [
  { id: "sample-1", word: "rescue", week: 1, definition: "To save from danger.", sentence: "The firefighter helped rescue the kitten.", hint: "Starts with r", difficulty: 100 },
  { id: "sample-2", word: "journey", week: 1, definition: "A trip from one place to another.", sentence: "Our journey took three days.", hint: "Has our in the middle", difficulty: 200 },
  { id: "sample-3", word: "neighbor", week: 1, definition: "A person who lives nearby.", sentence: "My neighbor waters our plants.", hint: "Contains eigh", difficulty: 300 },
  { id: "sample-4", word: "library", week: 1, definition: "A place where books are kept.", sentence: "We visited the library after lunch.", hint: "Ends with ary", difficulty: 400 },
  { id: "sample-5", word: "courage", week: 1, definition: "Bravery when facing fear.", sentence: "She showed courage during the storm.", hint: "Starts with cou", difficulty: 500 },
  { id: "sample-6", word: "lantern", week: 2, definition: "A portable light with a cover.", sentence: "The lantern glowed on the porch.", hint: "Two syllables", difficulty: 100 },
  { id: "sample-7", word: "harvest", week: 2, definition: "The gathering of crops.", sentence: "Farmers harvest corn in the fall.", hint: "Starts with har", difficulty: 200 },
  { id: "sample-8", word: "blanket", week: 2, definition: "A warm bed covering.", sentence: "The blanket was soft and blue.", hint: "Starts with bl", difficulty: 300 },
  { id: "sample-9", word: "promise", week: 2, definition: "A statement that you will do something.", sentence: "I made a promise to help.", hint: "Ends with ise", difficulty: 400 },
  { id: "sample-10", word: "weather", week: 2, definition: "Outdoor conditions like rain or sun.", sentence: "The weather changed quickly.", hint: "Contains ea", difficulty: 500 },
  { id: "sample-11", word: "planet", week: 3, definition: "A large object that orbits a star.", sentence: "Earth is a planet.", hint: "Starts with pl", difficulty: 100 },
  { id: "sample-12", word: "whisper", week: 3, definition: "To speak very softly.", sentence: "Please whisper in the museum.", hint: "Starts with wh", difficulty: 200 },
  { id: "sample-13", word: "captain", week: 3, definition: "The leader of a team, ship, or group.", sentence: "The captain guided the ship.", hint: "Contains ai", difficulty: 300 },
  { id: "sample-14", word: "machine", week: 3, definition: "A device with moving parts.", sentence: "The machine sorted the mail.", hint: "Ends with ine", difficulty: 400 },
  { id: "sample-15", word: "treasure", week: 3, definition: "Something valuable or special.", sentence: "The map led to treasure.", hint: "Contains sure", difficulty: 500 },
];

function readStoredWords(): SpellingWord[] {
  return readJson(WORDS_KEY, sampleWords);
}

function saveStoredWords(words: SpellingWord[]) {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

function readCurrentWeek() {
  return readJson(WEEK_KEY, 3);
}

function saveCurrentWeek(week: number) {
  localStorage.setItem(WEEK_KEY, JSON.stringify(week));
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeMissingLetters(word: string) {
  return word
    .split("")
    .map((letter, index) => (index % 2 === 0 || letter.length === 1 && "aeiou".includes(letter.toLowerCase()) ? "_" : letter))
    .join(" ");
}

function parseImportText(text: string, defaultWeek: number): SpellingWord[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\t|,/).map((part) => part.trim()))
    .map(([word, week, definition, sentence, hint]) => ({
      id: createId(),
      word: word ?? "",
      week: Number(week) || defaultWeek,
      definition,
      sentence,
      hint,
    }))
    .filter((entry) => entry.word && Number.isInteger(entry.week) && entry.week > 0);
}

function weightedPool(words: SpellingWord[]) {
  return words.flatMap((word) => Array(Math.max(1, 1 + (word.missedCount ?? 0) - Math.floor((word.masteredCount ?? 0) / 2))).fill(word));
}

function pickWord(words: SpellingWord[], fallback: SpellingWord[], usedIds: Set<string>) {
  const fresh = words.filter((word) => !usedIds.has(word.id));
  const source = fresh.length > 0 ? fresh : fallback;
  const pool = weightedPool(source.length > 0 ? source : sampleWords);
  return pool[Math.floor(Math.random() * pool.length)];
}

function makePrompt(categoryId: CategoryId, word: SpellingWord) {
  if (categoryId === "definitions") {
    return word.definition ? `Spell the word that means: ${word.definition}` : `Spell this word from the hint: ${word.hint ?? word.partOfSpeech ?? "No hint provided."}`;
  }
  if (categoryId === "missing") {
    return `Fill in the missing letters: ${makeMissingLetters(word.word)}`;
  }
  if (categoryId === "sentences") {
    return word.sentence ? `Spell the missing word: ${word.sentence.replace(new RegExp(word.word, "i"), "_____")}` : `Spell the word that fits this hint: ${word.hint ?? word.definition ?? "No clue provided."}`;
  }
  if (categoryId === "past") {
    return `Review word from Week ${word.week}: ${word.definition ?? word.hint ?? "Spell this past word from memory."}`;
  }
  return `Spell this Week ${word.week} word: ${word.hint ?? word.definition ?? "Listen to your parent read the word aloud."}`;
}

function generateBoard(words: SpellingWord[], currentWeek: number): Tile[] {
  const current = words.filter((word) => word.week === currentWeek);
  const past = words.filter((word) => word.week < currentWeek);
  const all = words.length > 0 ? words : sampleWords;
  const usedIds = new Set<string>();

  return CATEGORIES.flatMap((category) =>
    POINTS.map((points) => {
      const preferred = category.id === "past" ? past : Math.random() < 0.6 ? current : past;
      const fallback = category.id === "past" ? past : all;
      const word = pickWord(preferred, fallback, usedIds);
      usedIds.add(word.id);

      return {
        id: `${category.id}-${points}-${createId()}`,
        category,
        points,
        word,
        prompt: makePrompt(category.id, word),
        answer: word.word,
        completed: false,
      };
    }),
  );
}

function App() {
  const [words, setWords] = React.useState<SpellingWord[]>(readStoredWords);
  const [currentWeek, setCurrentWeek] = React.useState(readCurrentWeek);
  const [tiles, setTiles] = React.useState<Tile[]>(() => generateBoard(readStoredWords(), readCurrentWeek()));
  const [score, setScore] = React.useState(0);
  const [selectedTile, setSelectedTile] = React.useState<Tile | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [feedback, setFeedback] = React.useState<"correct" | "incorrect" | null>(null);
  const [form, setForm] = React.useState({ word: "", week: String(currentWeek), definition: "", sentence: "", hint: "" });
  const [importText, setImportText] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    saveStoredWords(words);
  }, [words]);

  React.useEffect(() => {
    saveCurrentWeek(currentWeek);
  }, [currentWeek]);

  function startNewGame() {
    setTiles(generateBoard(words, currentWeek));
    setScore(0);
    setSelectedTile(null);
    setFeedback(null);
    setAnswer("");
  }

  function resetSamples() {
    setWords(sampleWords);
    setCurrentWeek(3);
    setForm((current) => ({ ...current, week: "3" }));
    setMessage("Sample words restored for Weeks 1-3.");
    setTiles(generateBoard(sampleWords, 3));
    setScore(0);
  }

  function saveWord(event: React.FormEvent) {
    event.preventDefault();
    const week = Number(form.week);
    const cleanedWord = form.word.trim();
    if (!cleanedWord || !Number.isInteger(week) || week <= 0) {
      setMessage("Word and a positive week number are required.");
      return;
    }

    const nextWord: SpellingWord = {
      id: editingId ?? createId(),
      word: cleanedWord,
      week,
      definition: form.definition.trim() || undefined,
      sentence: form.sentence.trim() || undefined,
      hint: form.hint.trim() || undefined,
      masteredCount: editingId ? words.find((word) => word.id === editingId)?.masteredCount : 0,
      missedCount: editingId ? words.find((word) => word.id === editingId)?.missedCount : 0,
    };

    setWords((current) => (editingId ? current.map((word) => (word.id === editingId ? nextWord : word)) : [...current, nextWord]));
    setForm({ word: "", week: String(currentWeek), definition: "", sentence: "", hint: "" });
    setEditingId(null);
    setMessage(editingId ? "Word updated." : "Word added.");
  }

  function importWords() {
    const imported = parseImportText(importText, currentWeek);
    if (imported.length === 0) {
      setMessage("No valid words found. Use word, week, definition, sentence, hint.");
      return;
    }
    setWords((current) => [...current, ...imported]);
    setImportText("");
    setMessage(`Imported ${imported.length} word${imported.length === 1 ? "" : "s"}.`);
  }

  function editWord(word: SpellingWord) {
    setEditingId(word.id);
    setForm({
      word: word.word,
      week: String(word.week),
      definition: word.definition ?? "",
      sentence: word.sentence ?? "",
      hint: word.hint ?? "",
    });
    setMessage("Editing selected word.");
  }

  function deleteWord(id: string) {
    setWords((current) => current.filter((word) => word.id !== id));
    setMessage("Word deleted.");
  }

  function chooseTile(tile: Tile) {
    if (tile.completed) return;
    setSelectedTile(tile);
    setAnswer("");
    setFeedback(null);
  }

  function updateWordStats(wordId: string, correct: boolean) {
    setWords((current) =>
      current.map((word) =>
        word.id === wordId
          ? {
              ...word,
              masteredCount: (word.masteredCount ?? 0) + (correct ? 1 : 0),
              missedCount: (word.missedCount ?? 0) + (correct ? 0 : 1),
            }
          : word,
      ),
    );
  }

  function checkAnswer() {
    if (!selectedTile || feedback) return;
    const correct = normalize(answer) === normalize(selectedTile.answer);
    setFeedback(correct ? "correct" : "incorrect");
    setTiles((current) => current.map((tile) => (tile.id === selectedTile.id ? { ...tile, completed: true } : tile)));
    updateWordStats(selectedTile.word.id, correct);
    if (correct) {
      setScore((current) => current + selectedTile.points);
    }
    const history = readJson<unknown[]>(HISTORY_KEY, []);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([...history, { wordId: selectedTile.word.id, points: selectedTile.points, correct, date: new Date().toISOString() }]));
  }

  const completedCount = tiles.filter((tile) => tile.completed).length;

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Local Homeschool Practice</p>
          <h1>Spelling Jeopardy</h1>
          <p>Practice this week's list while keeping older spelling words in review.</p>
        </div>
        <div className="score-card">
          <span>Score</span>
          <strong>{score}</strong>
          <small>{completedCount}/25 tiles completed</small>
        </div>
      </section>

      <section className="toolbar">
        <label>
          Current Week
          <input type="number" min="1" value={currentWeek} onChange={(event) => setCurrentWeek(Math.max(1, Number(event.target.value) || 1))} />
        </label>
        <button onClick={startNewGame}>New Game</button>
        <button className="secondary" onClick={() => setTiles((current) => current.map((tile) => ({ ...tile, completed: false })))}>Reset Board</button>
        <button className="secondary" onClick={resetSamples}>Restore Samples</button>
      </section>

      <section className="instructions">
        <h2>How to Play</h2>
        <p>Pick a point tile, type the spelling word, and check the answer. Correct answers add points. Missed words are saved and appear more often in later boards.</p>
      </section>

      <section className="board" aria-label="Spelling Jeopardy board">
        {CATEGORIES.map((category) => (
          <div className="category" key={category.id}>
            <h2>{category.name}</h2>
            {POINTS.map((points) => {
              const tile = tiles.find((item) => item.category.id === category.id && item.points === points);
              return (
                <button key={points} className={`tile ${tile?.completed ? "completed" : ""}`} disabled={!tile || tile.completed} onClick={() => tile && chooseTile(tile)}>
                  {tile?.completed ? "Done" : points}
                </button>
              );
            })}
          </div>
        ))}
      </section>

      <section className="manager">
        <div className="panel">
          <h2>Parent Word Manager</h2>
          <form onSubmit={saveWord} className="word-form">
            <label>
              Word *
              <input value={form.word} onChange={(event) => setForm({ ...form, word: event.target.value })} />
            </label>
            <label>
              Week *
              <input type="number" min="1" value={form.week} onChange={(event) => setForm({ ...form, week: event.target.value })} />
            </label>
            <label>
              Definition
              <input value={form.definition} onChange={(event) => setForm({ ...form, definition: event.target.value })} />
            </label>
            <label>
              Sentence
              <input value={form.sentence} onChange={(event) => setForm({ ...form, sentence: event.target.value })} />
            </label>
            <label>
              Hint
              <input value={form.hint} onChange={(event) => setForm({ ...form, hint: event.target.value })} />
            </label>
            <button type="submit">{editingId ? "Update Word" : "Add Word"}</button>
          </form>
          {message ? <p className="message">{message}</p> : null}
        </div>

        <div className="panel">
          <h2>CSV or Spreadsheet Import</h2>
          <p className="hint">Paste rows as: word, week, definition, sentence, hint. Week defaults to the current week when omitted.</p>
          <textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="rescue,3,To save from danger,The team will rescue the dog,Starts with r" />
          <button onClick={importWords}>Import Words</button>
        </div>
      </section>

      <section className="word-table-wrap">
        <h2>Stored Words</h2>
        <table>
          <thead>
            <tr>
              <th>Word</th>
              <th>Week</th>
              <th>Definition</th>
              <th>Missed</th>
              <th>Mastered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...words].sort((a, b) => a.week - b.week || a.word.localeCompare(b.word)).map((word) => (
              <tr key={word.id}>
                <td>{word.word}</td>
                <td>{word.week}</td>
                <td>{word.definition ?? "-"}</td>
                <td>{word.missedCount ?? 0}</td>
                <td>{word.masteredCount ?? 0}</td>
                <td className="actions">
                  <button className="secondary" onClick={() => editWord(word)}>Edit</button>
                  <button className="danger" onClick={() => deleteWord(word.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedTile ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="question-title">
            <p className="eyebrow">{selectedTile.category.name} for {selectedTile.points}</p>
            <h2 id="question-title">Spell the Answer</h2>
            <p className="prompt">{selectedTile.prompt}</p>
            <input autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === "Enter" && checkAnswer()} disabled={feedback !== null} />
            {feedback ? (
              <p className={feedback === "correct" ? "correct" : "incorrect"}>
                {feedback === "correct" ? "Correct!" : "Not quite."} Correct spelling: <strong>{selectedTile.answer}</strong>
              </p>
            ) : null}
            <div className="modal-actions">
              <button onClick={checkAnswer} disabled={feedback !== null}>Check Answer</button>
              <button className="secondary" onClick={() => setSelectedTile(null)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
