"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../lib/api";

/** Internship offer shape as returned by GET /api/offers. */
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

/** Fields of InternshipOfferRequest (POST /api/offers, PUT /api/offers/{id}). */
interface OfferForm {
  title: string;
  description: string;
  company: string;
  supervisorName: string;
  requiredSkills: string;
  location: string;
}

/** Fields of ApplicationRequest (POST /api/applications), minus offerId. */
interface ApplicationForm {
  studentName: string;
  studentEmail: string;
  skills: string;
  coverLetter: string;
}

const emptyOfferForm: OfferForm = {
  title: "",
  description: "",
  company: "",
  supervisorName: "",
  requiredSkills: "",
  location: "",
};

const emptyApplicationForm: ApplicationForm = {
  studentName: "",
  studentEmail: "",
  skills: "",
  coverLetter: "",
};

const inputClasses =
  "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";
const labelClasses = "block text-sm font-medium text-slate-700";

function offerToForm(offer: InternshipOffer): OfferForm {
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
  if (!requiredSkills) {
    return [];
  }
  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

function formatDate(value?: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString();
}

export default function OffersPage() {
  const [offers, setOffers] = useState<InternshipOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const [success, setSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<OfferForm>(emptyOfferForm);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<OfferForm>(emptyOfferForm);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [applyOffer, setApplyOffer] = useState<InternshipOffer | null>(null);
  const [applyForm, setApplyForm] =
    useState<ApplicationForm>(emptyApplicationForm);
  const [applying, setApplying] = useState(false);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<InternshipOffer[]>("/api/offers");
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const filteredOffers = offers.filter((offer) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      term.length === 0 ||
      offer.title.toLowerCase().includes(term) ||
      offer.company.toLowerCase().includes(term);
    const skill = skillFilter.trim().toLowerCase();
    const matchesSkill =
      skill.length === 0 ||
      (offer.requiredSkills ?? "").toLowerCase().includes(skill);
    return matchesSearch && matchesSkill;
  });

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setActionError("");
    setSuccess("");
    setCreating(true);
    try {
      await apiPost<InternshipOffer>("/api/offers", {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        company: createForm.company.trim(),
        supervisorName: createForm.supervisorName.trim() || undefined,
        requiredSkills: createForm.requiredSkills.trim() || undefined,
        location: createForm.location.trim() || undefined,
      });
      setCreateForm(emptyOfferForm);
      setShowCreate(false);
      setSuccess("Offer created successfully.");
      await loadOffers();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create the offer"
      );
    } finally {
      setCreating(false);
    }
  }

  function startEdit(offer: InternshipOffer) {
    setActionError("");
    setConfirmDeleteId(null);
    setEditingId(offer.id);
    setEditForm(offerToForm(offer));
  }

  async function handleEdit(event: React.FormEvent, id: number) {
    event.preventDefault();
    setActionError("");
    setSuccess("");
    setSavingEdit(true);
    try {
      await apiPut<InternshipOffer>(`/api/offers/${id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        company: editForm.company.trim(),
        supervisorName: editForm.supervisorName.trim() || undefined,
        requiredSkills: editForm.requiredSkills.trim() || undefined,
        location: editForm.location.trim() || undefined,
      });
      setEditingId(null);
      setSuccess("Offer updated successfully.");
      await loadOffers();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update the offer"
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: number) {
    setActionError("");
    setSuccess("");
    setDeleting(true);
    try {
      await apiDelete(`/api/offers/${id}`);
      setConfirmDeleteId(null);
      if (editingId === id) {
        setEditingId(null);
      }
      setSuccess("Offer deleted.");
      await loadOffers();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete the offer"
      );
    } finally {
      setDeleting(false);
    }
  }

  function startApply(offer: InternshipOffer) {
    setActionError("");
    setSuccess("");
    setApplyOffer(offer);
    setApplyForm(emptyApplicationForm);
  }

  async function handleApply(event: React.FormEvent) {
    event.preventDefault();
    if (!applyOffer) {
      return;
    }
    setActionError("");
    setApplying(true);
    try {
      await apiPost("/api/applications", {
        studentName: applyForm.studentName.trim(),
        studentEmail: applyForm.studentEmail.trim(),
        skills: applyForm.skills.trim() || undefined,
        coverLetter: applyForm.coverLetter.trim() || undefined,
        offerId: applyOffer.id,
      });
      setSuccess(
        `Application sent for “${applyOffer.title}” at ${applyOffer.company}. It starts as PENDING.`
      );
      setApplyOffer(null);
      setApplyForm(emptyApplicationForm);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to send the application"
      );
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Internship offers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? "Loading offers…"
              : `${offers.length} offer${offers.length === 1 ? "" : "s"} published`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowCreate((value) => !value);
            setActionError("");
          }}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {showCreate ? "Close form" : "+ New offer"}
        </button>
      </div>

      {/* Success / action error banners */}
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

      {/* Create offer form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Publish a new offer
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={labelClasses}>
              Title *
              <input
                type="text"
                required
                maxLength={150}
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm({ ...createForm, title: e.target.value })
                }
                className={inputClasses}
                placeholder="e.g. Data Engineering Intern"
              />
            </label>
            <label className={labelClasses}>
              Company *
              <input
                type="text"
                required
                maxLength={120}
                value={createForm.company}
                onChange={(e) =>
                  setCreateForm({ ...createForm, company: e.target.value })
                }
                className={inputClasses}
                placeholder="e.g. DataLab"
              />
            </label>
            <label className={labelClasses}>
              Location
              <input
                type="text"
                maxLength={100}
                value={createForm.location}
                onChange={(e) =>
                  setCreateForm({ ...createForm, location: e.target.value })
                }
                className={inputClasses}
                placeholder="e.g. Casablanca / Remote"
              />
            </label>
            <label className={labelClasses}>
              Supervisor name
              <input
                type="text"
                maxLength={120}
                value={createForm.supervisorName}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    supervisorName: e.target.value,
                  })
                }
                className={inputClasses}
                placeholder="e.g. Dr. Sara El Amrani"
              />
            </label>
            <label className={`${labelClasses} sm:col-span-2`}>
              Required skills (comma-separated)
              <input
                type="text"
                maxLength={500}
                value={createForm.requiredSkills}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    requiredSkills: e.target.value,
                  })
                }
                className={inputClasses}
                placeholder="e.g. Java, Spring Boot, SQL"
              />
            </label>
            <label className={`${labelClasses} sm:col-span-2`}>
              Description
              <textarea
                rows={3}
                maxLength={2000}
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                className={inputClasses}
                placeholder="What will the intern work on?"
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Publishing…" : "Publish offer"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Application form (opened from a card's Apply button) */}
      {applyOffer && (
        <form
          onSubmit={handleApply}
          className="mt-6 rounded-2xl border border-accent-200 bg-accent-50/60 p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Apply to “{applyOffer.title}”
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {applyOffer.company}
            {applyOffer.location ? ` — ${applyOffer.location}` : ""}
          </p>
          <div className="mt-4 grid gap-4 rounded-xl bg-white p-4 sm:grid-cols-2">
            <label className={labelClasses}>
              Your full name *
              <input
                type="text"
                required
                maxLength={120}
                value={applyForm.studentName}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, studentName: e.target.value })
                }
                className={inputClasses}
                placeholder="e.g. Amine Bouaouda"
              />
            </label>
            <label className={labelClasses}>
              Your email *
              <input
                type="email"
                required
                maxLength={150}
                value={applyForm.studentEmail}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, studentEmail: e.target.value })
                }
                className={inputClasses}
                placeholder="you@example.com"
              />
            </label>
            <label className={`${labelClasses} sm:col-span-2`}>
              Your skills (comma-separated)
              <input
                type="text"
                maxLength={500}
                value={applyForm.skills}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, skills: e.target.value })
                }
                className={inputClasses}
                placeholder="e.g. Java, Spring Boot, TypeScript"
              />
            </label>
            <label className={`${labelClasses} sm:col-span-2`}>
              Cover letter
              <textarea
                rows={3}
                maxLength={2000}
                value={applyForm.coverLetter}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, coverLetter: e.target.value })
                }
                className={inputClasses}
                placeholder="Why are you a good fit for this internship?"
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={applying}
              className="rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applying ? "Sending…" : "Send application"}
            </button>
            <button
              type="button"
              onClick={() => setApplyOffer(null)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2">
        <label className={labelClasses}>
          Search
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses}
            placeholder="Search by title or company…"
          />
        </label>
        <label className={labelClasses}>
          Filter by skill
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className={inputClasses}
            placeholder="e.g. Java, Spark, SQL…"
          />
        </label>
      </div>

      {/* Content states */}
      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-5 flex gap-2">
                <div className="h-6 w-16 rounded-full bg-slate-200" />
                <div className="h-6 w-16 rounded-full bg-slate-200" />
              </div>
              <div className="mt-6 h-9 rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">
            The offers could not be loaded.
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadOffers}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : offers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-4xl">💼</p>
          <p className="mt-3 font-semibold text-slate-900">No offers yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            There are no internship offers for the moment. Publish the first
            one with the “New offer” button above.
          </p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-semibold text-slate-900">
            No offer matches your search
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Try a different title, company or skill, or clear the filters
            above.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => {
            const chips = skillChips(offer.requiredSkills);
            const created = formatDate(offer.createdAt);
            const isConfirmingDelete = confirmDeleteId === offer.id;
            return (
              <article
                key={offer.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-md"
              >
                <h2 className="text-lg font-semibold leading-snug text-slate-900">
                  <Link
                    href={`/offers/${offer.id}`}
                    className="hover:text-brand-700 hover:underline"
                  >
                    {offer.title}
                  </Link>
                </h2>
                <p className="mt-1 font-medium text-brand-700">
                  {offer.company}
                </p>
                <div className="mt-2 space-y-1 text-sm text-slate-500">
                  <p>📍 {offer.location ?? "Location not set"}</p>
                  {offer.supervisorName && (
                    <p>👤 Supervisor: {offer.supervisorName}</p>
                  )}
                  {created && <p>🗓️ Posted on {created}</p>}
                </div>
                {offer.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {offer.description}
                  </p>
                )}
                {chips.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
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

                {editingId === offer.id ? (
                  <form
                    onSubmit={(event) => handleEdit(event, offer.id)}
                    className="mt-4 grid gap-3 border-t border-slate-100 pt-4"
                  >
                    <label className={labelClasses}>
                      Title *
                      <input
                        type="text"
                        required
                        maxLength={150}
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className={inputClasses}
                      />
                    </label>
                    <label className={labelClasses}>
                      Company *
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={editForm.company}
                        onChange={(e) =>
                          setEditForm({ ...editForm, company: e.target.value })
                        }
                        className={inputClasses}
                      />
                    </label>
                    <label className={labelClasses}>
                      Location
                      <input
                        type="text"
                        maxLength={100}
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        className={inputClasses}
                      />
                    </label>
                    <label className={labelClasses}>
                      Supervisor name
                      <input
                        type="text"
                        maxLength={120}
                        value={editForm.supervisorName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            supervisorName: e.target.value,
                          })
                        }
                        className={inputClasses}
                      />
                    </label>
                    <label className={labelClasses}>
                      Required skills (comma-separated)
                      <input
                        type="text"
                        maxLength={500}
                        value={editForm.requiredSkills}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            requiredSkills: e.target.value,
                          })
                        }
                        className={inputClasses}
                      />
                    </label>
                    <label className={labelClasses}>
                      Description
                      <textarea
                        rows={3}
                        maxLength={2000}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className={inputClasses}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingEdit ? "Saving…" : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : isConfirmingDelete ? (
                  <div className="mt-auto border-t border-slate-100 pt-4">
                    <p className="text-sm font-medium text-red-700">
                      Delete this offer? This cannot be undone.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => handleDelete(offer.id)}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deleting ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                      >
                        Keep it
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => startApply(offer)}
                      className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(offer)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError("");
                        setConfirmDeleteId(offer.id);
                      }}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
