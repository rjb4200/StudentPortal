## Context

The `polish-messaging` change introduced an unread indicator using an absolutely-positioned crimson dot on admin message bubbles. The dot uses `-top-1.5` which extends above the bubble, and the parent scroll container's `overflow-y-auto` clips it.

## Decisions

### Decision: Replace dot with left accent border

Use a 3px `border-l-wfd-crimson` on the bubble `<div>` when `isUnreadAdminMessage` is true, paired with `pl-1` to shift content right so the border doesn't crowd text.

**Rationale**: The left border pattern is already established in this codebase for unread/admin emphasis (`SectionCard`, admin message thread entries). It lives inside the bubble boundary so no clipping occurs. The crimson 3px bar provides a clear "this is new" signal without requiring absolute positioning.

**Alternatives considered**:
- Adding `pt-2` to scroll container — only fixes first message, doesn't fix messages near other clipping boundaries
- `top-0 left-0 -translate-x-1/2 -translate-y-1/2` on dot — still protrudes, fragile
- Background tint — too subtle, easy to miss
- Colored outline — competes with existing rounded corners

## Risks / Trade-offs

- None. The change is purely visual with no behavioral impact.
