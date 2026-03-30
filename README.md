# StudySync

StudySync is a production-oriented study SaaS built for students who want a polished workspace, better visibility into deadlines, and premium AI planning tools that are actually worth paying for.

Live demo: [https://studysync-pearl.vercel.app](https://studysync-pearl.vercel.app)

![StudySync dashboard](studysync.png)

## Product overview

- Free tier for core study and task management
- Premium tier for `$5/month`
- Dark-mode landing page, auth flow, dashboard, billing, account, and settings experience
- Stripe-backed subscriptions with customer portal access
- Premium AI study planner, quiz generator, flashcard generator, topic explainer, and study breakdown tools
- Firestore-backed user, task, plan, usage, and AI artifact storage

## Core features

- Beautiful marketing landing page with strong SaaS framing
- Protected React app shell with pricing, billing, account, and settings pages
- Dashboard with due today, overdue, upcoming, completion rate, streaks, filters, sorting, and calendar-style weekly view
- Task CRUD with proof link and completion-note architecture
- Premium gating via Firestore subscription status
- Secure serverless endpoints for Stripe and OpenAI features

## Premium features

- AI Study Planner
- AI Quiz Generator
- AI Flashcard Generator
- AI Topic Explainer
- AI Study Breakdown
- Monthly AI usage cap with cost-aware defaults
- Stripe billing portal
- Premium badge and gated UI states

## Tech stack

- Frontend: React 19, Vite, React Router 7, Tailwind CSS 4
- Auth + database: Firebase Authentication, Firestore
- Backend: Vercel serverless functions
- Billing: Stripe Checkout, Stripe Customer Portal, Stripe Webhooks
- AI: OpenAI Responses API

## Project structure

```text
studysync/
+- api/
¦  +- ai/generate.js
¦  +- billing/create-checkout-session.js
¦  +- billing/create-portal-session.js
¦  +- billing/webhook.js
¦  +- _lib/
+- docs/
¦  +- architecture.md
¦  +- firestore-schema.md
+- src/
¦  +- app/
¦  +- components/
¦  +- contexts/
¦  +- pages/
¦  +- services/
¦  +- lib/
¦  +- firebase/
+- firestore.rules
+- vercel.json
+- .env.example
```

## Local setup

1. Clone the repo.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in the values.
4. Run frontend-only local dev:

```bash
npm run dev
```

5. Run full-stack local dev with Vercel serverless routes:

```bash
npx vercel dev
```

## Environment variables

Client:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=
```

Server:

```env
APP_URL=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_PRICE_ID=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PREMIUM_AI_MONTHLY_LIMIT=60
```

## Firebase setup

1. Create a Firebase project.
2. Enable Email/Password authentication in Authentication.
3. Create a Firestore database in production mode.
4. Create a Firebase web app and copy the web config values into the `VITE_FIREBASE_*` env vars.
5. Create a service account in Project Settings -> Service accounts.
6. Copy `project_id`, `client_email`, and `private_key` into the `FIREBASE_ADMIN_*` env vars.
7. Publish the rules from `firestore.rules`.

## Stripe setup

1. Create a Stripe product named `StudySync Premium`.
2. Add a recurring monthly price for `$5/month`.
3. Copy the price ID into `STRIPE_PREMIUM_PRICE_ID`.
4. Enable the Stripe Customer Portal in the Stripe Dashboard.
5. Add your `STRIPE_SECRET_KEY`.
6. Add a webhook endpoint pointing to `/api/billing/webhook`.
7. Subscribe at least these events:
   `checkout.session.completed`
   `customer.subscription.created`
   `customer.subscription.updated`
   `customer.subscription.deleted`
8. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## OpenAI setup

1. Create an OpenAI API key.
2. Add it to `OPENAI_API_KEY`.
3. Optionally keep `OPENAI_MODEL=gpt-4.1-mini` for lower-cost premium AI usage.
4. Adjust `PREMIUM_AI_MONTHLY_LIMIT` if you want tighter or looser cost control.

## Deployment

Frontend and API are designed for Vercel:

1. Import the repo into Vercel.
2. Add all client and server env vars in Vercel project settings.
3. Redeploy after configuring Stripe and Firebase.
4. Set `APP_URL` to your production domain.
5. Update your Stripe webhook endpoint to the production `/api/billing/webhook` URL.

## Cost model notes

- AI is gated behind premium status only.
- Premium usage is limited by a monthly credit counter stored in Firestore.
- The default model is set to `gpt-4.1-mini` to reduce per-generation cost.
- Outputs are intentionally structured and compact instead of long-form free text.

## Roadmap

- Study session timer and deep analytics
- Image proof uploads with Firebase Storage
- Smarter calendar syncing
- Collaboration and accountability groups
- Push reminders and email digests
