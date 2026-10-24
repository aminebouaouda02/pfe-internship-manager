import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PFE Internship Manager",
  description: "Platform to manage PFE internship offers, applications and supervisors",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/offers", label: "Offers" },
  { href: "/applications", label: "Applications" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-xl shadow">
                  🎓
                </span>
                <span className="leading-tight">
                  <span className="block font-bold text-slate-900">
                    PFE Internship Manager
                  </span>
                  <span className="hidden text-xs text-slate-500 sm:block">
                    Offers, applications and statistics in one place
                  </span>
                </span>
              </Link>

              <nav className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-1 md:order-none md:w-auto md:flex-1 md:justify-center">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="ml-auto flex items-center gap-2 md:ml-0">
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  Register
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-slate-500 sm:px-6">
              <p>
                PFE Internship Manager — built with Spring Boot, Next.js and
                Apache Spark.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                A portfolio project by Amine Bouaouda.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
