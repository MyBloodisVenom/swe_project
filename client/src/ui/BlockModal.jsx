import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
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

  if (!open) return null;
  if (!form) return null;

  async function save() {
    setError("");
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        start_time: localToIso(form.date, form.startTime),
        end_time: localToIso(form.date, form.endTime),
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
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "grid",
        placeItems: "center",
        padding: 18,
        zIndex: 50,
      }}
    >
      <div className="card" style={{ width: "min(720px, 100%)", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>
              {isEdit ? "Edit block" : "New block"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>{form.title?.trim() ? form.title : "Untitled"}</div>
          </div>
          <button className="btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginTop: 12 }}>
          <div className="field">
            <label>Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="field">
            <label>Date</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="field">
            <label>Start time</label>
            <input
              className="input"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>End time</label>
            <input
              className="input"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </div>

          <div className="field">
            <label>Importance (1–5)</label>
            <select
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
            <label>Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="flexible">Flexible</option>
              <option value="locked">Locked</option>
            </select>
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Location (optional)</label>
            <input
              className="input"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Library, Office, Zoom"
            />
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: 12, border: "1px solid rgba(239,68,68,0.45)", background: "rgba(239,68,68,0.12)", padding: 10, borderRadius: 10 }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, alignItems: "center" }}>
          <div className="muted" style={{ fontSize: 12 }}>
            Overlaps are blocked by the API (HTTP 409).
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

