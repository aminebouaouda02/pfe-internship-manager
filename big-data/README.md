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

## Roadmap

- [x] Day 1: job skeleton + sample data
- [ ] Read directly from PostgreSQL via JDBC
- [ ] Write results to CSV / JSON for the backend to serve
- [ ] Add offers-side stats: most requested skills in offers
- [ ] Run on Hadoop / HDFS in Docker
