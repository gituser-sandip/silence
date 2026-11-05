# SOULVÉ

SOULVÉ is a React fragrance storefront with an Express API. Its story connects scent, memory, emotion, and the human soul under the line “More Than a Scent, It's a Feeling.” The public site begins with a scroll-driven 3D composition: bergamot, rose, sandalwood, and amber enter individually and fill a perfume bottle. It also includes a price-free catalogue, customer stories, and order tracking. WhatsApp enquiries remain disabled until a business number is configured. The 3D scene has a static reduced-motion presentation. Staff can create and update orders and publish approved text, audio, and video stories at `/admin`.

## Run locally

Install dependencies in `client` and `server` with `npm install`. Copy `server/.env.example` to `server/.env` and set `WHATSAPP_NUMBER` and a long random `ADMIN_API_KEY`. Start the API with `cd server && npm start` and the Vite development server with `cd client && npm start`. Visit `http://localhost:3000`.

Local development stores orders and stories in `server/data/` if `MONGODB_URI` is unset. This directory is ignored by Git. For a hosted production site, set `MONGODB_URI` to a persistent MongoDB database. The API rejects order and story operations in production when no database is configured.

## Order workflow

1. A visitor selects a fragrance and opens a prefilled WhatsApp enquiry.
2. After confirming the order in WhatsApp, staff sign in at `/admin` with `ADMIN_API_KEY`, create an order, and share its generated `SL-XXXXXXXX` code with the customer.
3. Staff update the status in `/admin`. Customers enter their code and registered phone number at `/track` to view progress.

The storefront never displays a product price. The API product responses contain no price field. A WhatsApp link is shown only when `WHATSAPP_NUMBER` is configured.

## Client stories

Use `/admin` to add text quotes or direct HTTPS URLs to audio/video files. Mark a story approved only after receiving permission to publish it. The public page shows clearly labelled empty states until an approved story exists. Media files need to be hosted at a stable, browser-accessible URL.

## Production

The included `vercel.json` builds the React app and routes `/api/*` to Express. Configure `WHATSAPP_NUMBER`, `ADMIN_API_KEY`, and `MONGODB_URI` as server environment variables in the hosting project. Do not put the admin key in any React build variable. For a single-server deployment, run `npm run build` from the repository root and then `npm start`; Express serves `client/build` when present.
