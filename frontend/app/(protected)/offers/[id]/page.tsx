"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiDelete, apiGet, apiPut } from "../../../../lib/api";

/** Internship offer shape as returned by GET /api/offers/{id}. */
interface InternshipOffer {
  id: number;
  title: string;
  description?: string | null;
  company: string;
  supervisorName?: string | null;
  requiredSkills?: string | null;
  location?: string | null;
  createdAt?: string;
}

/** Application shape as returned by GET /api/applications?offerId=…. */
interface ApplicationItem {
  id: number;
  studentName: string;
  studentEmail: string;
  status: string;
}

interface OfferFormValues {
  title: string;
  description: string;
  company: string;
  supervisorName: string;
  requiredSkills: string;
  location: string;
}

const inputCls =
  "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";
const labelCls = "block text-sm font-medium text-slate-700";

function offerToForm(offer: InternshipOffer): OfferFormValues {
  return {
    title: offer.title ?? "",
    description: offer.description ?? "",
    company: offer.company ?? "",
    supervisorName: offer.supervisorName ?? "",
    requiredSkills: offer.requiredSkills ?? "",
    location: offer.location ?? "",
  };
}

function skillChips(requiredSkills?: string | null): string[] {
  if (!requiredSkills) return [];
  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [offer, setOffer] = useState<InternshipOffer | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<OfferFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [offerData, applicationData] = await Promise.all([
        apiGet<InternshipOffer>(`/api/offers/${id}`),
        apiGet<ApplicationItem[]>(`/api/applications?offerId=${id}`),
      ]);
      setOffer(offerData);
      setForm(offerToForm(offerData));
      setApplications(applicationData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load this offer.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  function setField(field: keyof OfferFormValues, value: string) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError("");
    try {
      const updated = await apiPut<InternshipOffer>(`/api/offers/${id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        company: form.company.trim(),
        supervisorName: form.supervisorName.trim(),
        requiredSkills: form.requiredSkills.trim(),
        location: form.location.trim(),
      });
      setOffer(updated);
      setForm(offerToForm(updated));
      setEditing(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save this offer.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`/api/offers/${id}`);
      router.push("/offers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="animate-pulse text-sm text-slate-500">Loading offer…</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error || "Offer not found."}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Try again
          </button>
          <Link
            href="/offers"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to offers
          </Link>
        </div>
      </div>
    );
  }

  const chips = skillChips(offer.requiredSkills);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/offers"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Back to offers
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">{offer.title}</h1>
      <p className="mt-1 font-medium text-brand-700">{offer.company}</p>
      <div className="mt-2 space-y-1 text-sm text-slate-500">
        <p>📍 {offer.location ?? "Location not set"}</p>
        {offer.supervisorName && <p>👤 Supervisor: {offer.supervisorName}</p>}
      </div>
      {offer.description && (
        <p className="mt-4 leading-relaxed text-slate-700">
          {offer.description}
        </p>
      )}
      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-semibold text-slate-900">
          Applications for this offer ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No applications yet for this offer.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {applications.map((application) => (
              <li
                key={application.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm shadow-card ring-1 ring-slate-200/70"
              >
                <span className="font-semibold text-slate-900">
                  {application.studentName}
                  <span className="ml-2 font-normal text-slate-500">
                    {application.studentEmail}
                  </span>
                </span>
                <Link
                  href={`/applications/${application.id}`}
                  className="shrink-0 font-semibold text-brand-700 hover:underline"
                >
                  {application.status} →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!editing ? (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Edit offer
          </button>
          {confirmingDelete ? (
            <>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Confirm delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={(event) => void handleSave(event)}
          className="mt-6 grid gap-3 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70"
        >
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {formError}
            </p>
          )}
          <label className={labelCls}>
            Title *
            <input
              className={inputCls}
              value={form?.title ?? ""}
              onChange={(e) => setField("title", e.target.value)}
              required
              maxLength={150}
            />
          </label>
          <label className={labelCls}>
            Company *
            <input
              className={inputCls}
              value={form?.company ?? ""}
              onChange={(e) => setField("company", e.target.value)}
              required
              maxLength={120}
            />
          </label>
          <label className={labelCls}>
            Description
            <textarea
              className={inputCls}
              rows={4}
              value={form?.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
            />
          </label>
          <label className={labelCls}>
            Supervisor
            <input
              className={inputCls}
              value={form?.supervisorName ?? ""}
              onChange={(e) => setField("supervisorName", e.target.value)}
              maxLength={120}
            />
          </label>
          <label className={labelCls}>
            Required skills (comma-separated)
            <input
              className={inputCls}
              value={form?.requiredSkills ?? ""}
              onChange={(e) => setField("requiredSkills", e.target.value)}
              maxLength={500}
              placeholder="Java, Spring Boot, SQL"
            />
          </label>
          <label className={labelCls}>
            Location
            <input
              className={inputCls}
              value={form?.location ?? ""}
              onChange={(e) => setField("location", e.target.value)}
              maxLength={100}
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(offerToForm(offer));
                setFormError("");
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
