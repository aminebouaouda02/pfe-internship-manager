"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet } from "../../../lib/api";
import { logout } from "../../../lib/auth";
import { getToken } from "../../../lib/token";

/**
 * Shows the username carried inside the token payload.
 */
function usernameFromToken(): string {
  const token = getToken();
  if (!token) {
    return "unknown";
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { sub?: string };
    return payload.sub ?? "unknown";
  } catch {
    return "unknown";
  }
}

interface OfferSummary {
  id: number;
}

interface ApplicationSummary {
  id: number;
  status: string;
}

interface Stats {
  offers: number;
  applications: number;
  pending: number;
  accepted: number;
}

interface SkillRow {
  skill: string;
  count: number;
}

interface SkillsAnalytics {
  metric: string;
  rows: SkillRow[];
  total_skill_mentions: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [analytics, setAnalytics] = useState<SkillsAnalytics | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<OfferSummary[]>("/api/offers"),
      apiGet<ApplicationSummary[]>("/api/applications"),
    ])
      .then(([offers, applications]) => {
        setStats({
          offers: offers.length,
          applications: applications.length,
          pending: applications.filter((a) => a.status === "PENDING").length,
          accepted: applications.filter((a) => a.status === "ACCEPTED")
            .length,
        });
      })
      .catch((err: Error) => setStatsError(err.message));
  }, []);

  // Spark analytics are loaded separately: if the Spark result has not
  // been generated yet, the offer/application statistics above still show.
  useEffect(() => {
    apiGet<SkillsAnalytics>("/api/analytics/skills")
      .then(setAnalytics)
      .catch((err: Error) => setAnalyticsError(err.message));
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const statCards = [
    {
      label: "Total offers",
      value: stats?.offers,
      icon: "💼",
      tile: "bg-brand-50 text-brand-700",
    },
    {
      label: "Total applications",
      value: stats?.applications,
      icon: "📝",
      tile: "bg-accent-50 text-accent-700",
    },
    {
      label: "Pending applications",
      value: stats?.pending,
      icon: "⏳",
      tile: "bg-amber-50 text-amber-700",
    },
    {
      label: "Accepted applications",
      value: stats?.accepted,
      icon: "✅",
      tile: "bg-green-50 text-green-700",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {usernameFromToken()} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is what is happening on your PFE internship platform.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Logout
        </button>
      </div>

      {statsError && (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The statistics could not be loaded ({statsError}). The API may be
          offline — the quick links below still work.
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${card.tile}`}
            >
              {card.icon}
            </span>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {card.value === undefined ? (
                <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-200 align-middle" />
              ) : (
                card.value
              )}
            </p>
            <p className="mt-1 text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>


      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-slate-900">
          Applications per skill
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Spark analytics from <code>/api/analytics/skills</code>
          {analytics
            ? ` — ${analytics.total_skill_mentions} skill mentions in the sample.`
            : ""}
        </p>
        {analyticsError ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Analytics chart not available yet ({analyticsError}). Run the
            Spark job first — see <code>big-data/README.md</code> — and the
            chart appears here without any other change.
          </p>
        ) : !analytics ? (
          <div className="mt-4 space-y-3" aria-label="Loading analytics chart">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-8 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {analytics.rows.map((row) => {
              const max = Math.max(...analytics.rows.map((r) => r.count), 1);
              const width = (row.count / max) * 100;
              return (
                <li key={row.skill}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold text-slate-900">
                      {row.skill}
                    </span>
                    <span className="text-slate-600">
                      {row.count} applications
                    </span>
                  </div>
                  <div
                    className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100"
                    role="img"
                    aria-label={`${row.skill}: ${row.count} applications`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-600"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <h2 className="mt-10 text-xl font-bold text-slate-900">Quick links</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <Link
          href="/offers"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-brand-300 hover:shadow-md"
        >
          <p className="text-2xl">💼</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            Internship offers
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Browse the published offers, publish a new one, edit or delete
            existing offers, and apply to the ones you like.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-brand-700 group-hover:underline">
            Go to offers →
          </span>
        </Link>
        <Link
          href="/applications"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-brand-300 hover:shadow-md"
        >
          <p className="text-2xl">📥</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            Applications
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Review the applications students have sent, change their status
            and follow who was accepted.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-brand-700 group-hover:underline">
            Go to applications →
          </span>
        </Link>
      </div>
    </div>
  );
}
