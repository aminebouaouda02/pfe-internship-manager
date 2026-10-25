"""
Skills stats — PFE Internship Manager

Simple PySpark job: count applications per skill.

Input: CSV with columns
    application_id, student_name, student_email, offer_id, skills, status, applied_at
where `skills` is a quoted comma-separated string, e.g. "Java,Spring Boot,SQL".

Usage:
    spark-submit skills_stats.py [path_to_csv] [path_to_output_json]
    python skills_stats.py [path_to_csv] [path_to_output_json]

If an output path is given, the result is also written there as JSON
(the file the backend analytics endpoint reads), for example:

    python skills_stats.py ../data/applications_large.csv \
        ../output/applications_per_skill.json
"""

import json
import os
import sys

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, explode, split, trim


def write_result_json(stats, output_path: str) -> None:
    """Write the per-skill counts as JSON, plus the overall total."""
    rows = [row.asDict() for row in stats.collect()]
    payload = {
        "metric": "applications_per_skill",
        "rows": rows,
        # One application lists several skills, so this is skill mentions,
        # not the number of applications.
        "total_skill_mentions": sum(r["count"] for r in rows),
    }
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
    print(f"Wrote result JSON to: {output_path}")


def main() -> None:
    input_path = sys.argv[1] if len(sys.argv) > 1 else "data/sample_applications.csv"
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    spark = (
        SparkSession.builder
        .appName("pfe-skills-stats")
        .master("local[*]")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")

    # Read applications CSV — header + quoted fields handled by Spark CSV reader
    df = (
        spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(input_path)
    )

    print(f"Loaded {df.count()} applications from {input_path}")
    df.printSchema()

    # Split comma-separated skills into one row per skill, trim whitespace
    skills_df = (
        df.select(explode(split(col("skills"), ",")).alias("skill"))
        .select(trim(col("skill")).alias("skill"))
        .filter(col("skill") != "")
    )

    stats = (
        skills_df.groupBy("skill")
        .count()
        .orderBy(col("count").desc(), col("skill").asc())
    )

    print("Applications per skill:")
    stats.show(truncate=False)

    if output_path:
        write_result_json(stats, output_path)

    spark.stop()


if __name__ == "__main__":
    main()
