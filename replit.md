# IronLog — Gym Tracker

A full-stack workout tracking web app built with React + Vite (frontend) and Node/Express + PostgreSQL (backend).

## Features implemented

### Workout logging (Push / Pull / Legs tabs)
- Log sets with exercise name, weight, and reps
- Each tab (Push, Pull, Legs) shows only its own exercises
- Delete any logged set
- Data persists in PostgreSQL

### Running tab
- Log runs with distance and duration
- View and delete past runs

### Backend API (Node/Express)
- `POST /api/sets` — log a set
- `GET /api/sets?tab=push|pull|legs` — fetch sets for a tab
- `DELETE /api/sets/:id` — delete a set
- `POST /api/runs` — log a run
- `GET /api/runs` — fetch all runs
- `DELETE /api/runs/:id` — delete a run
- Auto-creates database schema on startup (no manual SQL needed)
- Serves built React app as static files in production (`NODE_ENV=production`)
- Parameterized queries throughout (no SQL injection risk)

### Database
- PostgreSQL via Replit-managed database (development)
- AWS RDS PostgreSQL db.t3.micro (production/AWS)
- Auto-enables SSL for `*.rds.amazonaws.com` connections

### Infrastructure (Terraform — `terraform/` directory)
- EC2 `t2.micro` (Amazon Linux 2023) — serves the app on port 80
- RDS `db.t3.micro` PostgreSQL — private, single-AZ, free tier
- Security groups: EC2 allows SSH (your IP) + HTTP (anywhere); RDS allows port 5432 from EC2 only
- `user_data.sh.tpl` bootstraps the instance on first boot: installs Node 20, clones repo, builds, starts app via pm2
- All free-tier eligible (us-east-1)
- `terraform destroy` tears everything down cleanly

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, Tailwind CSS v4 |
| Backend | Node.js 20, Express 4 |
| Database | PostgreSQL (pg driver) |
| Process manager | PM2 |
| Infrastructure | Terraform + AWS (EC2 + RDS) |
| Version control | GitHub |

## User preferences
- Keep all AWS resources in free tier
- Use Terraform for all infrastructure changes (not manual console)
- AWS region: us-east-1
- AWS CLI profile: ironlog-admin (SSO via IAM Identity Center)
