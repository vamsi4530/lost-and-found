# AI-Based Lost & Found Matcher

A full-stack college project prototype with a responsive React UI, Express REST API, SQLite database, JWT authentication, user/admin roles, image uploads, notifications, and weighted lost/found matching.

## Requirements
- Node.js 20, 22, or 24 and npm
- Internet connection for first-time dependency install and Google Fonts / demo fallback image loading

## Run locally
1. Extract this folder.
2. Open a terminal inside `lost-found-ai`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The API runs on `http://localhost:4000`.

The SQLite database (powered by sql.js WebAssembly, with no native C++ compilation required) is created automatically at `server/data/lost-found.sqlite`; sample data is seeded on first run.

## Demo accounts
- User: `demo@lostfound.demo` / `Demo@123`
- Admin: `admin@lostfound.demo` / `Admin@123`

New users can register from the login page. Admin accounts should never be self-registered; the seeded demo admin is for presentation only.

## What works
- Home page, responsive navigation, item search and filters
- Lost/found reporting with image upload (5 MB limit)
- Persistent SQLite database (sql.js/WebAssembly; avoids `better-sqlite3` native build failures on Windows and Node.js 24) for users, reports, matches and notifications
- JWT login and registration, role-protected admin overview
- Dashboard, notifications and report status management
- Weighted matching prototype combining name/text, category, color, location, date and an image proxy score
- Seeded sample lost/found items to demonstrate matching

## Matching prototype notes
The matcher uses a transparent weighted score: image proxy 15%, description text 25%, name similarity 15%, category 20%, color 10%, location 10%, and date proximity 5%. The image factor is only a prototype proxy based on image presence and related metadata, **not actual computer vision**. A production version should use an image embedding model and cosine similarity, plus moderation and abuse-prevention workflows.

## API summary
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/items`, `POST /api/items/lost`, `POST /api/items/found`
- `GET /api/items/:type/:id`
- `GET /api/dashboard`, `GET /api/notifications`, `POST /api/notifications/:id/read`
- `GET /api/admin/overview`, `PATCH /api/admin/items/:type/:id`

## Before public deployment
- Set a strong `JWT_SECRET` environment variable.
- Restrict CORS to your frontend origin and configure the frontend API URL.
- Use HTTPS, stronger upload validation / malware scanning, rate limits, email verification, and proper private messaging.
- Add ownership-aware report editing/deletion, moderation, audit logs, and production-grade computer vision.
- The current contact button is a safe prototype acknowledgement, not a live chat service.
