---
name: EC2 deployment strategy
description: How to deploy IronLog to t2.micro without npm install or build steps on EC2
---

## Rule
Never build or npm install on EC2. Pre-build everything in Replit and commit artifacts to git.

**Why:** t2.micro exhausts CPU burst credits quickly. npm install (even for 4 packages) takes 10+ minutes when throttled. Building React/Vite/Tailwind is completely unreliable. The instance is a serve-only box.

## What gets committed to git
- `client/dist/` — React app pre-built via `npm run build` in Replit (vite build: ~3s)
- `server/bundle.js` — server + all deps bundled via `npx esbuild server/index.js --bundle --platform=node --outfile=server/bundle.js --external:pg-native` (~1.3MB)

## How to apply
- On any code change: rebuild in Replit, re-bundle, push to GitHub, `git pull` on EC2, `pm2 restart ironlog`
- On fresh EC2 (terraform apply): user_data clones repo, runs only `npm install -g pm2`, does setcap, starts `server/bundle.js`
- setcap MUST be run before pm2 start: `sudo setcap 'cap_net_bind_service=+ep' "$(readlink -f "$(which node)")"`
