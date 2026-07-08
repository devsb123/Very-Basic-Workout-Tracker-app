# IronLog — Developer Guide

Personal reference for using, updating, and maintaining IronLog.

---

## Live app

**URL:** http://98.92.147.153 (EC2 public IP)

**SSH into EC2:**
```bash
ssh -i ~/.ssh/ironlog-key.pem ec2-user@98.92.147.153
```

---

## How the deployment works

The t2.micro EC2 instance is too small to run npm install or build the React app reliably. Instead:

- `client/dist/` — the pre-built React frontend — is committed to git
- `server/bundle.js` — the backend + all its dependencies bundled into one file — is committed to git

EC2 just clones the repo and runs `node server/bundle.js`. No npm, no build tools needed on the server.

---

## Making code changes

### Frontend changes (React/UI)

1. Edit files under `client/src/`
2. Rebuild the frontend:
   ```bash
   npm run build
   ```
3. Re-bundle the backend (always do this together with the frontend build):
   ```bash
   npx esbuild server/index.js --bundle --platform=node --outfile=server/bundle.js --external:pg-native
   ```
4. Push to GitHub (from the Replit Shell tab):
   ```bash
   git add -A && git commit -m "describe your change" && git push
   ```
5. Deploy to EC2:
   ```bash
   ssh -i ~/.ssh/ironlog-key.pem ec2-user@98.92.147.153
   cd /home/ec2-user/app && git pull && pm2 restart ironlog
   ```

### Backend changes (API/database)

Same steps as above — always rebuild and re-bundle before pushing.

### Backend-only change (no frontend change)

You can skip `npm run build` and just re-bundle + push + restart.

---

## Checking if the app is healthy on EC2

```bash
# Is the process running?
pm2 status

# Recent logs (errors and output)
pm2 logs ironlog --lines 30 --nostream

# What port is it actually on? (should be 80)
sudo ss -tlnp | grep node
```

---

## Restarting the app on EC2

```bash
pm2 restart ironlog
```

If pm2 restart doesn't work (e.g. env vars got lost), do a full restart:

```bash
pm2 delete ironlog
export NODE_ENV=production
export PORT=80
export DATABASE_URL='postgresql://ironlog_admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT/ironlog'
pm2 start /home/ec2-user/app/server/bundle.js --name ironlog
pm2 save
```

**Important:** Always run `export` for each variable separately — never put them all on one line with the pm2 command. The single-line approach silently drops the env vars.

**Important:** `setcap` must be run if the EC2 instance was rebooted or re-provisioned, or if Node was updated:
```bash
sudo setcap 'cap_net_bind_service=+ep' "$(readlink -f "$(which node)")"
```
This allows Node to bind port 80 without running as root.

---

## AWS infrastructure

All infrastructure lives in `terraform/` and was applied via Terraform. **Never modify it manually in the AWS console** — always use Terraform so the state stays in sync.

### Check Terraform outputs (RDS endpoint, EC2 IP, etc.)

```bash
cd terraform
terraform output
```

### Make an infrastructure change

Edit the relevant `.tf` file, then:

```bash
terraform plan   # preview what will change
terraform apply  # apply it
```

### Tear everything down (stops all AWS charges)

```bash
terraform destroy
```

### AWS credentials

Profile: `ironlog-admin` (SSO via IAM Identity Center). If your SSO session expires:

```bash
aws sso login --profile ironlog-admin
```

---

## Local development in Replit

The app runs in two workflows:

- **Backend API** — runs `npm run dev` (Node/Express on port 3001)
- **Start application** — runs `npm run dev --prefix client` (Vite on port 5173)

Both start automatically. The Vite dev server proxies `/api` requests to the backend so everything works without CORS issues.

---

## Adding a new exercise tab (e.g. "Cardio")

1. In `server/index.js`, add `"cardio"` to the `VALID_TABS` array
2. In `client/src/App.jsx` (or wherever the tabs are defined), add the new tab
3. Rebuild, re-bundle, push, and restart (see "Making code changes" above)

The database table (`sets`) already has a `tab` column that accepts any value, so no schema change is needed.

---

## Adding a new data field

1. Update the database schema in `server/db.js` (the `initSchema` function)
   - Note: `initSchema` only runs `CREATE TABLE IF NOT EXISTS`, so it won't add columns to an existing table. For adding columns to a live table, you need to run an `ALTER TABLE` manually in the RDS database.
2. Update the relevant API route in `server/index.js`
3. Update the frontend in `client/src/`
4. Rebuild, re-bundle, push, restart

---

## Gotchas

- **Don't run npm install on EC2.** The t2.micro exhausts CPU credits and it takes 10+ minutes or fails. Always pre-bundle in Replit.
- **Don't build the React app on EC2** for the same reason.
- **client/dist and server/bundle.js are intentionally in git.** This is unusual but deliberate — it's what makes the zero-install EC2 deployment work.
- **The RDS database is only accessible from EC2**, not from your laptop. This is by design (security group). To inspect the database directly, SSH into EC2 first and use `psql` from there.
- **Port 80 requires setcap.** If the app starts but the browser can't connect, check that setcap was run and that the process is on port 80 (`sudo ss -tlnp | grep node`).
- **pm2 appends to logs** — it never clears them. Old errors from previous runs will still be in the log file. Look at timestamps to identify current errors.
