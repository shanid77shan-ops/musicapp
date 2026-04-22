/**
 * pkce.js — PKCE (Proof Key for Code Exchange) helpers
 *
 * PKCE is an OAuth 2.0 extension that makes the Authorization Code flow safe
 * for public clients (SPAs, mobile apps) that cannot keep a client secret.
 *
 * How it works in 3 steps:
 *   1. We generate a random `code_verifier` string and store it locally.
 *   2. We derive a `code_challenge` from it (SHA-256 hash, base64url encoded)
 *      and send it to Spotify with the authorization request.
 *   3. After the user logs in, we send the original `code_verifier` with the
 *      token exchange. Spotify hashes it and checks it matches step 2.
 *      This proves we are the same client that started the flow.
 *
 * Result: No client secret is ever stored in the browser.
 */

/**
 * Generates a cryptographically random code_verifier string.
 * RFC 7636 requires 43–128 characters from an unreserved alphabet.
 *
 * @param {number} length - Length of the verifier (default 64, safe in range)
 * @returns {string} A URL-safe random string
 */
export function generateCodeVerifier(length = 64) {
  // Only unreserved URI characters — safe to send in a URL without encoding
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

  // Fill a byte array with cryptographically random values
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  // Map each byte to a character (modulo keeps us in-alphabet)
  return Array.from(randomBytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

/**
 * Derives the code_challenge from the verifier.
 * Algorithm: base64url( SHA-256( ASCII(code_verifier) ) )
 *
 * @param {string} verifier - The code_verifier from generateCodeVerifier()
 * @returns {Promise<string>} The challenge to send to Spotify
 */
export async function generateCodeChallenge(verifier) {
  // Encode the verifier string as UTF-8 bytes
  const encoded = new TextEncoder().encode(verifier);

  // SHA-256 hash via the Web Crypto API (available in all modern browsers)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);

  // Convert the ArrayBuffer to a base64 string, then make it URL-safe:
  //   + → -    / → _    trailing = stripped
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
