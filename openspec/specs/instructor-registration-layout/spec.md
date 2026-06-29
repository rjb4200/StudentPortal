# instructor-registration-layout

## Purpose

Ensure the instructor registration page (`/instructor-registration`) shares the same visual layout and branding as the student onboarding page, providing a consistent experience across public-facing registration flows.

## Requirements

### Requirement: Page layout matches onboarding appearance
The instructor-registration page SHALL use a layout that is visually consistent with the onboarding page, with a compact left branding column and a wide right content card.

#### Scenario: Desktop layout renders correctly
- **WHEN** a user visits `/instructor-registration` on a viewport >= 1024px
- **THEN** the page displays a two-column layout with the WFD logo and branding on the left (`max-w-[14rem]`) and a white card on the right (`max-w-md lg:flex-1 lg:max-w-5xl`)
- **AND** the logo is sized at `clamp(100px, 18vw, 200px)`
- **AND** the background is a dark red gradient (`linear-gradient(to bottom, #4a0000, #A40104 30%, #A40104 70%, #4a0000)`)
- **AND** the white card has `rounded-2xl shadow-2xl` styling with `p-6 lg:p-8`

#### Scenario: Mobile layout stacks vertically
- **WHEN** a user visits `/instructor-registration` on a viewport < 1024px
- **THEN** the branding is displayed above the form in a single column
- **AND** the white card spans the full width (`w-full max-w-md`)
- **AND** all content remains readable without horizontal scrolling

#### Scenario: Other public pages are unaffected
- **WHEN** a user visits `/login` or other routes under `(public)/`
- **THEN** those pages continue to use the existing `(public)/layout.tsx` with large logo and narrower card
