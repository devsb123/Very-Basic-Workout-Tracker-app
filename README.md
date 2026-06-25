# IronLog

A simple full-stack gym tracking web app.

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (via `pg` / node-postgres)

Track your lifts across **Push**, **Pull**, and **Legs** workouts, plus your
**Running** sessions.

## Project structure

```
ironlog/
├── client/         # React Vite app
├── server/         # Express API
│   ├── index.js
│   └── db.js
├── .env            # local environment variables (see below)
└── package.json
```

## Environment variables

The backend reads the database connection from `DATABASE_URL`.

For local development, create a `.env` file in the project root:

```
DATABASE_URL=postgresql://localhost:5432/ironlog
```

> **Deployment note:** At deploy time, replace `DATABASE_URL` with your AWS RDS
> PostgreSQL endpoint, e.g.
> `postgresql://USER:PASSWORD@your-db.xxxxxx.us-east-1.rds.amazonaws.com:5432/ironlog`.
> Nothing else needs to change — the connection string is the only deploy-time
> swap.

## Database schema

```sql
CREATE TABLE sets (
  id SERIAL PRIMARY KEY,
  tab VARCHAR(10),
  exercise VARCHAR(100),
  weight NUMERIC,
  reps INTEGER,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE runs (
  id SERIAL PRIMARY KEY,
  distance NUMERIC,
  duration INTEGER,
  logged_at TIMESTAMP DEFAULT NOW()
);
```

The tables are created automatically on server startup if they don't exist.

## API

| Method | Route             | Description                                |
| ------ | ----------------- | ------------------------------------------ |
| POST   | `/api/sets`       | Log a set (`tab`, `exercise`, `weight`, `reps`) |
| GET    | `/api/sets?tab=`  | Get all sets for a tab (`push`/`pull`/`legs`)   |
| DELETE | `/api/sets/:id`   | Delete a set                               |
| POST   | `/api/runs`       | Log a run (`distance`, `duration`)         |
| GET    | `/api/runs`       | Get all runs                               |

## Running locally

Install dependencies:

```bash
npm install
npm install --prefix client
```

Start the backend (port 3001) and frontend (port 5000) in separate terminals:

```bash
npm run dev          # backend
npm run dev --prefix client   # frontend
```

The Vite dev server proxies `/api` requests to the backend.

## Production

In production, the Express server serves the built React app as static files,
so everything runs from a single server — suitable for a single EC2 instance.

```bash
npm run build        # builds the React client into client/dist
npm start            # starts Express in production mode (serves API + static)
```

Set `PORT` (defaults to `3001`) to control which port the production server
listens on.
