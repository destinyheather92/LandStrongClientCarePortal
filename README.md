# LandStrong Client Care Portal

A 2-day MVP demo built for LandStrong Counseling: Clerk-authenticated
therapist/client portals, Google Calendar/Meet scheduling, invoicing, email
notifications, and an AI-assisted session note draft generator.

**This is a demo, not a production or HIPAA-ready application.** Do not enter
real client information.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Everything runs in mock
mode until you add real credentials — see "Environment variables" below.

## Roles & auth

- Auth is Clerk (real keys are configured — see below). There are exactly
  two roles: `therapist` and `client`, stored in Clerk's `publicMetadata.role`.
- New sign-ups with no role yet land on `/select-role`, which shows a real
  choice — "I'm a Client" / "I'm a Therapist" — and assigns whichever is
  picked, then redirects: therapists → `/therapist-dashboard`, clients →
  `/client-portal`.
- **Demo-mode note:** either role is available to *any* account right now
  (`lib/auth-roles.ts`'s `assignRole()` just honors whatever was picked).
  `lib/config.ts` still has `isTherapistEmail()` / `THERAPIST_EMAIL` for
  restoring the stricter "only this one email can be therapist" behavior —
  re-add that check in `assignRole()` before this is used by anyone other
  than you.
- Every protected page calls `requireRole("therapist" | "client")`
  (`lib/auth-roles.ts`), which re-checks the *live* Clerk user record (not
  session-token claims) and redirects if the role doesn't match — this works
  correctly whether or not you've customized the Clerk Dashboard session
  token (see the Clerk setup section).

## Routes

| Route | Who | Notes |
| --- | --- | --- |
| `/` | anyone | Landing page |
| `/sign-in`, `/sign-up` | anyone | Clerk catch-all pages |
| `/select-role` | signed in, no role yet | Auto-assigns therapist for `THERAPIST_EMAIL`, otherwise a "Continue as Client" button |
| `/intake` | client | Zod-validated Server Action; record is keyed by the client's Clerk user ID |
| `/schedule` | client | Date + live-availability slot picker |
| `/client-portal` | client | Upcoming session, Meet link, intake/reminder/invoice status |
| `/invoice` | client | All invoices, "Mark as Paid (Demo)" |
| `/therapist-dashboard` | therapist | Every client, today/upcoming appointment, invoice + note status |
| `/therapist-dashboard/[clientId]` | therapist | Intake, appointment + reminders, invoice, AI note generator |
| `/therapist-settings` | therapist | Practice/session/reminder/invoice configuration |
| `POST /api/set-role` | signed in | Called from `/select-role` |
| `GET/POST /api/therapist-settings` | therapist | Settings form save |
| `GET /api/availability?date=` | client | Available slots for a date |
| `POST /api/book-appointment` | client | Books a session end-to-end (calendar + invoice + email) |
| `POST /api/create-invoice` | therapist | Manual invoice creation for an appointment |
| `POST /api/send-reminder-email` | therapist | Manually triggers an appointment or invoice reminder email |
| `POST /api/ai-notes` | therapist | Generates an AI draft note (existing feature, unchanged) |
| `POST /api/webhooks/stripe` | Stripe (no auth) | Syncs real payment status back — see "Stripe real mode" below |

## Files changed / added in this pass

**New library modules**
- `lib/config.ts` — mock/real mode flags for every integration
- `lib/auth-roles.ts` — `getCurrentActor()` / `requireRole()` / `assignRole()`
- `lib/therapist-settings.ts` — mock `TherapistSettings` store
- `lib/google-calendar.ts` — `getBusyTimes()`, `createCalendarEventWithMeet()`, `generateMockMeetLink()`
- `lib/stripe-invoices.ts` — `createMockInvoice()`, `createStripeInvoiceIfConfigured()`, `getInvoiceStatus()`
- `lib/resend.ts` — `sendAppointmentConfirmation()`, `sendAppointmentReminder()`, `sendInvoiceEmail()`
- `lib/availability.ts` — `getAvailableSlots()` / `isSlotStillAvailable()`

**New email templates** (React Email, `@react-email/components`)
- `emails/components/layout.tsx`, `emails/appointment-confirmation.tsx`, `emails/appointment-reminder.tsx`, `emails/invoice-email.tsx`

**New routes**
- `proxy.ts` (Next.js 16's renamed `middleware.ts`)
- `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`
- `app/select-role/page.tsx`, `app/api/set-role/route.ts`
- `app/therapist-settings/page.tsx`, `app/api/therapist-settings/route.ts`
- `app/api/availability/route.ts`, `app/api/book-appointment/route.ts`, `app/api/create-invoice/route.ts`, `app/api/send-reminder-email/route.ts`, `app/api/webhooks/stripe/route.ts`
- `app/client-portal/page.tsx` (replaces the old one-off `/client-portal/[appointmentId]`)
- `app/invoice/page.tsx` + `app/invoice/actions.ts`
- `types/globals.d.ts` — Clerk `publicMetadata`/session-claim type augmentation

**Rewritten**
- `app/layout.tsx` — conditional `ClerkProvider`
- `components/site-header.tsx` — role-aware nav via Clerk's `<Show when="signed-in">`
- `app/schedule/page.tsx` + `components/schedule/slot-picker.tsx` (replaces the old client-picker flow)
- `app/intake/page.tsx` + `actions.ts` + `components/intake/intake-form.tsx` (dropped the 3-therapist picker — there's one therapist now; record keyed by Clerk user ID)
- `app/therapist-dashboard/page.tsx` + `[clientId]/page.tsx` + `actions.ts` (role guards, settings link, dropped the now-redundant `sendPaymentReminderAction`)
- `components/dashboard/appointment-card.tsx`, `invoice-status.tsx`, `therapist-dashboard.tsx` (correct 24h→12h time display, "Send Reminder" wired to the new API route)
- `lib/store.ts` (single-therapist model, `isMockCalendarEvent`/`isMockInvoice` flags, `createAppointment`/`createInvoiceRecord` now take pre-computed calendar/invoice results instead of hardcoding a rate)
- `lib/types.ts`, `lib/utils.ts` (added `TherapistSettings`, `formatTime12h`, `formatDateTimeLabel`; removed the 3-therapist enum)
- `components/landing/hero.tsx`, `cta.tsx` (CTAs now point at `/sign-up` / `/sign-in`)

**New shared components**
- `components/auth/clerk-setup-notice.tsx` — shown instead of crashing when Clerk keys are missing
- `components/auth/select-role-client.tsx`
- `components/demo-banner.tsx`
- `components/client-portal/client-portal-view.tsx`
- `components/therapist-settings/settings-form.tsx`

## Environment variables

All of these already have values in this repo's `.env.local` except the
Clerk keys (still placeholders). Copy `.env.local.example` for a clean
template.

```bash
GROQ_API_KEY=                      # set — powers the AI note generator
GROQ_MODEL=llama-3.3-70b-versatile

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  # set — real pk_test_ key, linked via `clerk init`
CLERK_SECRET_KEY=                   # set — real sk_test_ key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

THERAPIST_EMAIL=dhmills292@gmail.com   # currently unenforced — see "Roles & auth"
PRACTICE_NAME=LandStrong Counseling
PRACTICE_PHONE=(555) 010-1234          # shown in email footers

# Google Calendar/Meet — set except the refresh token, so it's in mock mode
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=                  # ⚠️ blank — real mode needs this (see below)
GOOGLE_CALENDAR_ID=dhmills292@gmail.com

STRIPE_SECRET_KEY=                     # set — real test-mode invoices now
STRIPE_WEBHOOK_SECRET=                 # ⚠️ placeholder — needs `stripe listen` output (see below)

RESEND_API_KEY=                        # set — real emails will send
EMAIL_FROM=dhmills292@gmail.com
```

Every integration falls back to a mock automatically when its variables are
missing (checked in `lib/config.ts`); nothing crashes, it just logs/mocks
instead. **Auth is the one exception** — Clerk can't be "mocked", so pages
show a "Clerk isn't configured yet" notice instead of erroring until you add
real keys.

## npm install commands (already run in this repo)

```bash
npm install @clerk/nextjs date-fns @react-email/components
```

(`zod`, `openai`, `resend`, and `lucide-react` were already installed from
the previous pass.)

## Clerk setup — exact steps

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → create an
   application (or use an existing one) → **Email** as the sign-in method is
   enough for this demo.
2. **API Keys** page → copy the **Publishable key** and **Secret key** into
   `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Restart `npm run dev` (env vars are read at process start).
4. *(Optional, recommended)* **Sessions** page → **Customize session
   token** → add:
   ```json
   { "metadata": "{{user.public_metadata}}" }
   ```
   This isn't required — `requireRole()` always re-checks the live user
   record via the Backend API regardless — but it's the standard Clerk RBAC
   setup and makes role checks in `proxy.ts` possible later if you want them.
5. Sign up with `THERAPIST_EMAIL`'s address once to create the therapist
   account, then sign up with any other email for a client account.

No other Clerk configuration is required — no organizations, no custom
roles/permissions inside Clerk itself; `publicMetadata.role` is all this app
uses.

## Google Calendar real mode (optional)

`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are already filled in; only
`GOOGLE_REFRESH_TOKEN` is missing. To get one:

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground).
2. Gear icon (top right) → check **"Use your own OAuth credentials"** →
   paste in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
3. In the scope list, select **Calendar API v3** (`https://www.googleapis.com/auth/calendar`).
4. Authorize, exchange the code for tokens, copy the **refresh token** into
   `GOOGLE_REFRESH_TOKEN`.
5. Restart the dev server — `lib/google-calendar.ts` will now create real
   events with real, unique Meet links instead of mock ones.

## Stripe real mode

`STRIPE_SECRET_KEY` is set (test mode), so `/api/book-appointment` and
`/api/create-invoice` now create **real Stripe invoices** — a real customer,
a real $-amount invoice item, a finalized invoice with a working
`hosted_invoice_url`. The client's `/invoice` page shows a **Pay Now** button
that opens that real Stripe-hosted checkout page (use test card
`4242 4242 4242 4242`, any future expiry/CVC).

One caveat found by testing this live: Stripe's `pending_invoice_items_behavior`
defaults to `exclude` as of a recent API version — `lib/stripe-invoices.ts`
now explicitly passes `include`, otherwise the invoice item never attaches
and you get a $0 invoice that auto-marks itself "paid". Already fixed, just
flagging it in case you ever see a $0 invoice again after touching that file.

To make payment status sync back automatically (so the therapist dashboard
flips to "paid" the moment a client actually pays, instead of needing the
manual "Mark as Paid" button):

1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) (not
   installed in this environment — `scoop install stripe` or download from
   the releases page on Windows).
2. `stripe login`
3. `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — this
   prints a `whsec_...` value the first time it runs.
4. Put that value in `STRIPE_WEBHOOK_SECRET` in `.env.local`, restart
   `npm run dev`, and leave `stripe listen` running in a second terminal
   during the demo.

Without a real webhook secret, everything else still works — invoices are
real and payable — it just won't auto-flip to "paid" in the app until you
click "Mark as Paid" (client's `/invoice` page falls back to that button
automatically whenever there's no `stripeInvoiceUrl`; the therapist
dashboard's "Mark as Paid" is always available as a manual override
regardless). The webhook signature verification itself (`app/api/webhooks/stripe/route.ts`,
plain Node `crypto`, no `stripe` npm package) was tested directly with a
self-constructed valid signature, a tampered one, and a missing header —
200 / 400 / 400 respectively.

## Demo flow for Monday

1. **Landing page** (`/`) — the pitch.
2. **Sign up as a client** — any email. Land on `/select-role` → click
   "I'm a Client" → `/client-portal`.
3. **Complete intake** (`/intake`) — redirects back to the portal.
4. **Book a session** (`/schedule`) — pick a date, watch real available
   slots load (respecting Therapist Settings' hours/session length/buffer),
   pick a time, confirm. This creates a calendar event (mock or real Meet
   link), a **real Stripe invoice**, and sends a confirmation email (logged
   to the console in mock mode, or check your inbox with Resend configured).
5. **`/client-portal`** now shows the upcoming session, Meet link, reminder
   schedule, and invoice status.
6. **`/invoice`** → click **Pay Now** → real Stripe checkout → pay with
   `4242 4242 4242 4242`. If `stripe listen` is running, watch the status
   flip to "paid" automatically; otherwise use "Mark as Paid" as the manual
   fallback.
7. **Sign out, sign up again with a different email, choose "I'm a
   Therapist"** on `/select-role` — lands on `/therapist-dashboard`. Show
   the seeded demo clients (different states: unpaid, overdue, approved
   note) plus the client you just created.
8. **Open the new client** → paste a fake session transcript into the AI
   note generator → Generate Draft → point out the "never shared with
   client automatically" banner → Approve.
9. **`/therapist-settings`** — change the session rate or hours live, then
   go back to `/schedule` as the client to show availability updating.
10. **Reminder loop** — click "Send Payment Reminder" / "Send Reminder Now"
    on the dashboard to fire a real (or mocked) email.

## Tech

Next.js 16 (App Router, Route Handlers + Server Actions, `proxy.ts`), React
19, TypeScript, Tailwind CSS 4, Clerk auth, Zod validation, date-fns,
React Email + Resend, Groq (via the `openai` SDK) for AI note drafts.
