# Firebase Security Specification

## Data Invariants
1. A **User** document can only be created or modified by the authenticated user with the matching UID.
2. A **Booking** must belong to an authenticated user (`userId`).
3. Only the owner of a booking can view or delete it.
4. Timestamps (`createdAt`, `updatedAt`) must be set using server time.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a user document with a UID that doesn't match `request.auth.uid`.
2. Updating someone else's user profile.
3. Injecting a `role: "admin"` field into a user document.
4. Creating a booking without being signed in.
5. Creating a booking with a `userId` that doesn't match the requester's UID.
6. Updating a booking to change the `userId` (ownership takeover).
7. Updating a booking's `amount` or `refId` after creation (unless it's a specific status change).
8. Reading all bookings in the collection without a `userId` filter.
9. Deleting a booking owned by another user.
10. Using a 1MB string for a `refId` (oversized string).
11. Setting a `createdAt` timestamp from the client instead of `request.time`.
12. Accessing PII (email/phone) of other users.

## Test Runner (firestore.rules.test.ts)
```typescript
// This is a conceptual test runner specification
// In practice, this would be implemented using @firebase/rules-unit-testing
```
