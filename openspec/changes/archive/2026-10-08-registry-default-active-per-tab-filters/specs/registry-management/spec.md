## MODIFIED Requirements

### Requirement: Searchable and filterable registry records
The system SHALL allow administrators to search and filter Registry records within the selected entity view. The Classes view SHALL support filtering by stored status and derived lifecycle; all entity views SHALL preserve enough identifying and relationship information for an administrator to distinguish records. Each entity view SHALL open with its Status filter defaulted to Active, and the Classes view SHALL additionally default its Lifecycle filter to In progress. Each entity view SHALL retain its own search, status, and lifecycle values: switching to a view that has not been used in the session SHALL use that view's defaults, and switching back to a previously used view SHALL restore the values last set for it.

#### Scenario: Registry opens focused on active records
- **WHEN** an administrator opens the Registry tab
- **THEN** the Classes view shows the Status filter set to Active and the Lifecycle filter set to In progress, and the record list is limited accordingly

#### Scenario: Untouched view uses its defaults
- **WHEN** an administrator switches to an entity view they have not used in this session
- **THEN** that view's Status filter is Active and its record list is limited to active records

#### Scenario: Returning to a view restores its last-used filter
- **WHEN** an administrator changes a view's filter values, switches to another view, and then switches back
- **THEN** the original view shows the filter values they last set for it

#### Scenario: Pending records remain one action away
- **WHEN** an administrator is viewing a view under its default Active status
- **THEN** a quick action is available to switch that view to the Pending status without manually changing the Status filter

#### Scenario: Administrator filters expired classes
- **WHEN** an administrator filters Classes by the Expired lifecycle
- **THEN** the Registry displays only classes whose ride-time end date is before the current application date

#### Scenario: Administrator searches an instructor
- **WHEN** an administrator searches the Instructors view by an instructor name or email
- **THEN** the Registry displays matching instructor records and a clear empty state when no records match

## ADDED Requirements

### Requirement: Pending records are always surfaced
The system SHALL surface pending registry records — records awaiting approval — in a pinned block at the top of every entity view (Classes, Instructors, Training Sites), independent of the Status and Lifecycle filters, so that a pending record cannot be hidden by a filter. The pinned block SHALL respect the search query and SHALL appear only when the active filter would otherwise hide pending records. Pending records shown in the pinned block SHALL be excluded from the filtered list so they are not duplicated. The pinned block SHALL list the longest-waiting pending records first. A "Review pending" quick action SHALL remain available to switch a view to the Pending status.

#### Scenario: Pending records pinned above the filtered list
- **WHEN** an administrator views an entity view under a Status filter that excludes pending records and pending records exist
- **THEN** the Registry displays a pinned "Needs approval" block at the top listing those pending records above the filtered list

#### Scenario: Pending records pinned regardless of lifecycle
- **WHEN** the Classes view is filtered to a Lifecycle that does not match a pending class's lifecycle
- **THEN** that pending class still appears in the pinned block

#### Scenario: Pinned block respects the search query
- **WHEN** an administrator enters a search query and a pending record does not match it
- **THEN** that pending record is not shown in the pinned block

#### Scenario: No pinned block when the filter already shows pending
- **WHEN** the active Status filter already includes pending records
- **THEN** the Registry does not render the pinned block and the pending records appear only in the filtered list

#### Scenario: Longest-waiting pending records first
- **WHEN** multiple pending records exist for the selected view
- **THEN** the pinned block lists the oldest pending records first

#### Scenario: No pending records
- **WHEN** no pending records exist for the selected view
- **THEN** the Registry renders no pinned block
