## 1. Delete Student

- [x] 1.1 Add `handleDeleteStudent` function to DailyOps with 2-stage confirmation
- [x] 1.2 Attempt to delete Supabase Auth user via admin client before student row delete
- [x] 1.3 Delete student row (cascade handles related tables)
- [x] 1.4 Add Delete button to Actions column in Student Roster
- [x] 1.5 Handle error state — show message, don't delete

## 2. Remove Notes Column

- [x] 2.1 Remove `noteText` and `notePriority` state variables
- [x] 2.2 Remove `handleAddNote` function
- [x] 2.3 Remove `<th>Notes</th>` from table header
- [x] 2.4 Remove `<td>` notes form from each row

## 3. Verification

- [x] 3.1 Verify deleting a student cascades to schedules, evaluations, messages, notes
- [x] 3.2 Verify 2-stage confirmation works and Cancel at either stage aborts
- [x] 3.3 Verify Notes column is gone from Student Roster
- [x] 3.4 Run production build and resolve any issues
