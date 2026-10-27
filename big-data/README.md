# Big Data — Spark Stats

This module computes statistics from PFE internship applications using Apache Spark (PySpark).

## Goal

From an exported CSV of applications, compute:

- Number of applications per skill (e.g. how many students list "Java", "Spark", "React")
- Later: applications per offer, acceptance rate per company, most demanded skills in offers vs. student skills

These stats feed the admin dashboard in the frontend.

## Current Job (Day 1 skeleton)

`spark/skills_stats.py`:
- Reads a CSV file of applications (path passed as argument, defaults to `data/sample_applications.csv`)
- Splits the `skills` column (comma-separated, quoted in CSV) into individual skills
- Counts applications per skill and prints the result sorted by count descending

### Input format

See `data/sample_applications.csv`:

```csv
application_id,student_name,student_email,offer_id,skills,status,applied_at
1,Sara El Amrani,sara@example.com,1,"Java,Spring Boot,PostgreSQL",PENDING,2026-01-15
```

Note: `skills` is quoted because it contains commas.

### Run locally

Requires Apache Spark with PySpark installed.

```bash
cd big-data
spark-submit spark/skills_stats.py data/sample_applications.csv
# or with plain python if pyspark is pip-installed:
python spark/skills_stats.py data/sample_applications.csv
```

### Expected output (on sample data)

```
+------------+-----+
|skill       |count|
+------------+-----+
|Java        |   3 |
|Spring Boot |   2 |
|Python      |   2 |
...
```

Exact order may vary for equal counts.

## Hadoop / HDFS (Docker Compose `bigdata` profile)

HDFS is now wired up in the project-root `docker-compose.yml`, under a
`bigdata` profile so the default stack stays light:

- `namenode` — HDFS NameNode, web UI on http://localhost:9870, HDFS on `hdfs://localhost:9000`
- `datanode` — HDFS DataNode, web UI on http://localhost:9864
- `spark` — a one-shot Spark job runner (image `apache/spark-py:3.5.1`),
  with this folder mounted at `/opt/big-data`

```bash
# From the project root: start PostgreSQL + HDFS
docker compose --profile bigdata up -d

# Check HDFS is up, and make a folder for application exports
docker compose --profile bigdata exec namenode hdfs dfs -ls /
docker compose --profile bigdata exec namenode hdfs dfs -mkdir -p /pfe/applications

# Run the Spark job inside a container
docker compose --profile bigdata run --rm spark \
  spark-submit spark/skills_stats.py data/sample_applications.csv

# Stop everything
docker compose down
```

What is still local: the Spark job reads CSV files from the local
filesystem by default (the mounted `big-data/` folder inside the container).
Pointing its input at an `hdfs://` path is the next step.

## Working analytics job (600-row sample)

```bash
# 1. Generate the larger sample (deterministic, 600 rows)
python spark/generate_sample_applications.py
# 2. Run the Spark job and write the result JSON
spark-submit spark/skills_stats.py data/applications_large.csv \
    output/applications_per_skill.json
```

The result JSON has one row per skill (`skill`, `count`) plus the total
number of skill mentions. The backend serves that file at
`GET /api/analytics/skills` (see
`backend/src/main/java/com/amine/pfemanager/controller/AnalyticsController.java`;
it returns 404 with a clear message if the job has never been run).

Note: the committed `output/applications_per_skill.json` was computed from
the 600-row sample with the same aggregation as the Spark job, because
this workspace has no Spark/Java runtime to run the job itself. Re-running
the Spark command above replaces it with a real Spark result.

## Roadmap

- [x] Day 1: job skeleton + sample data
- [x] Working job: 600-row generated sample, result JSON, backend endpoint
- [ ] Read directly from PostgreSQL via JDBC
- [ ] Add offers-side stats: most requested skills in offers
- [x] HDFS + Spark services in Docker Compose under the `bigdata` profile
- [ ] Run the Spark job against HDFS instead of local files
