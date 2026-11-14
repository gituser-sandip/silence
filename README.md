# SOULVÉ

Golden Perfume House is a React fragrance storefront with an Express API. It includes a searchable and filterable catalogue, persistent bag, gated checkout summary, scent finder, fragrance guide, FAQs, consented customer stories, verified-buyer reviews, contact workflow, newsletter preferences, trust and policy pages, order tracking, and protected staff operations. The public site begins with a scroll-driven 3D composition and includes a static reduced-motion presentation.

## Run locally

Install dependencies in `client` and `server` with `npm install`. Copy `server/.env.example` to `server/.env` and set the verified business details plus a long random `ADMIN_API_KEY`. Start the API with `cd server && npm start` and the Vite development server with `cd client && npm start`. Visit `http://localhost:3000`.

Local development stores orders, product overrides, stories, messages and newsletter preferences in `server/data/` if `MONGODB_URI` is unset. This directory is ignored by Git. For a hosted production site, set `MONGODB_URI` to a persistent MongoDB database. The API rejects writes in production when no database is configured.

## Order workflow

1. A visitor selects a fragrance and opens a prefilled WhatsApp enquiry.
2. After confirming the order in WhatsApp, staff sign in at `/admin` with `ADMIN_API_KEY`, create an order, and share its generated `SL-XXXXXXXX` code with the customer.
3. Staff update the status in `/admin`. Customers enter their code and registered phone number at `/track` to view progress.

Supplier-dependent fields start unverified and unavailable. Staff can configure verified bottle sizes, prices and stock at `/admin/operations`; public purchase controls remain hidden until those fields are verified. Live payment remains deliberately disabled until a provider, delivery calculation, notifications and refunds are implemented and tested end to end. A WhatsApp link is shown only when `WHATSAPP_NUMBER` is configured.

## Client stories

Use `/admin` to add text quotes or direct HTTPS URLs to audio/video files. Mark a story approved only after receiving permission to publish it. Visitors may submit stories with explicit permission; they remain private until staff approval. Verified-buyer reviews require a matching delivered order. Media files need to be hosted at a stable, browser-accessible URL.

## Production

The included `vercel.json` builds the React app and routes `/api/*` to Express. Configure the variables documented in `server/.env.example` in the hosting project. Do not put the admin key in any React build variable. For a single-server deployment, run `npm run build` from the repository root and then `npm start`; Express serves `client/build` when present.
