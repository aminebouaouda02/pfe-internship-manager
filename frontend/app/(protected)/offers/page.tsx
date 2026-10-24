"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

/** Internship offer shape as returned by GET /api/offers. */
interface InternshipOffer {
  id: number;
  title: string;
  company: string;
  location?: string;
  requiredSkills?: string;
  description?: string;
}

/** Simple list page: fetches the internship offers from the API. */
export default function OffersPage() {
  const [offers, setOffers] = useState<InternshipOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<InternshipOffer[]>("/api/offers")
      .then(setOffers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading offers…</p>;
  }
  if (error) {
    return <p style={{ padding: "2rem" }}>Error: {error}</p>;
  }

  return (
    <div style={{ maxWidth: "50rem", margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Internship offers</h1>
      {offers.length === 0 ? (
        <p>No offers yet. Create some with POST /api/offers.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {offers.map((offer) => (
            <li
              key={offer.id}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "0.75rem 0",
              }}
            >
              <strong>{offer.title}</strong> — {offer.company}
              <br />
              <small>
                {offer.location ?? "Location not set"}
                {offer.requiredSkills
                  ? ` — Skills: ${offer.requiredSkills}`
                  : ""}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
