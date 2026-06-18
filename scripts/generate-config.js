/**
 * Generates js/config.js from environment variables.
 * Used by Cloudflare Pages build (see docs/DEPLOY.md).
 */
const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || 'https://bcnhmrvylpkocetfqidh.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!anonKey) {
  console.error('SUPABASE_ANON_KEY is required');
  process.exit(1);
}

const outDir = path.join(__dirname, '..', 'js');
fs.mkdirSync(outDir, { recursive: true });

const content = `window.SUPABASE_CONFIG = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)},
};
`;

fs.writeFileSync(path.join(outDir, 'config.js'), content, 'utf8');
console.log('Generated js/config.js');
