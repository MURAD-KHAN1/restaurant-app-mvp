/* global __dirname */
// Verifies the real npm dev command without changing the private .env.
const assert = require('node:assert/strict');
const { spawn, execFileSync } = require('node:child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');
async function run() {
  const db = await MongoMemoryServer.create();
  let child;
  try {
    child = spawn('cmd.exe', ['/d', '/c', 'npm.cmd run dev'], {
      cwd: require('node:path').resolve(__dirname, '..'),
      env: { ...process.env, MONGO_URI: db.getUri('restaurant_app'), PORT: '5054' },
      windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Dev startup timed out')), 20000);
      const check = data => {
        if (String(data).includes('Server running at http://localhost:5054')) {
          clearTimeout(timeout); resolve();
        }
      };
      child.stdout.on('data', check);
      child.on('error', error => { clearTimeout(timeout); reject(error); });
    });
    assert(output.includes('MongoDB connected'));
    assert(output.includes('node server.js'));
    assert(!output.includes('node server.js index.js'));
    const response = await fetch('http://localhost:5054/api/health');
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'ok');
    console.log(output.trim());
    console.log('PASS: npm run dev starts only server.js; MongoDB connects; health returns 200. Temporary port 5054 used.');
  } finally {
    if (child && child.pid) execFileSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
    await db.stop();
  }
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
