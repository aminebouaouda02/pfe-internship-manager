"""
Skills stats — PFE Internship Manager

Simple PySpark job: count applications per skill.

Input: CSV with columns
    application_id, student_name, student_email, offer_id, skills, status, applied_at
where `skills` is a quoted comma-separated string, e.g. "Java,Spring Boot,SQL".

Usage:
    spark-submit skills_stats.py [path_to_csv]
    python skills_stats.py [path_to_csv]
"""

import sys

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, explode, split, trim


def main() -> None:
    input_path = sys.argv[1] if len(sys.argv) > 1 else "data/sample_applications.csv"

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

    spark.stop()


if __name__ == "__main__":
    main()
