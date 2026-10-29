const { WebSocketServer } = require('ws');
const fs = require('fs'), path = require('path');
const PORT = +process.env.PORT || 8080;
const lvl = JSON.parse(fs.readFileSync(process.env.LEVEL || path.join(__dirname, '../web/level.json')));
const wss = new WebSocketServer({ port: PORT, host: '127.0.0.1', maxPayload: 512 });
const P = new Map(), taken = new Map();
let nid = 1;
const num = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d);

wss.on('connection', ws => {
  const id = nid++;
  const p = { id, n: 'Pemain' + id, x: lvl.spawn[0], y: lvl.spawn[1], f: 1, a: 0, sc: 0, h: Math.floor(Math.random() * 360) };
  P.set(id, p); ws.alive = true;
  ws.send(JSON.stringify({ t: 'w', id, h: p.h }));
  ws.on('pong', () => (ws.alive = true));
  ws.on('message', m => {
    let d; try { d = JSON.parse(m); } catch { return; }
    if (d.t === 'j') p.n = String(d.n || '').replace(/[^\w \-]/g, '').slice(0, 12) || p.n;
    else if (d.t === 's') { p.x = num(d.x, -50, 1400, p.x); p.y = num(d.y, -100, 400, p.y); p.f = d.f < 0 ? -1 : 1; p.a = num(d.a, 0, 2, 0) | 0; }
    else if (d.t === 'c') {
      const i = d.i | 0, c = lvl.coins[i];
      if (c && !taken.has(i) && Math.hypot(p.x + 5 - c[0], p.y + 7 - c[1]) < 48) { taken.set(i, Date.now()); p.sc++; }
    }
  });
  ws.on('close', () => P.delete(id));
  ws.on('error', () => {});
});

setInterval(() => {
  const now = Date.now();
  for (const [i, t] of taken) if (now - t > 8000) taken.delete(i);
  const msg = JSON.stringify({ t: 'p', p: [...P.values()].map(q => [q.id, q.n, q.x, q.y, q.f, q.a, q.sc, q.h]), k: [...taken.keys()] });
  wss.clients.forEach(c => c.readyState === 1 && c.send(msg));
}, 50);

setInterval(() => wss.clients.forEach(c => { if (!c.alive) return c.terminate(); c.alive = false; c.ping(); }), 30000);
console.log('Pixel Run server di 127.0.0.1:' + PORT);
