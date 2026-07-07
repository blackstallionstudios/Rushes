# Rushes

**A client video review and feedback platform for filmmakers.**

Share a private link to your latest cut, let clients leave star ratings and timestamped notes tied to exact moments in the video, and get a push notification the instant their feedback lands. No accounts for clients — just a link.

---

## Is this for me?

**For studios:** Rushes needs a one-time technical setup (about 20 minutes, following the guide below). Once deployed, the day-to-day admin dashboard requires no technical skill — create a project, paste a link, share it. If your team doesn't have someone comfortable with a terminal, ask a developer friend to do the initial deploy for you.

**For developers:** React 19 + Vite frontend, [Convex](https://convex.dev) backend. The codebase is small and well-structured — see [Project Structure](#project-structure). Run `npm run typecheck` to check your changes; it works without a live Convex account.

---

## Features

- **Project dashboard** — create, edit, and delete video review projects from a PIN-protected admin page
- **Video embedding** — supports YouTube and Vimeo URLs out of the box
- **Timestamped feedback** — clients reference exact moments (`0:32`, `1:45`) alongside a comment
- **Star ratings** — 1–5 star overall rating per submission
- **Download links** — attach any file-transfer URL (Smash, WeTransfer, Google Drive, etc.) with an automatic expiry date; clients lose the button after it expires
- **Push notifications** — receive an [ntfy.sh](https://ntfy.sh) notification with a summary the moment a client submits feedback
- **Dark, cinematic UI** — Playfair Display headings, gold accents, subtle grain texture, neumorphic shadows

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Backend / DB | [Convex](https://convex.dev) |
| Styling | Tailwind CSS v3 |
| Auth | PIN-based admin login |
| Notifications | [ntfy.sh](https://ntfy.sh) (optional) |
| Deployment | Vercel (frontend) + Convex Cloud (backend) |

---

## Setup

### What you'll need

- **Node.js 18+** — download from [nodejs.org](https://nodejs.org) (choose the LTS version)
- **A free [Convex](https://convex.dev) account** — this is the database and backend
- **A free [Vercel](https://vercel.com) account** — this hosts the web app
- **(Optional) An [ntfy.sh](https://ntfy.sh) topic** — for push notifications on your phone when feedback lands

### 1. Get the code

**Option A — with git:**
```bash
git clone https://github.com/your-org/rushes.git
cd rushes
```

**Option B — without git:**
Download the ZIP from the GitHub page (green **Code** button → **Download ZIP**), unzip it, and open a terminal in the resulting folder.

### 2. Install dependencies

```bash
npm install
```

### 3. Initialise Convex

```bash
npx convex dev
```

This opens a browser to log in to Convex (or create a free account). Once logged in, it creates a new project and writes a `.env.local` file automatically — you don't need to touch that file.

**Leave this terminal running** while you do the next step.

### 4. Set your admin PIN and other settings

In a new terminal window, open the Convex dashboard:

```bash
npx convex dashboard
```

Navigate to **Settings → Environment Variables** and add:

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PIN` | **Yes** | The PIN you'll use to log in to the admin dashboard. Pick something memorable but not trivial. |
| `NTFY_TOPIC` | No | Your ntfy.sh topic name (e.g. `my-studio-alerts`). Download the ntfy app and subscribe to this topic to get phone notifications. |
| `APP_URL` | No | Your deployed app's public URL (e.g. `https://rushes.example.com`). Set this after deploying to Vercel. It adds a one-tap "Open Admin" button in notifications. |

### 5. Try it locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You'll be redirected to `/admin` and prompted for the PIN you just set.

---

## Deploying (Vercel + Convex Cloud)

The Convex backend is already running in the cloud from step 3 — this step only deploys the web frontend.

1. Push your copy of the code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), click **Add New Project**, and import that repository. Vercel auto-detects Vite — no build settings need changing.
3. In Vercel's **Environment Variables** settings for the project, add:
   - `VITE_CONVEX_URL` — copy the value from your `.env.local` file
4. Click **Deploy**.
5. Once deployed, copy the URL Vercel gives you (e.g. `https://rushes-abc123.vercel.app`) and add it as `APP_URL` in your Convex dashboard's environment variables.

Your admin dashboard is at `your-url.vercel.app/admin`. Client review links look like `your-url.vercel.app/project/<id>` — the app generates these for you in the dashboard.

---

## Day-to-day usage

### Admin

1. Go to your app URL — you'll land on the admin dashboard after entering your PIN.
2. Click **+ New Project** and fill in:
   - **Project title** — shown to the client (e.g. "Brand Film — Cut 3")
   - **Video URL** — YouTube or Vimeo link to your cut
   - **Download link** *(optional)* — any file-transfer URL; clients see a download button
   - **Download expiry date** — defaults to 7 days; the button disappears after this date
   - **Message to client** *(optional)* — a brief note shown above the video
3. Click **Copy Link** to copy the client URL.
4. Send that link directly to your client — no login required on their end.
5. Click **View Feedback** to read all submissions for a project.

### Client

1. Open the link you sent them.
2. Watch the video.
3. Enter their name, pick a star rating, and optionally add timestamped notes (with a timecode like `1:23`) or general comments.
4. Click **Submit Feedback**.

---

## Project Structure

```
rushes/
├── convex/                       # Backend: Convex functions & schema
│   ├── schema.ts                 # Database tables (projects, feedback)
│   ├── projects.ts               # CRUD for projects
│   ├── feedback.ts               # Feedback submission + notification trigger
│   ├── notifications.ts          # ntfy.sh push notification (Node.js runtime)
│   ├── admin.ts                  # PIN verification
│   └── auth.ts                   # Convex Auth HTTP routes
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx    # Project management UI
│   │   ├── AdminLogin.tsx        # PIN login screen
│   │   ├── ClientView.tsx        # Client-facing review page
│   │   ├── DownloadButton.tsx    # File download link with expiry logic
│   │   ├── FeedbackForm.tsx      # Timestamped notes + star rating form
│   │   ├── ConfirmationScreen.tsx
│   │   ├── ProjectFeedbackView.tsx
│   │   └── VideoEmbed.tsx        # YouTube / Vimeo embed
│   ├── lib/
│   │   ├── downloadExpiry.ts     # Download link expiry helpers
│   │   └── utils.ts              # cn() + external URL normalizer
│   └── pages/
│       ├── AdminPage.tsx
│       ├── ProjectPage.tsx
│       └── NotFoundPage.tsx
├── .env.example                  # Documents all environment variables
└── package.json
```

---

## Contributing

Pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Key commands for contributors:

```bash
npm run dev          # Start frontend + Convex backend together
npm run typecheck    # TypeScript check — works without a Convex account
npm run lint         # Full check including Convex deploy (requires credentials)
```

---

## Environment Variables Reference

### `.env.local` — local development only, never committed

| Variable | Description |
|---|---|
| `CONVEX_DEPLOYMENT` | Auto-set by `npx convex dev` |
| `VITE_CONVEX_URL` | Auto-set by `npx convex dev` |

### Convex dashboard — Settings → Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PIN` | Yes | PIN for the admin dashboard |
| `NTFY_TOPIC` | No | ntfy.sh topic name |
| `APP_URL` | No | Public app URL — enables the "Open Admin Portal" action in notifications |

---

## License

MIT — see [LICENSE](LICENSE) for details.
