## 1. Rewrite page state management

- [x] 1.1 Replace existing `done`/`error` state with a `pageState` union type: `'loading' | 'form' | 'success' | 'expired'`
- [x] 1.2 Add `showPassword` and `showConfirm` boolean state for show/hide toggles
- [x] 1.3 Add `sessionChecked` flag to prevent flash of expired state before `getSession()` resolves
- [x] 1.4 On mount, call `supabase.auth.getSession()` — if no session, set `pageState = 'expired'`; otherwise `pageState = 'form'`

## 2. Build the WFD-branded card with logo

- [x] 2.1 Wrap the card in a centered layout matching the login page pattern (`min-h-[80vh] flex items-center justify-center`)
- [x] 2.2 Add centered WFD logo `<img>` using the same Supabase storage URL as the layout header
- [x] 2.3 Add "Reset Your Password" heading with subtitle "Choose a new password for your EMS Student Portal account."

## 3. Build the password tips panel

- [x] 3.1 Create a tips panel below the subtitle showing three criteria (8+ characters, uppercase letter, number)
- [x] 3.2 Implement live checkmark logic: as user types in the New Password field, each criterion gets a ✓ (green) or ◻ (gray) indicator
- [x] 3.3 Style the panel as a bordered, muted-background section distinct from the main form

## 4. Add show/hide password toggles

- [x] 4.1 Wrap each password `<input>` in a relative-positioned container with an absolutely-positioned toggle button
- [x] 4.2 Toggle button switches input `type` between `password` and `text`, toggles `showPassword`/`showConfirm` state
- [x] 4.3 Add `aria-label` on toggle buttons for screen reader accessibility

## 5. Style alerts to match login page pattern

- [x] 5.1 Replace bare `<p className="text-sm text-wfd-crimson">` error line with a styled alert box using `bg-wfd-crimson/10 text-wfd-crimson border border-wfd-crimson/30 rounded-lg p-3`
- [x] 5.2 Apply error styling for: password mismatch, too-short password, and Supabase API errors
- [x] 5.3 Apply success styling (`bg-wfd-sage/10 text-wfd-sage border border-wfd-sage/30`) for the post-submit confirmation if still in form state

## 6. Build the expired link state

- [x] 6.1 When `pageState === 'expired'`, render a card with a warning icon, "Reset Link Expired or Invalid" heading, and explanation text
- [x] 6.2 Add "Request New Link" button that navigates to `/login` (where the forgot-password flow lives)
- [x] 6.3 Add "Return to Login" link below the button

## 7. Build the success state

- [x] 7.1 When `pageState === 'success'`, render the success card with a green checkmark icon, "Password Updated" heading, and confirmation text
- [x] 7.2 Style the success message as a sage alert box
- [x] 7.3 Add a prominent "Return to Login" button

## 8. Integrate form submission and add Return to Login

- [x] 8.1 Keep existing password match validation (client-side: mismatch, <6 chars)
- [x] 8.2 Keep existing `supabase.auth.updateUser({ password })` call
- [x] 8.3 Display Supabase errors in the styled alert box; on success set `pageState = 'success'`
- [x] 8.4 Add "Return to Login" link below the submit button on the form state

## 9. Verification

- [x] 9.1 Run `npm run build` to verify no TypeScript or build errors
- [x] 9.2 Verify form state renders with logo, heading, tips panel, toggles, and Return to Login
- [x] 9.3 Verify password tips update live as user types
- [x] 9.4 Verify show/hide toggles work independently on both fields
- [x] 9.5 Verify expired link state renders with both action buttons
- [x] 9.6 Verify error alerts use crimson styling matching login page
- [x] 9.7 Verify success state renders with sage alert and Return to Login button

