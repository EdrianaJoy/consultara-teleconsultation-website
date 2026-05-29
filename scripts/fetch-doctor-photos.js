'use strict';
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const mapping = require('./doctor-photo-mapping.json');

async function fetchImage(url, dest, attempt = 1) {
  const MAX_ATTEMPTS = 5;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ConsultaraBot/1.0' } });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    await streamPipeline(res.body, fs.createWriteStream(dest));
  } catch (err) {
    if (attempt < MAX_ATTEMPTS) {
      const backoff = 500 * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} for ${url} failed (${err.message}). Retrying in ${backoff}ms...`);
      await new Promise(r => setTimeout(r, backoff));
      return fetchImage(url, dest, attempt + 1);
    }
    throw err;
  }
}

async function main() {
  const outDir = path.join(__dirname, '..', 'public', 'professional-doctors');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const entries = Object.entries(mapping);
  for (const [docId, info] of entries) {
    const queries = info.queries || ['doctor','professional','white coat'];
    const queryString = queries.join(' ');
    // If UNSPLASH_ACCESS_KEY is provided use the official API for reliable licensed images
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_API_KEY;
    let url;
    if (UNSPLASH_KEY) {
      const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(queryString)}&per_page=1&orientation=squarish`;
      try {
        const res = await fetch(apiUrl, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } });
        if (res.ok) {
          const body = await res.json();
          if (body && body.results && body.results.length) {
            // prefer small or regular sized URL
            url = body.results[0].urls.small || body.results[0].urls.regular || body.results[0].urls.raw;
          }
        } else {
          console.warn(`Unsplash API returned ${res.status}, falling back to Source: ${res.statusText}`);
        }
      } catch (err) {
        console.warn('Unsplash API error:', err.message);
      }
    }

    if (!url) {
      // fallback to source.unsplash (less reliable)
      const sourceQuery = queries.map(q => encodeURIComponent(q)).join(',');
      url = `https://source.unsplash.com/400x400/?${sourceQuery}`;
    }
    const dest = path.join(outDir, `${docId}.jpg`);

    // Skip if file already exists
    if (fs.existsSync(dest)) {
      console.log(`${docId} already exists, skipping`);
      continue;
    }

    console.log(`Downloading ${docId} -> ${dest} from ${url}`);
    try {
      await fetchImage(url, dest);
      console.log(`Saved ${docId}`);
    } catch (err) {
      console.error(`Error downloading ${docId}:`, err.message);
    }
    // be polite
    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
