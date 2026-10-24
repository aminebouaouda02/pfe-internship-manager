"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiDelete, apiGet, apiPut } from "../../../lib/api";

/** Offer object nested inside an application, as returned by the backend. */
interface OfferSummary {
  id: number;
  title: string;
  company: string;
  location?: string | null;
}

/** Application shape as returned by GET /api/applications. */
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

const BADGE_CLASSES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  ACCEPTED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString();
}

function skillChips(skills?: string | null): string[] {
  if (!skills) {
    return [];
  }
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusDraft, setStatusDraft] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<ApplicationItem[]>("/api/applications");
      setApplications(data);
      const drafts: Record<number, string> = {};
      data.forEach((application) => {
        drafts[application.id] = application.status;
      });
      setStatusDraft(drafts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  async function handleStatusSave(application: ApplicationItem) {
    const newStatus = statusDraft[application.id] ?? application.status;
    if (newStatus === application.status) {
      return;
    }
    setActionError("");
    setSuccess("");
    setSavingId(application.id);
    try {
      // The backend exposes PUT /api/applications/{id}/status?status=…
      // (a request parameter, no request body).
      const updated = await apiPut<ApplicationItem>(
        `/api/applications/${application.id}/status?status=${encodeURIComponent(
          newStatus
        )}`
      );
      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? { ...item, status: updated?.status ?? newStatus }
            : item
        )
      );
      setStatusDraft((current) => ({
        ...current,
        [application.id]: updated?.status ?? newStatus,
      }));
      setSuccess(
        `Application from ${application.studentName} is now ${newStatus}.`
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update the status"
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    setActionError("");
    setSuccess("");
    setDeleting(true);
    try {
      await apiDelete(`/api/applications/${id}`);
      setConfirmDeleteId(null);
      setSuccess("Application deleted.");
      await loadApplications();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete the application"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
        <p className="mt-1 text-sm text-slate-500">
          {loading
            ? "Loading applications…"
            : `${applications.length} application${
                applications.length === 1 ? "" : "s"
              } received`}
        </p>
      </div>

      {success && (
        <p className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          ✅ {success}
        </p>
      )}
      {actionError && (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {loading ? (
        <div className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0"
            >
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-4 w-56 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-6 w-20 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">
            The applications could not be loaded.
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadApplications}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-4xl">📥</p>
          <p className="mt-3 font-semibold text-slate-900">
            No applications yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            When students apply to an offer, their applications will appear
            here so supervisors can review them.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Offer</th>
                <th className="px-5 py-3 font-semibold">Applied</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Change status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => {
                const chips = skillChips(application.skills);
                const draft =
                  statusDraft[application.id] ?? application.status;
                const isConfirmingDelete = confirmDeleteId === application.id;
                return (
                  <tr
                    key={application.id}
                    className="border-b border-slate-100 align-top last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        <Link
                          href={`/applications/${application.id}`}
                          className="text-brand-700 hover:underline"
                        >
                          {application.studentName}
                        </Link>
                      </p>
                      <p className="text-slate-500">
                        {application.studentEmail}
                      </p>
                      {chips.length > 0 && (
                        <div className="mt-2 flex max-w-[220px] flex-wrap gap-1">
                          {chips.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full border border-brand-100 bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      )}
                      {application.coverLetter && (
                        <p
                          className="mt-2 line-clamp-2 max-w-[240px] text-xs italic text-slate-500"
                          title={application.coverLetter}
                        >
                          “{application.coverLetter}”
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {application.offer ? (
                        <>
                          <p className="font-medium text-slate-900">
                            {application.offer.title}
                          </p>
                          <p className="text-slate-500">
                            {application.offer.company}
                            {application.offer.location
                              ? ` — ${application.offer.location}`
                              : ""}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-500">Offer not available</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(application.appliedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          BADGE_CLASSES[application.status] ??
                          "border-slate-200 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={draft}
                          onChange={(e) =>
                            setStatusDraft((current) => ({
                              ...current,
                              [application.id]: e.target.value,
                            }))
                          }
                          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                          aria-label={`New status for application ${application.id}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={
                            savingId === application.id ||
                            draft === application.status
                          }
                          onClick={() => handleStatusSave(application)}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingId === application.id ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => handleDelete(application.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deleting ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActionError("");
                            setConfirmDeleteId(application.id);
                          }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
