// Real-Chrome check of Bugle Ridge (no dependencies; Node 22+ WebSocket + DevTools protocol).
// Serves www/, loads the game in a phone-sized headless Chrome, captures JS errors, renders every sprite pose,
// drives a scripted tour through every scene of every chapter with the real canvas, and saves screenshots.
const { spawn } = require('child_process');
const http = require('http'), fs = require('fs'), path = require('path');
// node tools/test/chromecheck.js [outDir]   (ONLY=step1,step2 runs just those steps)
const ROOT = path.resolve(__dirname, '../../www'), OUT = process.argv[2] || '/tmp/bugle-shots', PORT = 8791, DBG = 9341;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(PORT, '127.0.0.1');
const profile = fs.mkdtempSync('/tmp/brcheck-');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${DBG}`, '--window-size=412,892', 'about:blank'], { stdio: 'ignore' });
const done = code => { try { chrome.kill('SIGKILL'); } catch (_) {} server.close(); try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {} process.exit(code); };
setTimeout(() => { console.log('TIMEOUT'); done(2); }, 590000);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let target;
  for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = await (await fetch(`http://127.0.0.1:${DBG}/json/new?about:blank`, { method: 'PUT' })).json(); } catch (_) {} }
  if (!target) { console.log('no devtools'); return done(1); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0; const pending = {}, errors = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  };
  const send = (method, params) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => { ws.onopen = r; });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 892, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
  await sleep(2500);
  const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception ? r.result.exceptionDetails.exception.description : JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.result.data, 'base64')); };
  const script = fs.readFileSync(path.join(__dirname, 'chrometour.js'), 'utf8');
  await ev(script);
  const steps = (await ev('window.TOUR.list()')).filter(s => !process.env.ONLY || process.env.ONLY.split(',').includes(s));
  const report = [];
  for (const s of steps) {
    try { const out = await ev(`window.TOUR.run(${JSON.stringify(s)})`); await sleep(120); if (out && out.shot) await shot(out.shot); report.push(`ok   ${s}${out && out.note ? ' · ' + out.note : ''}`); }
    catch (e) { report.push(`FAIL ${s}: ${String(e.message).split('\n')[0]}`); }
  }
  console.log(report.join('\n'));
  console.log('page errors:', errors.length ? '\n' + errors.slice(0, 15).join('\n') : 'none');
  done(errors.length || report.some(r => r.startsWith('FAIL')) ? 1 : 0);
})().catch(e => { console.log('ERR', e); done(1); });
