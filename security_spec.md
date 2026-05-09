# Security Specification

## Data Invariants
- A user can only modify their own profile, except for `isAdmin` which they cannot modify themselves.
- Only users with `isAdmin: true` in their `users/{userId}` profile can create, update, or delete `categories` and `products`.
- Products must reference a valid Category ID.
- Anyone can read `products` and `categories`.
- A user can create an `order` for themselves. They can only read their own orders. Admin can read all orders and update their status.
- `createdAt` is immutable.
- `updatedAt` is always `request.time`.

## The Dirty Dozen Payloads
1. User profile creation with `isAdmin: true` (Spoofing) => DENY
2. User profile update modifying `isAdmin` (Privilege Escalation) => DENY
3. Creating a product as a non-admin => DENY
4. Updating a product as a non-admin => DENY
5. User creating an order with a mismatched `userId` => DENY
6. User reading another user's order => DENY
7. Order creation with a negative total => DENY
8. Admin bypassing status schema in order update => DENY
9. Payload with missing required fields in product => DENY
10. Payload with 'Ghost Field' in category => DENY
11. Modifying `createdAt` field on update => DENY
12. ID poisoning in user creation path variable => DENY
