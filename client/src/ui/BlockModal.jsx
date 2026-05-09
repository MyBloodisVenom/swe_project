import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../api.js";

function isoToInputs(iso) {
  const d = parseISO(iso);
  return { date: format(d, "yyyy-MM-dd"), time: format(d, "HH:mm") };
}

function localToIso(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map((v) => Number(v));
  const [hh, mm] = timeStr.split(":").map((v) => Number(v));
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
}

export function BlockModal({ open, value, onClose, token, onSaved, onDeleted }) {
  const isEdit = !!value && !value.draft;
  const titleRef = useRef(null);

  const initial = useMemo(() => {
    if (!value) return null;
    if (value.draft) {
      const date = value.date ? format(value.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
      const start = value.startIso ? isoToInputs(value.startIso) : { date, time: "09:00" };
      const end = value.endIso ? isoToInputs(value.endIso) : { date, time: "10:00" };
      return {
        title: "",
        date,
        startTime: start.time,
        endTime: end.time,
        importance: 3,
        location: "",
        type: "flexible",
      };
    }
    const s = isoToInputs(value.start_time);
    const e = isoToInputs(value.end_time);
    return {
      title: value.title || "",
      date: s.date,
      startTime: s.time,
      endTime: e.time,
      importance: value.importance || 3,
      location: value.location || "",
      type: value.type || "flexible",
    };
  }, [value]);

  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initial);
    setError("");
    setBusy(false);
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open, value]);

  if (!open) return null;
  if (!form) return null;

  async function save() {
    setError("");
    const titleTrim = form.title.trim();
    if (!titleTrim) {
      setError("Please enter a title.");
      titleRef.current?.focus();
      return;
    }

    let startIso;
    let endIso;
    try {
      startIso = localToIso(form.date, form.startTime);
      endIso = localToIso(form.date, form.endTime);
    } catch {
      setError("Invalid date or time.");
      return;
    }

    if (new Date(endIso) <= new Date(startIso)) {
      setError("End time must be after start time (same calendar day).");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        title: titleTrim,
        start_time: startIso,
        end_time: endIso,
        importance: Number(form.importance),
        location: form.location.trim() ? form.location.trim() : null,
        type: form.type,
      };

      if (isEdit) {
        await apiFetch(`/api/blocks/${value.id}`, { token, method: "PUT", body: payload });
      } else {
        await apiFetch("/api/blocks", { token, method: "POST", body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!isEdit) return;
    setError("");
    setBusy(true);
    try {
      await apiFetch(`/api/blocks/${value.id}`, { token, method: "DELETE" });
      onDeleted();
    } catch (err) {
      setError(err.message || "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-modal-title"
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card modal-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
              {isEdit ? "Edit block" : "New block"}
            </div>
            <h2 id="block-modal-title" style={{ margin: "6px 0 0", fontSize: "1.25rem", fontWeight: 700 }}>
              {form.title?.trim() ? form.title : "Untitled"}
            </h2>
          </div>
          <button className="btn btn-sm" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal-fields">
          <div className="field">
            <label htmlFor="block-title">Title</label>
            <input
              ref={titleRef}
              id="block-title"
              className={`input ${error && !form.title.trim() ? "input-error" : ""}`}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Deep work, Lecture, Gym"
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label htmlFor="block-date">Date</label>
            <input
              id="block-date"
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="block-start">Start</label>
            <input
              id="block-start"
              className="input"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="block-end">End</label>
            <input
              id="block-end"
              className="input"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="block-importance">Importance (1–5)</label>
            <select
              id="block-importance"
              className="input"
              value={form.importance}
              onChange={(e) => setForm((f) => ({ ...f, importance: Number(e.target.value) }))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="block-type">Type</label>
            <select id="block-type" className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="flexible">Flexible</option>
              <option value="locked">Locked</option>
            </select>
          </div>

          <div className="field field--full">
            <label htmlFor="block-location">Location (optional)</label>
            <input
              id="block-location"
              className="input"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Library, Zoom link, campus room…"
            />
          </div>
        </div>

        {error ? (
          <div className="alert alert-error" style={{ marginTop: 14 }} role="alert">
            <div className="alert-body">{error}</div>
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 18, alignItems: "center", flexWrap: "wrap" }}>
          <div className="muted" style={{ fontSize: 12 }}>
            Tip: overlapping blocks return HTTP 409 from the API.
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {isEdit ? (
              <button className="btn danger" disabled={busy} type="button" onClick={del}>
                Delete
              </button>
            ) : null}
            <button className="btn primary" disabled={busy} type="button" onClick={save}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
