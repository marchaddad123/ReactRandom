# ReactRandom

Authenticated React app built with Vite, Zustand, React Router, and Firebase
(Auth + Firestore).

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Firebase project with **Email/Password** and **Google** sign-in enabled
- A Firestore database

## Setup

1. Copy `.env.example` → `.env.local` and fill in your Firebase web config
   (from Firebase Console → Project settings → Your apps).
2. In Firebase Console → Authentication → Settings → Authorized domains, add
   `localhost` and your production host (e.g. `mark-haddad-react.vercel.app`).
3. Create Firestore and publish rules. Signed-in users can **list** profiles and
   posts; each user can only **write** their own profile and posts:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;

      match /posts/{postId} {
        allow read: if request.auth != null;
        allow create, update, delete: if request.auth != null
          && request.auth.uid == userId;
      }
    }
  }
}
```

Same file lives at [`firestore.rules`](firestore.rules) — copy that into Firebase Console → Firestore → **Rules** → **Publish**.

4. Install and run:

```bash
npm install
npm run dev
```

## Vercel / production env

Vite inlines `VITE_*` at **build** time. `.env.local` is gitignored and is
**not** on Vercel.

In Vercel → Project → **Settings → Environment Variables**, add the same keys
for Production (and Preview if you want):

| Name | Example |
|------|---------|
| `VITE_FIREBASE_API_KEY` | from Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `reactrandom.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `reactrandom` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `….firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | numbers |
| `VITE_FIREBASE_APP_ID` | `1:…:web:…` |

Then **Redeploy** so the new build picks them up.

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
- **Profiles / posts:** Firestore `users/{uid}` and `users/{uid}/posts`
- **Client state:** Zustand
- **Routing:** React Router (`/:username`, `/:username/posts`)
