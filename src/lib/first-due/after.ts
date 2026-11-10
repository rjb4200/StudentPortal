import { after } from 'next/server';

// Next's after() requires a request scope. Unit tests call route handlers
// directly, so a rejection here simply skips the background task.
export function runAfterResponse(task: () => Promise<void>): void {
  try {
    after(task);
  } catch {
    // Not inside a request scope; no background work is scheduled.
  }
}
