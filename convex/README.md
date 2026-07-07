# Convex Backend

This directory contains all Rushes backend logic, running on [Convex](https://convex.dev).

## Files

| File | Purpose |
|---|---|
| `schema.ts` | Database schema — `projects` and `feedback` tables |
| `projects.ts` | CRUD mutations and queries for projects |
| `feedback.ts` | Feedback submission mutation (saves record + fires notification) |
| `notifications.ts` | ntfy.sh push notification action (Node.js runtime) |
| `admin.ts` | PIN verification action |
| `auth.ts` | Convex Auth configuration |
| `auth.config.ts` | Auth provider config |
| `http.ts` | HTTP router (auth endpoints) |
| `router.ts` | Convex router setup |

## Environment Variables

Set these in the Convex dashboard under **Settings → Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PIN` | Yes | PIN checked on every admin login |
| `NTFY_TOPIC` | No | ntfy.sh topic name for push notifications |
| `APP_URL` | No | Public app URL — adds an "Open Admin Portal" action button to notifications |

## Generated Files

`convex/_generated/` is committed to the repo so TypeScript type-checking works in CI without running `npx convex dev` first. These files are automatically regenerated on every `npx convex dev` or `npx convex deploy` run — do not edit them by hand.

## Local Development

```bash
npx convex dev
```

This watches for changes and automatically pushes functions to your dev deployment.

## Useful Commands

```bash
npx convex dashboard   # Open the Convex dashboard
npx convex logs        # Stream function logs
npx convex data        # Browse your database tables
```
