# Contributing to Rushes

Thanks for your interest in contributing!

## Getting Started

1. Fork the repo and clone your fork.
2. Follow the [Quick Start](README.md#quick-start) guide to get a local dev environment running.
3. Create a branch for your change: `git checkout -b feat/my-feature`.

## What Makes a Good Contribution

- **Bug fixes** with a clear description of the problem and how the fix addresses it.
- **Small, focused features** that fit the tool's scope: video review + timestamped client feedback.
- **Documentation improvements** — even a typo fix is welcome.

If you're planning something substantial, open an issue first to discuss the approach.

## Pull Request Guidelines

- Keep PRs focused — one concern per PR.
- Include a short description of *why* the change is needed, not just *what* it does.
- Make sure TypeScript compiles cleanly: `npm run typecheck`. This works without a Convex account. (`npm run lint` additionally deploys to Convex and builds — only needed for a full release check.)
- The UI should work in both the admin and client flows after your change.

## Code Style

- TypeScript throughout. No `any` unless truly unavoidable.
- Tailwind for styling — use existing design tokens (`text-gold`, `bg-bg-card`, etc.) before adding new ones.
- No comments explaining what the code does. Comments are for non-obvious *why*.

## Reporting Bugs

Open a GitHub issue using the **Bug report** template. Include:
- Steps to reproduce
- Expected vs. actual behaviour
- Browser and OS
