## ADDED Requirements

### Requirement: Unread count available for navigation badge
The student message read cursor tracked in `student_message_read_state` SHALL be used to compute the unread admin message count, which MAY be surfaced on navigation elements such as the dashboard section navigation button badge in addition to the existing summary card.

#### Scenario: Same unread count used across dashboard
- **WHEN** the student dashboard computes the unread admin message count
- **THEN** the same count value is available to both the messages summary card and the Messages section navigation button badge
