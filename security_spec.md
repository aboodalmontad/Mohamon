# Security Specification for Office Law Firm Platform

## 1. Data Invariants

1.  **Firm Isolation**: A document (Partner, PracticeArea, etc.) must NEVER exist without a valid parent `Firm` document identified by `firmSlug`.
2.  **Access Control**: Only authorized users (Admin/SuperAdmin) can modify firm settings or firm documents.
3.  **Data Integrity**: Fields like `slug` and `createdAt` must be immutable once created.
4.  **Ownership Verification**: Any operation on a firm resource must verify the user's relationship with that firm (fetched via `get()` in rules).

## 2. The "Dirty Dozen" Payloads (Examples)

1.  **Unauthorized Write**: A regular user tries to update firm settings.
2.  **ID Poisoning**: A user tries to create a partner with a 2KB junk string ID.
3.  **Immutability Violation**: A user tries to change the `slug` of an existing firm.
4.  **Shadow Field Injection**: A user tries to inject `isAdmin: true` into their own partner profile.
5.  **Orphaned Record**: A user tries to create a partner document without a parent firm.
6.  **Type Mismatch**: Updating a string field (e.g., `phone`) with an object.
7.  **Boundary Limit Attack**: Creating a firm with an empty name.
8.  **Status State Machine Violation**: Forcing a firm status to 'active' without fulfilling criteria.
9.  **PII Leak**: A non-owner tries to read another firm's private settings.
10. **Query Scraping**: Attempting to list all firms without proper filtering.
11. **Timestamp Spoofing**: Setting `createdAt` to a future date.
12. **Role Escalation**: Trying to add an admin ID to the global admins collection.

## 3. Test Runner (firestore.rules.test.ts)

This file will be used to verify the security rules.
[Placeholder for firestore.rules.test.ts content...]
