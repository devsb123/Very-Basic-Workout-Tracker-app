#!/bin/bash
# Bootstraps the IronLog app on first boot. Logs to /var/log/ironlog-bootstrap.log
# (no 'set -x' so the DB password is never traced into the log).
set -euo pipefail
exec > /var/log/ironlog-bootstrap.log 2>&1

# --- System packages ---
# AL2023's default nodejs package is Node 18, but Tailwind v4 (@tailwindcss/oxide)
# requires Node >= 20. Use NodeSource to get Node 20 before installing the app.
dnf update -y
dnf install -y git libcap
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# --- pm2 process manager ---
npm install -g pm2

# --- Clone & build the app ---
cd /home/ec2-user
git clone ${repo_url} app
cd app
npm install
npm run build
chown -R ec2-user:ec2-user /home/ec2-user/app

# --- Allow Node to bind privileged port 80 without running as root ---
setcap 'cap_net_bind_service=+ep' "$(readlink -f "$(which node)")"

# --- Start the app under pm2 as ec2-user ---
sudo -u ec2-user bash -c "cd /home/ec2-user/app && NODE_ENV=production PORT=80 DATABASE_URL='postgresql://${db_username}:${db_password}@${db_endpoint}/${db_name}' pm2 start server/index.js --name ironlog"
sudo -u ec2-user bash -c "pm2 save"

# --- Restart the app automatically on reboot ---
pm2 startup systemd -u ec2-user --hp /home/ec2-user
