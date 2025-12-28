# CONTEXT

You are an expert full-stack developer (JavaScript, React/Next.js, Firebase, clean architecture).
You are helping me build a small but robust web app called **LedgerLite**.

## Goal of LedgerLite

as you can see in the readm.md fileLedgerLite is a personal web app to track:

- credits (money others owe me)
- debts (money I owe to others)

Each user logs in with **Google** and sees only their own data.

The app must be:

- simple and fast,
- reliable over time (no “free tier goes to sleep and breaks everything”),
- easy to maintain.

I previously used **Supabase**but now I want to move to an infrastructure that is **more reliable and “set-and-forget”**, without complex server management.

## New Technical Stack (to implement)

- **Auth**: Firebase Authentication with **Google provider only**.
- **Database**: Firebase **Firestore** (NoSQL, document-based).
- **Security**: Firestore security rules based on authenticated user ID.

No custom backend server is strictly required: the frontend can call Firebase directly, with proper rules.

---

# REQUIREMENTS

1. **Authentication**

   - Implement Firebase Authentication with Google sign-in.
   - After login, store the user object (uid, email, displayName, photoURL) in a global state (React context, Zustand, or similar).
   - Protect all app routes except a simple “landing/login” page.
   - If the user is not logged in, redirect to the login page.

2. **Data Model (Firestore)**

   Use a simple, clean schema. For example:

   - Collection: `users`

     - Document ID: `uid` of Firebase user
     - Fields: `email`, `displayName`, `createdAt`, `updatedAt`

   - Subcollection: `entries` under each user document  
     Path: `users/{uid}/entries`

     Each `entry` document should have:

     - `type`: `"credit"` or `"debt"`
     - `counterpartyName`: string (e.g. "Manuel", "Banca", "Affitto")
     - `description`: string (optional note)
     - `amount`: number (positive, in euro)
     - `currency`: string (default `"EUR"`)
     - `status`: `"open"` or `"closed"`
     - `createdAt`: timestamp
     - `updatedAt`: timestamp

   The app must only show data for `uid` of the currently logged-in user.

3. **Firestore Security Rules**

   Generate Firestore rules such that:

   - Only authenticated users can read/write.
   - A user can only read/write documents where the path contains their own `uid`.
   - It is not possible to read or modify other users’ data.

4. **Frontend Features**

   Implement the following screens/components:

   ### 4.1. Auth / Layout

   - A **Login Page** with:
     - App logo / title: "LedgerLite"
     - A button: “Continue with Google” which triggers Firebase Auth.
   - After login, redirect to the **Dashboard**.

   ### 4.2. Dashboard (Home)

   - Show:
     - Total **credit** (sum of all `entries` with `type = "credit"` and `status = "open"`).
     - Total **debt** (sum of all `entries` with `type = "debt"` and `status = "open"`).
     - A quick “net balance” indicator (credit - debt).
   - Display a **table or list** of the most recent entries with:
     - type (credit/debt, clearly distinguishable),
     - counterparty,
     - amount,
     - status (open/closed),
     - createdAt or dueDate.
   - Add filters:
     - by type (all / only credits / only debts),
     - by status (all / open / closed),
     - by search term (counterpartyName).

   ### 4.3. Entry Form (Create / Edit)

   - A form to **add a new entry** with fields:
     - type (credit/debt, required)
     - counterpartyName (required)
     - amount (required, positive number)
     - description (optional)
     - dueDate (optional)
   - Client-side validation (required fields, positive numbers, etc.).
   - When submitting:
     - Create a document under `users/{uid}/entries`.
     - Set timestamps (`createdAt`, `updatedAt`).
   - Support **edit mode**:
     - Load existing entry data.
     - Allow updating fields.
     - Update `updatedAt`.

   ### 4.4. Entry Actions

   - Toggle **status** between `open` and `closed`.
   - Delete an entry.
   - All actions must immediately update Firestore and UI state.

5. **UX / UI**

   - Clean, minimal, responsive layout.
   - Clear visual distinction between **credits** (money others owe me) and **debts** (money I owe).
   - Simple navigation:
     - Left/top bar with: "Dashboard", "Add Entry", "Logout".
   - Show loading states and error messages when:
     - loading entries,
     - adding/updating/deleting entries,
     - auth-related issues.

6. **Tech Quality**

   - Use **TypeScript** everywhere.
   - Isolate Firebase config and initialization in a dedicated module (e.g. `firebaseClient.ts`).
   - Create a small data-access layer, e.g.:
     - `ledgerRepository.ts` with functions like:
       - `listEntries(uid, filters)`
       - `createEntry(uid, data)`
       - `updateEntry(uid, entryId, data)`
       - `deleteEntry(uid, entryId)`
   - Use async/await and proper error handling.
   - Organize code to be easy to extend (e.g., future features: recurring entries, export to CSV, categories).

---

# WHAT YOU SHOULD DO

1. Add Firebase SDK and configure:
   - Firebase Auth (Google)
   - Firestore
   - Security rules aligned with requirements.
2. Implement the data model and repository functions.
3. Wire everything together:
   - Protect routes by auth state
   - Read from and write to Firestore correctly.
4. Provide clear instructions:
   - Which environment variables to define (Firebase config).
   - How to run the project locally.
   - How to deploy (e.g. on Vercel).

When writing code, please:

- explain briefly what you are doing in comments when needed,
- keep code clean and modular,
- use idiomatic patterns for the chosen framework.

Start by scaffolding the project and creating the Firebase setup, then proceed step by step.
