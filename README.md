# ReactRandom

Authenticated React app built with Vite, Zustand, React Router, and Firebase
(Auth + Firestore).

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Firebase project with **Email/Password** and **Google** sign-in enabled
- A Firestore database

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Firebase web config.
2. In Firebase Console → Authentication → Settings → Authorized domains, add
   `localhost` and your production host (e.g. `mark-haddad-react.vercel.app`).
3. Create Firestore and publish rules. Signed-in users can **list** profiles;
   each user can only **write** their own doc:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Install and run:

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev          # Vite development server
npm run build        # Type-check and production build
npm run preview      # Preview production build
npm run typecheck    # TypeScript only
npm run lint         # ESLint
npm run check        # typecheck + lint + format check
```

## Stack

- **Auth:** Firebase Auth (Google + email/password)
- **Profiles / login history:** Firestore `users/{uid}`
- **Client state:** Zustand
- **Routing:** React Router (protected Home + Profile)
