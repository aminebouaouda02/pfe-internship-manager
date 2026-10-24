"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/token";

/**
 * Layout for the protected route group `(protected)`.
 * Any page inside this group (e.g. /dashboard) is only reachable
 * when a JWT is stored; otherwise the user is sent back to /login.
 * The URL stays clean because the route group name is hidden.
 */
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      setAllowed(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500 sm:px-6">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="mt-4 text-sm">Checking your session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
