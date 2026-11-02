# Restrove — Restaurant POS & Operations Platform

> **Bill Smarter. Serve Faster. Grow Better.**

Live Subdomain: [https://restrove.sriddha.com](https://restrove.sriddha.com)  
Backend Port: `5088` (Isolated VPS Deployment)

---

## Architecture Overview

- **`backend/`**: Node.js + Express/TypeScript API service listening on port **`5088`**. Acts as the unified backend for Web, Android, Desktop, and iOS.
- **`web/`**: Responsive React + Vite + Tailwind CSS Web Management & POS Portal, hosted at `restrove.sriddha.com`.
- **`assets/branding/`**: Master SVG logo assets, app icons, and brand design guidelines.

## Development & Deployment Workflow

1. All features are developed and tested directly on the live VPS environment via Git push/pull.
2. Code is committed locally and pushed to GitHub: `https://github.com/doraswamyraju/restrove.git`.
3. The VPS pulls from `main` and builds/restarts services on port `5088` & Nginx reverse proxy for `restrove.sriddha.com`.

