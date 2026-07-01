## ADDED Requirements

### Requirement: Shared admin navigation across admin pages
The system SHALL display the standard Admin Command Center navigation on admin pages, including the Admin Command Center title, hamburger menu, and primary navigation entries for Daily Operations, Registry, Preceptor Analytics, and Maintenance & Archive. Admin subpages SHALL use this shared navigation instead of redundant "Back to Admin Command Center" links when the shared navigation provides the same route back to the command center.

#### Scenario: Admin views an admin subpage
- **WHEN** an authenticated admin navigates to an admin subpage such as `/admin/setup`, `/admin/system`, `/admin/accounts`, or `/admin/students/<id>`
- **THEN** the page displays the Admin Command Center title, hamburger menu, and primary admin navigation entries
- **AND** the page does not display a redundant "Back to Admin Command Center" link above the page content

#### Scenario: Admin navigates from subpage to Daily Operations
- **WHEN** an authenticated admin clicks "Daily Operations" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Daily Operations section selected

#### Scenario: Admin navigates from subpage to Registry
- **WHEN** an authenticated admin clicks "Registry" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Registry section selected

#### Scenario: Admin navigates from subpage to Preceptor Analytics
- **WHEN** an authenticated admin clicks "Preceptor Analytics" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Preceptor Analytics section selected

#### Scenario: Admin navigates from subpage to Maintenance & Archive
- **WHEN** an authenticated admin clicks "Maintenance & Archive" in the shared admin navigation from an admin subpage
- **THEN** the browser navigates to the Admin Command Center with the Maintenance & Archive section selected

#### Scenario: Admin opens hamburger menu from subpage
- **WHEN** an authenticated admin opens the hamburger menu from an admin subpage
- **THEN** the menu displays the same secondary admin navigation destinations available from the Admin Command Center

#### Scenario: Admin prints a printable admin page
- **WHEN** an authenticated admin prints a printable admin page such as a student profile packet
- **THEN** the shared admin navigation is omitted from the printed output

### Requirement: URL-addressable Admin Command Center sections
The Admin Command Center SHALL support opening a specific primary section from the URL. Invalid or missing section values SHALL fall back to Daily Operations.

#### Scenario: Admin opens a valid section URL
- **WHEN** an authenticated admin navigates to `/admin` with a valid section value for Daily Operations, Registry, Preceptor Analytics, or Maintenance & Archive
- **THEN** the matching Admin Command Center section is selected
- **AND** the matching section content is displayed

#### Scenario: Admin opens an invalid section URL
- **WHEN** an authenticated admin navigates to `/admin` with an invalid section value
- **THEN** the Admin Command Center selects Daily Operations
- **AND** the Daily Operations content is displayed
