# FlowDesk — Twig implementation

This folder contains a minimal PHP + Twig port of the FlowDesk demo. The UI and client-side behavior are reproduced with Twig templates and a small vanilla JS layer; tickets are persisted in `localStorage`.

## Quick start

```bash
cd ticket-management-twig
composer install
php -S localhost:8000 -t public
```

Open http://localhost:8000 in your browser.

## Frameworks & libraries

- PHP
- Twig (templating)
- Tailwind CSS (included via CDN in templates)

## What this implementation includes

- Landing page with wave SVG hero and decorative elements.
- Login and Signup pages with inline validation (client-side) and toast notifications.
- Dashboard and Tickets pages with CRUD powered by a small vanilla JS module.
- Client-side protected-route guard that checks `ticketapp_session`.

## App structure and key files

- `templates/` — Twig templates (base, landing, dashboard, tickets, auth pages).
- `public/assets/js/tickets.js` — localStorage-backed tickets API and (migration to remove legacy `priority`).
- `public/assets/js/app.js` — page glue for rendering tickets, forms, toasts and client-side guards.
- `public/assets/js/auth.js` — updated to use `ticketapp_session` for session storage.

## State and data

- Session token: `localStorage` key `ticketapp_session` (string).
- Tickets: stored under `ticketapp_tickets` as an array. Ticket shape matches React/Vue versions.

## Validation & accessibility

- Title and status are required; status must be one of: `open`, `in_progress`, `closed`.
- Inline error messages and toast feedback are implemented in vanilla JS.
- Uses semantic HTML in templates, visible focus states via Tailwind, and responsive layout.

## Test credentials

- Example test account:
  - Email: `test@example.com`
  - Password: `password123`

## Known issues & notes

- Demo uses browser `localStorage` — no backend.
- A migration exists in `public/assets/js/tickets.js` to remove a legacy `priority` field from stored tickets.

