/**
 * server.js — Spotify token proxy
 *
 * WHY this exists:
 * Spotify's /api/token endpoint does not allow browser (CORS) requests for
 * Client Credentials flow, so we need a tiny Node server that the browser
 * can call. This also keeps your SPOTIFY_CLIENT_SECRET off the frontend.
 *
 * Run with:  node server.js
 * Or via:    npm run dev  (starts both this server AND the React app together)
 */

const express = require('express');
const cors    = require('cors');
require('dotenv').config();   // loads .env into process.env

const app = express();
app.use(express.json());

// Allow requests only from the React dev server (port 3000).
// In production swap the origin to your real domain.
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000' }));

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/token
// The browser asks us for a token; we exchange our credentials with Spotify
// and return the token (but NEVER the secret) to the browser.
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/token', async (req, res) => {
  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Guard: fail fast if the .env file is not set up yet
  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: 'SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing from .env',
    });
  }

  // Spotify requires credentials as Base64("clientId:clientSecret")
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const spotifyRes = await fetch('https://accounts.spotify.com/api/token', {
      method:  'POST',
      headers: {
        Authorization:  `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await spotifyRes.json();

    if (!spotifyRes.ok) {
      // Forward Spotify's error message to the client so it's visible in dev
      return res.status(spotifyRes.status).json({ error: data.error_description || data.error });
    }

    // Return: { access_token, token_type: "Bearer", expires_in: 3600 }
    return res.json(data);

  } catch (err) {
    console.error('[proxy] Token fetch failed:', err.message);
    return res.status(500).json({ error: 'Proxy server could not reach Spotify' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Health-check — useful for deployment checks
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅  Spotify proxy running → http://localhost:${PORT}`);
  console.log(`    Client ID loaded: ${process.env.SPOTIFY_CLIENT_ID ? 'YES' : 'NO ⚠️'}`);
});
