const ORIGIN = 'https://tmumiyekzgafawxdwgxm.supabase.co';
const KEY = 'sb_publishable_xrQK9pXy3KTvazSmbHScGg_QvHyScNw';
const METHODS = new Set(['GET', 'POST', 'PATCH', 'DELETE', 'PUT']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!METHODS.has(req.method)) return res.status(405).end('Method not allowed');
    const path = new URL(req.url, 'https://localhost').searchParams.get('path') || '';
    if (path.length > 3000 || !/^\/(auth|rest)\/v1\//.test(path) || path.includes('\\')) {
      return res.status(400).end('Invalid path');
    }
    const target = new URL(path, ORIGIN);
    if (target.origin !== ORIGIN || !/^\/(auth|rest)\/v1\//.test(target.pathname)) {
      return res.status(400).end('Invalid target');
    }
    const headers = new Headers({ apikey: KEY });
    for (const name of ['authorization', 'content-type', 'accept', 'prefer', 'range', 'accept-profile', 'content-profile', 'x-client-info']) {
      const value = req.headers[name];
      if (typeof value === 'string') headers.set(name, value);
    }
    if (!headers.has('authorization')) headers.set('authorization', 'Bearer ' + KEY);
    let body;
    if (req.method !== 'GET') {
      if (Buffer.isBuffer(req.body)) body = req.body;
      else if (typeof req.body === 'string') body = Buffer.from(req.body);
      else if (req.body !== undefined) body = Buffer.from(JSON.stringify(req.body));
      else {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 1048576) return res.status(413).end('Too large');
          chunks.push(chunk);
        }
        body = Buffer.concat(chunks);
      }
      if (body.length > 1048576) return res.status(413).end('Too large');
    }
    const upstream = await fetch(target, {
      method: req.method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(12000)
    });
    res.status(upstream.status);
    for (const name of ['content-type', 'location']) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    console.error('Gateway request failed:', error?.message);
    res.status(502).json({ message: 'Сервер временно недоступен' });
  }
}
