"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiDelete, apiGet, apiPut } from "../../../../lib/api";

/** Offer object nested inside an application, as returned by the backend. */
interface OfferSummary {
  id: number;
  title: string;
  company: string;
  location?: string | null;
}

/** Application shape as returned by GET /api/applications/{id}. */
interface ApplicationItem {
  id: number;
  studentName: string;
  studentEmail: string;
  skills?: string | null;
  coverLetter?: string | null;
  status: string;
  offer?: OfferSummary | null;
  appliedAt?: string;
}

const STATUSES = ["PENDING", "ACCEPTED", "REJECTED"] as const;

function skillChips(skills?: string | null): string[] {
  if (!skills) return [];
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<ApplicationItem>(`/api/applications/${id}`);
      setApplication(data);
      setStatusDraft(data.status);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load this application.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatusSave() {
    setSaving(true);
    setActionError("");
    try {
      const updated = await apiPut<ApplicationItem>(
        `/api/applications/${id}/status?status=${encodeURIComponent(statusDraft)}`,
      );
      setApplication(updated);
      setStatusDraft(updated.status);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not update the status.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`/api/applications/${id}`);
      router.push("/applications");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not delete this application.",
      );
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="animate-pulse text-sm text-slate-500">
          Loading application…
        </p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error || "Application not found."}
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
            href="/applications"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to applications
          </Link>
        </div>
      </div>
    );
  }

  const chips = skillChips(application.skills);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/applications"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Back to applications
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        {application.studentName}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {application.studentEmail} · Applied {formatDate(application.appliedAt)}
      </p>
      {application.offer && (
        <p className="mt-2 text-sm text-slate-700">
          Offer:{" "}
          <Link
            href={`/offers/${application.offer.id}`}
            className="font-semibold text-brand-700 hover:underline"
          >
            {application.offer.title} — {application.offer.company}
          </Link>
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
      {application.coverLetter && (
        <blockquote className="mt-4 rounded-xl bg-white p-5 text-sm italic leading-relaxed text-slate-700 shadow-card ring-1 ring-slate-200/70">
          “{application.coverLetter}”
        </blockquote>
      )}

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
        <h2 className="font-semibold text-slate-900">Change status</h2>
        <p className="mt-1 text-sm text-slate-500">
          Current status: {application.status}
        </p>
        {actionError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            {actionError}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            aria-label="New status for this application"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving || statusDraft === application.status}
            onClick={() => void handleStatusSave()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save status"}
          </button>
        </div>
      </section>

      <div className="mt-6 flex gap-3">
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
            Delete application
          </button>
        )}
      </div>
    </div>
  );
}
