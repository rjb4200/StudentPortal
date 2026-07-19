## Why

The unread-message indicator dot on student message bubbles uses absolute positioning (`-top-1.5 -left-1.5`) which extends above the bubble boundary. The scroll container's `overflow-y-auto` clips the dot when the unread message is first in the list, making it invisible or partially cut off.

## What Changes

Replace the absolute-positioned crimson dot with a 3px `border-l-wfd-crimson` left accent border on unread admin message bubbles, paired with a slight content shift (`pl-1`) to maintain visual balance. This is the same visual pattern used by admin `SectionCard` and admin message thread entries.

## Capabilities

### Modified Capabilities
- `student-message-read-tracking`: Unread indicator changes from dot to left accent border.

## Impact

- `src/components/dashboard/messages.tsx`: Replace dot `<span>` with conditional border class on the bubble `<div>`.
