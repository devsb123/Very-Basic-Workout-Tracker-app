---
name: pm2 env vars on EC2
description: Reliable way to pass environment variables to pm2 on EC2
---

## Rule
Never pass env vars inline to pm2 start. Use `export` for each variable first, then run pm2 start.

**Why:** Inline syntax `NODE_ENV=x PORT=80 DATABASE_URL='...' pm2 start ...` is fragile when DATABASE_URL contains special shell characters. Variables can be silently dropped, causing the server to start on the wrong port or without DB credentials. pm2 info will show "node env: N/A" when this happens.

## How to apply
```bash
export NODE_ENV=production
export PORT=80
export DATABASE_URL='postgresql://user:pass@host/db'
pm2 start /full/path/to/server/bundle.js --name ironlog
pm2 save
```

Also: always use the full absolute path to the script to avoid cwd issues.

## Diagnosing env var problems
- `pm2 info ironlog` — check script path and node env
- `sudo ss -tlnp | grep node` — check what port the process is actually on
- Server defaults to port 3001 when PORT is not set (see server/index.js)
