/**
 * kill-port.mjs
 * Kills any process listening on PORT (default 3000) before starting the dev server.
 * Works on Windows (netstat + taskkill) and Unix (lsof + kill).
 */
import { execSync } from 'node:child_process';

const PORT = process.env.PORT || '3000';

function killWindows(port) {
  try {
    const out = execSync(`netstat -ano`, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
    const lines = out.split('\n').filter(l => l.includes(`:${port}`) && l.includes('LISTENING'));
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== '0') {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`[kill-port] Killed PID ${pid} on port ${port}`);
        } catch {
          // already gone
        }
      }
    }
  } catch {
    // netstat not available or no match
  }
}

function killUnix(port) {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
    const pids = out.trim().split('\n').filter(Boolean);
    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`[kill-port] Killed PID ${pid} on port ${port}`);
      } catch {
        // already gone
      }
    }
  } catch {
    // lsof not available or no match
  }
}

if (process.platform === 'win32') {
  killWindows(PORT);
} else {
  killUnix(PORT);
}

// Small delay to ensure the port is fully released before NestJS binds
await new Promise(resolve => setTimeout(resolve, 400));
console.log(`[kill-port] Port ${PORT} is clear.`);
