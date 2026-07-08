# IronLog

A full-stack gym tracking web app. Log your Push / Pull / Legs workouts and runs, with all data persisted to a PostgreSQL database.

## Features

- **Workout logging** — log sets with exercise name, weight, and reps across Push, Pull, and Legs tabs
- **Running tab** — log runs with distance and duration
- **Full history** — view and delete any logged set or run
- **Persistent storage** — all data saved to PostgreSQL; schema auto-creates on first boot
- **Production-ready** — served via pm2 on AWS EC2, backed by RDS PostgreSQL

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, Tailwind CSS v3 |
| Backend | Node.js 20, Express 4 |
| Database | PostgreSQL (pg driver) |
| Process manager | PM2 |
| Infrastructure | Terraform + AWS (EC2 t2.micro + RDS db.t3.micro) |

## Architecture

```
Browser → EC2 (port 80) → Express → RDS PostgreSQL
                ↓
          client/dist/     ← pre-built React app (served as static files)
          server/bundle.js ← pre-bundled server (no npm install on EC2)
```

The server handles all API routes and serves the React frontend as static files in production. Both are committed to git as build artifacts so EC2 never needs to run a build or npm install.

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL running locally (or use the Replit-managed database)

### Setup

```bash
# Install server dependencies
npm install

# Install frontend dependencies and start the dev server
npm install --prefix client
npm run dev --prefix client
```

In a separate terminal:

```bash
# Start the backend
npm run dev
```

Create a `.env` file in the project root for local database access:

```
DATABASE_URL=postgresql://localhost:5432/ironlog
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend on `http://localhost:3001`.

## Deployment (AWS)

Infrastructure is managed with Terraform. All resources are free-tier eligible (us-east-1).

### Prerequisites
- AWS CLI configured (profile: `ironlog-admin` via IAM Identity Center SSO)
- Terraform installed
- SSH key pair `ironlog-key` created in AWS, saved at `~/.ssh/ironlog-key.pem`

### First-time deploy

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Fill in terraform.tfvars with your values
terraform init
terraform apply
```

### Updating the app after code changes

```bash
# 1. Rebuild the frontend
npm run build

# 2. Re-bundle the backend
npx esbuild server/index.js --bundle --platform=node --outfile=server/bundle.js --external:pg-native

# 3. Push to GitHub
git add -A && git commit -m "your message" && git push

# 4. Pull on EC2 and restart
ssh -i ~/.ssh/ironlog-key.pem ec2-user@<EC2_IP>
cd /home/ec2-user/app && git pull && pm2 restart ironlog
```

### Tear down

```bash
cd terraform
terraform destroy
```

## AWS Resources

| Resource | Type | Purpose |
|---|---|---|
| EC2 | t2.micro | Runs the Node.js app on port 80 |
| RDS | db.t3.micro PostgreSQL | Stores workouts and runs |
| Security Group (EC2) | — | SSH from your IP + HTTP from anywhere |
| Security Group (RDS) | — | PostgreSQL from EC2 only |

## Database Schema

Tables are created automatically on server startup if they don't exist.

```sql
CREATE TABLE sets (
  id        SERIAL PRIMARY KEY,
  tab       VARCHAR(10),
  exercise  VARCHAR(100),
  weight    NUMERIC,
  reps      INTEGER,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE runs (
  id        SERIAL PRIMARY KEY,
  distance  NUMERIC,
  duration  INTEGER,
  logged_at TIMESTAMP DEFAULT NOW()
);
```

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sets` | Log a set (`tab`, `exercise`, `weight`, `reps`) |
| GET | `/api/sets?tab=push\|pull\|legs` | Get sets for a tab |
| DELETE | `/api/sets/:id` | Delete a set |
| POST | `/api/runs` | Log a run (`distance`, `duration`) |
| GET | `/api/runs` | Get all runs |
| DELETE | `/api/runs/:id` | Delete a run |
