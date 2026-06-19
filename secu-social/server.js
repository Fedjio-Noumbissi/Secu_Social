import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function readDB() {
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

const collections = [
  'users', 'assures', 'medecins', 'consultations',
  'prescriptions_medicaments', 'prescriptions_specialistes',
  'feuilles_maladie', 'remboursements',
];

function parseURL(url) {
  const idx = url.indexOf('?');
  const pathname = idx === -1 ? url : url.slice(0, idx);
  const search = idx === -1 ? '' : url.slice(idx + 1);
  const params = {};
  if (search) {
    for (const part of search.split('&')) {
      const [k, v] = part.split('=').map(decodeURIComponent);
      if (k) params[k] = v ?? '';
    }
  }
  return { pathname, params };
}

function apiMatch(pathname) {
  for (const name of collections) {
    const r = new RegExp(`^/api/${name}(?:/([^/]+))?$`);
    const m = pathname.match(r);
    if (m) return { name, id: m[1] || null };
  }
  return null;
}

async function parseBody(req) {
  const bufs = [];
  for await (const chunk of req) bufs.push(chunk);
  const raw = Buffer.concat(bufs).toString('utf-8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function sendJSON(res, data, status = 200, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    ...headers,
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJSON(res, { error: message }, status);
}

function serveStatic(res, filePath) {
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath);
  const content = readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': content.length,
  });
  res.end(content);
  return true;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname, params } = parseURL(req.url);

  // API routes
  const match = apiMatch(pathname);
  if (match) {
    const db = readDB();
    const items = db[match.name] || [];

    if (req.method === 'GET') {
      if (match.id) {
        const item = items.find(i => String(i.id) === match.id);
        if (!item) return sendError(res, 404, 'Not found');
        return sendJSON(res, item);
      }

      let filtered = [...items];
      const { _sort, _page, _per_page, ...filters } = params;

      if (Object.keys(filters).length) {
        filtered = filtered.filter(item =>
          Object.entries(filters).every(([k, v]) => String(item[k]) === String(v))
        );
      }

      if (_sort) {
        const [field, order] = _sort.startsWith('-') ? [_sort.slice(1), 'desc'] : [_sort, 'asc'];
        filtered.sort((a, b) => {
          const va = a[field] ?? '', vb = b[field] ?? '';
          return order === 'desc'
            ? String(vb).localeCompare(String(va))
            : String(va).localeCompare(String(vb));
        });
      }

      const total = filtered.length;
      const page = parseInt(_page) || 1;
      const perPage = parseInt(_per_page) || total;
      const start = (page - 1) * perPage;
      const paged = filtered.slice(start, start + perPage);

      return sendJSON(res, paged, 200, { 'X-Total-Count': total });
    }

    if (req.method === 'POST' && !match.id) {
      const body = await parseBody(req);
      const maxId = items.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0);
      const item = { id: String(maxId + 1), ...body };
      db[match.name] = [...items, item];
      writeDB(db);
      return sendJSON(res, item, 201);
    }

    if (req.method === 'PUT' && match.id) {
      const idx = items.findIndex(i => String(i.id) === match.id);
      if (idx === -1) return sendError(res, 404, 'Not found');
      const body = await parseBody(req);
      db[match.name][idx] = { id: match.id, ...body };
      writeDB(db);
      return sendJSON(res, db[match.name][idx]);
    }

    if (req.method === 'PATCH' && match.id) {
      const idx = items.findIndex(i => String(i.id) === match.id);
      if (idx === -1) return sendError(res, 404, 'Not found');
      const body = await parseBody(req);
      db[match.name][idx] = { ...items[idx], ...body };
      writeDB(db);
      return sendJSON(res, db[match.name][idx]);
    }

    if (req.method === 'DELETE' && match.id) {
      const idx = items.findIndex(i => String(i.id) === match.id);
      if (idx === -1) return sendError(res, 404, 'Not found');
      db[match.name].splice(idx, 1);
      writeDB(db);
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
      res.end();
      return;
    }

    return sendError(res, 405, 'Method not allowed');
  }

  // Static files
  const filePath = pathname === '/' ? path.join(DIST, 'index.html') : path.join(DIST, pathname);
  if (serveStatic(res, filePath)) return;

  // SPA fallback
  if (serveStatic(res, path.join(DIST, 'index.html'))) return;

  sendError(res, 404, 'Not found');
});

server.listen(PORT, () => {
  console.log(`Secu Social running on port ${PORT}`);
});
