# Security Policy

## Reporting a vulnerability

Please report security vulnerabilities **privately** by emailing
**prolandself@gmail.com** with `[SECURITY] rushes` in the subject line.

Do **not** open a public GitHub issue or pull request for security bugs.

Include in your report, if possible:
- A short description of the issue and its impact.
- Steps to reproduce (or a proof-of-concept).
- Affected commit / version.

## Response

This is a hobby project, so I cannot guarantee a fixed SLA. I will try to
acknowledge reports within a few days and ship a patch as soon as a fix is
practical. You will be credited in the changelog unless you ask otherwise.

## Scope

In-scope:
- Authentication / authorization bypass.
- Unauthorized data access or mutation (projects, feedback, accounts).
- Cross-site scripting, SSRF, or other injection in the deployed app or
  Convex functions in this repository.
- Secrets accidentally committed to git history.

Out of scope:
- Issues that require a malicious admin account.
- Anything affecting only a local development environment.
- DoS via raw traffic volume against third-party services (ntfy.sh, Vercel, Convex).
