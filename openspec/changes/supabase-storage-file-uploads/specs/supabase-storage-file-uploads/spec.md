## ADDED Requirements

### Requirement: Admin file upload for quiz photos
The system SHALL allow admin users to upload image files for quiz photos directly to Supabase Storage, with the resulting public URL automatically populated in the photo's image_url field.

#### Scenario: Upload quiz photo
- **WHEN** an admin selects an image file in the quiz photo editor and clicks upload
- **THEN** the file is stored in the `onboarding-assets` Supabase Storage bucket and the photo's image_url field is set to the public URL

#### Scenario: Upload fails
- **WHEN** a file upload fails due to size, type, or network error
- **THEN** the system displays an error message and does not save the photo

#### Scenario: Existing URL path remains
- **WHEN** an admin prefers to paste an external URL instead of uploading
- **THEN** the existing URL text input continues to work as before

### Requirement: Admin file upload for resource documents
The system SHALL allow admin users to upload document files for the resource library directly to Supabase Storage, with the resulting public URL automatically populated in the document's file_url field.

#### Scenario: Upload resource document
- **WHEN** an admin selects a file in the resource document editor and clicks upload
- **THEN** the file is stored in the `onboarding-assets` Supabase Storage bucket and the document's file_url field is set to the public URL

#### Scenario: Upload fails
- **WHEN** a file upload fails due to size, type, or network error
- **THEN** the system displays an error message and does not save the document

#### Scenario: Existing URL path remains
- **WHEN** an admin prefers to paste an external URL instead of uploading
- **THEN** the existing URL text input continues to work as before

### Requirement: Storage security
The Supabase Storage bucket SHALL restrict writes to admin users and allow public reads for student-facing components.

#### Scenario: Admin upload permitted
- **WHEN** an admin authenticates and uploads a file
- **THEN** the file is accepted and stored

#### Scenario: Non-admin upload blocked
- **WHEN** a non-admin or anonymous user attempts to upload a file
- **THEN** the storage RLS policy rejects the operation

#### Scenario: Public read permitted
- **WHEN** a student views quiz photos or resource documents
- **THEN** the files are served from the public Supabase Storage URL without authentication
