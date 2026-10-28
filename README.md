# PFE Internship Manager

A platform to manage PFE (Projet de Fin d'Études) internship offers, student applications, and supervisor assignments — with statistics computed via Apache Spark.

Students can browse offers, companies/supervisors can publish and track offers, and admins get simple stats (e.g. most requested skills, applications per offer) generated from application data.

## Screenshots

The app running locally, with sample data:

**Home page** (`/`)

![Home page](docs/screenshots/home.png)

**Internship offers** (`/offers`, login required)

![Internship offers](docs/screenshots/offers.png)

**Applications** (`/applications`, login required)

![Applications](docs/screenshots/applications.png)

**Dashboard** (`/dashboard`, login required)

![Dashboard](docs/screenshots/dashboard.png)

## Tech Stack

- **Backend:** Spring Boot 3 (Java 17), Spring Data JPA, Spring Security, PostgreSQL
- **Frontend:** Next.js 14 (TypeScript, App Router), Tailwind CSS
- **Big Data:** Apache Spark (PySpark) — batch stats on applications
- **Infrastructure:** Docker Compose (PostgreSQL by default; Hadoop HDFS + Spark under the `bigdata` profile)

## Architecture Overview

```
pfe-internship-manager/
├── backend/     # Spring Boot REST API
│   └── src/main/java/com/amine/pfemanager/
│       ├── model/       # JPA entities: InternshipOffer, Application
│       ├── repository/  # Spring Data repositories
│       ├── controller/  # REST controllers (HealthController for Day 1)
│       └── config/      # Security configuration
├── frontend/    # Next.js 14 app (App Router)
│   ├── app/     # layout.tsx, page.tsx
│   └── lib/     # api.ts fetch helper
└── big-data/    # Spark jobs
    ├── spark/   # skills_stats.py — applications per skill
    └── data/    # sample CSV data
```

Data flow:
1. Frontend (Next.js) calls Backend REST API (`/api/...`)
2. Backend reads/writes PostgreSQL
3. Exported application data (CSV) is processed by the Spark job in `big-data/` to produce stats

## How to Run (Docker Compose)

Start PostgreSQL:

```bash
docker compose up -d
```

Start the Big Data profile (optional — Hadoop HDFS + Spark):

```bash
docker compose --profile bigdata up -d
```

This starts PostgreSQL plus the Hadoop NameNode and DataNode. The
`bigdata` profile is optional on purpose: the default `docker compose up`
stays light. NameNode web UI: http://localhost:9870 — HDFS address:
`hdfs://localhost:9000`.

```bash
# Check HDFS is up
docker compose --profile bigdata exec namenode hdfs dfs -ls /

# Run the Spark job inside a container (one-shot, not a daemon)
docker compose --profile bigdata run --rm spark \
  spark-submit spark/skills_stats.py data/sample_applications.csv

# Stop everything
docker compose down
```

The Spark job still reads local CSV files by default; reading its input
from HDFS is the next step (see `big-data/README.md`).

Run the backend:

```bash
cd backend
./mvnw spring-boot:run
# or: mvn spring-boot:run
# Health check: http://localhost:8080/api/health
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

Run the Spark stats job (requires Spark installed locally):

```bash
cd big-data
spark-submit spark/skills_stats.py data/sample_applications.csv
```

## Roadmap

- [x] **Day 1** — Project scaffold: repo structure, Docker Compose with PostgreSQL, Spring Boot app with Health endpoint, JPA entities (`InternshipOffer`, `Application`), Next.js home page, Spark job skeleton
- [x] InternshipOffer CRUD API (`/api/offers`)
  - [x] `InternshipOfferController`: full CRUD, `InternshipOfferRequest` DTO with `@Valid`
- [x] Application submission API (`/api/applications`)
  - [x] `ApplicationController`: create (linked to an offer, starts PENDING), list/detail/status-update/delete; `ApplicationRequest` DTO with `@Valid`
- [x] JWT authentication (students / supervisors / admin roles)
  - [x] `User` entity with `ROLE_STUDENT` / `ROLE_SUPERVISOR` / `ROLE_ADMIN`, `AuthController` (`/api/auth/register`, `/api/auth/login`), JWT filter, BCrypt password hashing
  - [x] `/login` and `/register` pages, token stored in the browser, protected route group with `/dashboard`
- [x] Frontend: offers list page connected to API
  - [x] `/offers` page under the protected route group, linked from `/dashboard`
- [x] Frontend detail pages — offer detail view with edit form and its applications, application detail view with status change; both show loading and error states, and list pages link to the detail pages
- [ ] Frontend: application form
- [ ] Supervisor assignment workflow
- [x] Spark stats: applications per skill on a generated 600-row sample, result JSON served by `GET /api/analytics/skills`
- [x] Dashboard page with charts
  - [x] `/dashboard` shows an applications-per-skill bar chart from `GET /api/analytics/skills`, with a clear note instead of a chart if the Spark result has not been generated yet
- [x] Hadoop integration — HDFS in Docker Compose under the `bigdata` profile (NameNode + DataNode) and a Spark job-runner service; Spark jobs still read local CSV by default, reading from HDFS is the next step
- [x] Backend tests (13 JUnit/Mockito tests: `InternshipOfferControllerTest`, `ApplicationControllerTest`, `AuthControllerTest` — create/list/filter, 404/400/409/401 cases, applications starting as PENDING)
- [ ] Frontend component test setup (deferred: adding Jest + Testing Library needs new dev dependencies and a verified install, so it will be set up with the CI work rather than added unverified)
- [ ] Deployment guide

## Tests

Backend unit tests live in `backend/src/test/java/...` and use JUnit 5
with Mockito (repositories mocked, no database needed). Run them with:

```bash
cd backend
mvn test
```

Note: Java/Maven are not installed in the workspace where this work was
prepared, so the tests were checked for consistency with the controllers
(signatures, status codes, DTO fields) but not executed there — run
`mvn test` locally or in CI to see them pass.

## Author

Amine Bouaouda — PFE internship project
GitHub: [@aminebouaouda02](https://github.com/aminebouaouda02)

## License

MIT — for learning and portfolio purposes.
