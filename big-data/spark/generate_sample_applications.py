"""
Generate a larger sample of applications for the Spark job.

Writes a deterministic CSV (seeded, so every run produces the same file)
with 600 rows, using the same columns as data/sample_applications.csv:

    application_id, student_name, student_email, offer_id, skills,
    status, applied_at

where `skills` is a quoted comma-separated string.
The small 5-row sample is left untouched.

Usage:
    python spark/generate_sample_applications.py [output_csv]

Default output: data/applications_large.csv, next to the small sample file.
"""

import csv
import os
import random
import sys

FIRST_NAMES = ["Sara", "Youssef", "Amine", "Lina", "Omar", "Hiba",
               "Mehdi", "Salma", "Anas", "Nour"]
LAST_NAMES = ["El Amrani", "Ben Ali", "Bouaouda", "Haddad", "Cherif",
              "Idrissi", "Tazi", "Alaoui", "Rami", "Fassi"]
SKILLS = ["Java", "Spring Boot", "Python", "Apache Spark", "SQL",
          "PostgreSQL", "TypeScript", "Next.js", "React", "Hadoop",
          "Docker", "Kafka"]
STATUSES = ["PENDING", "PENDING", "PENDING", "ACCEPTED", "REJECTED"]

ROW_COUNT = 600


def main() -> None:
    default_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "applications_large.csv"
    )
    output_path = sys.argv[1] if len(sys.argv) > 1 else default_path

    rng = random.Random(42)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["application_id", "student_name", "student_email",
                          "offer_id", "skills", "status", "applied_at"])
        for application_id in range(1, ROW_COUNT + 1):
            first = rng.choice(FIRST_NAMES)
            last = rng.choice(LAST_NAMES)
            skills = ",".join(rng.sample(SKILLS, rng.randint(2, 4)))
            day = rng.randint(1, 28)
            writer.writerow([
                application_id,
                f"{first} {last}",
                f"{first.lower()}.{last.split()[-1].lower()}@example.com",
                rng.randint(1, 5),
                skills,
                rng.choice(STATUSES),
                f"2026-01-{day:02d}",
            ])

    print(f"Wrote {ROW_COUNT} applications to {output_path}")


if __name__ == "__main__":
    main()
