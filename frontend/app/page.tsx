import Link from "next/link";

const FEATURES = [
  {
    icon: "💼",
    tile: "bg-brand-50 text-brand-700",
    title: "Internship offers",
    text: "Companies and supervisors publish PFE internship offers with the skills they need, the location and a full description.",
  },
  {
    icon: "📝",
    tile: "bg-accent-50 text-accent-700",
    title: "Online applications",
    text: "Students apply in a few clicks, and every application is tracked from PENDING to ACCEPTED or REJECTED.",
  },
  {
    icon: "📊",
    tile: "bg-amber-50 text-amber-700",
    title: "Spark statistics",
    text: "Application data is processed with Apache Spark to show the most requested skills and applications per offer.",
  },
];

const STEPS = [
  {
    title: "A company publishes an offer",
    text: "The offer describes the subject, the company and the required skills.",
  },
  {
    title: "A student applies online",
    text: "The student sends an application with their skills and a cover letter.",
  },
  {
    title: "A supervisor reviews it",
    text: "Applications are accepted or rejected, and the student can follow the status.",
  },
  {
    title: "Spark computes statistics",
    text: "The platform aggregates the data to show trends for students and supervisors.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-600 to-accent-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Final-year project (PFE) platform
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Manage PFE internships, from the first offer to the final
            acceptance.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-brand-50 sm:text-lg">
            PFE Internship Manager brings internship offers, student
            applications and supervisor reviews together in one simple
            platform, with statistics computed by Apache Spark.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/offers"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 shadow transition hover:bg-brand-50"
            >
              Browse offers
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Everything in one place
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          No more lost emails or spreadsheets: offers, applications and
          results live in the same platform.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${feature.tile}`}
              >
                {feature.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-600 font-bold text-white shadow">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom call to action */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-accent-700 px-6 py-10 text-center text-white shadow-card sm:px-10">
          <h2 className="text-2xl font-bold">
            Ready to find your PFE internship?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-50">
            Create a free account, browse the offers and send your first
            application today.
          </p>
          <Link
            href="/offers"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 shadow transition hover:bg-brand-50"
          >
            Browse offers
          </Link>
        </div>
      </section>
    </div>
  );
}
