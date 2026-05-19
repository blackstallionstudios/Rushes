# Rushes

A small video-review portal for indie production studios. Admins create a
project (with an embedded YouTube/Vimeo video and an optional Smash download
link), share a single-purpose link with a client, and collect a star rating
plus timestamped notes back. Built as a Vite + React + TypeScript frontend on
top of a Convex backend.

## Architecture

- **Frontend** — Vite + React 19 + TypeScript + Tailwind 3, deployed to
  Vercel. Routing via `react-router-dom` v7.
- **Backend** — Convex (functions in `convex/`). Real-time queries, mutations,
  one scheduled action for push notifications.
- **Auth** — Convex Auth, single-admin model. Sign-up is gated server-side to
  the one email configured as `ADMIN_EMAIL`; every other address is rejected
  at the `Password` provider's `profile` callback.
- **Access control** — admin actions are gated by `requireAdmin(ctx)` (see
  [convex/lib/admin.ts](convex/lib/admin.ts)). The only public Convex
  functions are `projects:getProjectByShareToken` (read-only, looks up a
  project by an unguessable 192-bit token) and `feedback:submitFeedback`
  (rate-limited per token).
- **Client links** — `/share/:shareToken`. Tokens are 24 random bytes
  base64url-encoded, generated server-side, rotatable from the dashboard.

## Setup

You need Node 20+, a Convex account, and (optionally) an [ntfy.sh](https://ntfy.sh)
topic for push notifications.

1. **Clone and install**
   ```sh
   git clone <your fork> rushes && cd rushes
   npm install
   ```

2. **Initialise Convex**
   ```sh
   npx convex dev
   ```
   This creates `.env.local` with `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL`.

3. **Configure secrets on the Convex deployment**
   Open the Convex dashboard → your project → Settings → Environment
   variables. Set:

   | Var          | Required | Notes |
   | ------------ | -------- | ----- |
   | `ADMIN_EMAIL` | yes | The single email permitted to sign up / sign in. |
   | `SITE_URL`   | yes | Public origin, e.g. `https://rushes.example.com`. Used in ntfy "Open admin" links. |
   | `NTFY_TOPIC` | optional | A 24+ random-byte topic name on ntfy.sh. **Treat as a secret** — ntfy.sh is a public broadcast service and anyone who learns the topic name sees all feedback notifications. Leave blank to disable. |

   See [`.env.example`](.env.example) for the canonical list.

4. **Run the dev server**
   ```sh
   npm run dev
   ```
   Visit `http://localhost:5173/admin`. Click "First-time setup? Create the
   admin account" and use the email matching `ADMIN_EMAIL`. After that, sign
   in normally — sign-up will reject any other email.

5. **Build**
   ```sh
   npm run lint  # tsc + convex deploy check + vite build
   ```

## Production deployment

1. Push to a GitHub branch. Convex's Vercel integration creates an isolated
   preview deployment with its own Convex backend.
2. Verify against the preview URL — see [Verification](#verification) below.
3. Merge. Vercel + Convex deploy production.

> The Convex CLI keeps old functions deployed until the next `convex deploy`.
> When you remove a function from this repo, the action stays callable on
> your deployment until you push. After deletes, open the Convex dashboard
> Functions list and confirm the function is gone.

## Verification

Run against a preview deployment, not production:

- Open the deployed site signed out and try, from the browser console,
  `await convex.mutation("projects:createProject", {...})`. It must throw
  `Unauthorized`. Same for `updateProject`, `deleteProject`, `listProjects`,
  `getProject`.
- Sign in as the admin, create a project, click "Copy Link", open the URL
  in a private window, submit feedback. The admin view should reflect it
  in real time.
- Click "Rotate Link" on a project. The old `/share/<old>` URL must show
  the "invalid or revoked" screen; the new one works.
- Hit any old `/project/:projectId` URL. It should resolve to the current
  `/share/<token>` via the legacy redirect (mounted for 30 days; see
  [src/pages/LegacyProjectRedirect.tsx](src/pages/LegacyProjectRedirect.tsx)).
- Spam `submitFeedback` 15 times from the same token in under 10 minutes;
  the 11th call should reject with "Too many submissions".

## One-time migration

If you are upgrading an existing deployment that pre-dates share tokens,
run the backfill once after `convex deploy`:

```sh
npx convex run migrations/backfillShareTokens:run
```

Then delete `convex/migrations/backfillShareTokens.ts` and redeploy.

## Open-source

Released under [AGPL-3.0](LICENSE). If you deploy a modified version, your
modifications must be made available under the same license — see the
license text for the exact requirements.

For security reports, see [SECURITY.md](SECURITY.md). Please do not file
public issues for vulnerabilities.

## Acknowledgements

Built by Black Stallion Studios. The Convex auth scaffolding follows the
patterns in [the Convex Auth docs](https://labs.convex.dev/auth).
