# StudySync Architecture

## Frontend

- Vite + React 19 SPA
- React Router app shell with protected routes
- Firebase Authentication for user sessions
- Firestore for user-owned study data and premium metadata reads
- Tailwind 4 + custom CSS variables for product styling

## Backend

- Vercel serverless functions in `api/`
- Firebase Admin SDK for privileged reads and writes
- Stripe Checkout + Customer Portal + Webhook sync
- OpenAI Responses API for premium AI tools

## Security model

- Firebase client SDK handles only user-owned reads and task writes
- Stripe and OpenAI secrets never touch the client
- Server routes require Firebase ID token verification
- Subscription state is written from verified backend paths only
- Firestore rules lock server-generated AI collections to read-only for end users

## Cost control

- Premium only AI access
- Monthly usage cap via `PREMIUM_AI_MONTHLY_LIMIT`
- Default model is `gpt-4.1-mini`
- Structured prompts keep responses short and deterministic
