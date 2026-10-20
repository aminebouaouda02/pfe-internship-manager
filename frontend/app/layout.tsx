import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PFE Internship Manager",
  description: "Platform to manage PFE internship offers, applications and supervisors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "1rem 2rem", borderBottom: "1px solid #e5e7eb" }}>
          <strong>PFE Internship Manager</strong>
        </header>
        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
