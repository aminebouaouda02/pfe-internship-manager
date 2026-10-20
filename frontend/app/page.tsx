type Offer = {
  id: number;
  title: string;
  company: string;
  location: string;
  requiredSkills: string;
};

// Placeholder data for Day 1 — will be replaced by API call to /api/offers
const placeholderOffers: Offer[] = [
  {
    id: 1,
    title: "Full-Stack Developer Intern — Spring Boot & Next.js",
    company: "Example Tech",
    location: "Casablanca / Remote",
    requiredSkills: "Java, Spring Boot, TypeScript, Next.js",
  },
  {
    id: 2,
    title: "Data Engineering Intern — Spark Pipeline",
    company: "DataLab",
    location: "Rabat",
    requiredSkills: "Python, Apache Spark, SQL",
  },
];

export default function HomePage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        PFE Internship Manager
      </h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem", maxWidth: "42rem" }}>
        Browse PFE internship offers, apply in a few clicks, and let supervisors
        track applications in one place. Statistics are computed with Apache Spark.
      </p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
        Latest offers (placeholder)
      </h2>

      <ul style={{ display: "grid", gap: "1rem", maxWidth: "48rem" }}>
        {placeholderOffers.map((offer) => (
          <li
            key={offer.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "1rem 1.25rem",
            }}
          >
            <div style={{ fontWeight: 600 }}>{offer.title}</div>
            <div style={{ color: "#374151" }}>
              {offer.company} — {offer.location}
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Skills: {offer.requiredSkills}
            </div>
          </li>
        ))}
      </ul>

      <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: "2rem" }}>
        Day 1 scaffold — offers above are placeholders until the backend API is connected.
      </p>
    </div>
  );
}
