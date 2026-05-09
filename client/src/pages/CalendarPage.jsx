import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api.js";
import { BlockModal } from "../ui/BlockModal.jsx";
import { CalendarGrid } from "../ui/CalendarGrid.jsx";
import { MonthCalendarGrid } from "../ui/MonthCalendarGrid.jsx";
import { TopBar } from "../ui/TopBar.jsx";
import { useAuth } from "../state/useAuth.jsx";

export function CalendarPage() {
  const { token, user, logout } = useAuth();
  const [view, setView] = useState("week"); // day | week | month
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [blocks, setBlocks] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | block | { draft: true, startIso, endIso, date }

  const range = useMemo(() => {
    if (view === "month") {
      const monthStart = startOfMonth(anchorDate);
      const monthEnd = endOfMonth(anchorDate);
      return {
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
      };
    }
    if (view === "day") {
      const start = startOfDay(anchorDate);
      const end = endOfDay(anchorDate);
      return { start, end };
    }
    const start = startOfWeek(anchorDate, { weekStartsOn: 1 });
    const end = endOfWeek(anchorDate, { weekStartsOn: 1 });
    return { start, end };
  }, [anchorDate, view]);

  const days = useMemo(() => {
    if (view === "month") return eachDayOfInterval({ start: range.start, end: range.end });
    if (view === "day") return [range.start];
    return Array.from({ length: 7 }, (_, i) => addDays(range.start, i));
  }, [range.start, range.end, view]);

  async function load() {
    setError("");
    setBusy(true);
    try {
      const data = await apiFetch(
        `/api/blocks?start=${encodeURIComponent(range.start.toISOString())}&end=${encodeURIComponent(range.end.toISOString())}`,
        { token }
      );
      setBlocks(data.blocks || []);
    } catch (err) {
      setError(err.message || "Failed to load blocks");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, range.start.toISOString(), range.end.toISOString()]);

  function goPrev() {
    setAnchorDate((d) => {
      if (view === "month") return addMonths(d, -1);
      if (view === "day") return addDays(d, -1);
      return addDays(d, -7);
    });
  }
  function goNext() {
    setAnchorDate((d) => {
      if (view === "month") return addMonths(d, 1);
      if (view === "day") return addDays(d, 1);
      return addDays(d, 7);
    });
  }

  const title = useMemo(() => {
    if (view === "month") return format(anchorDate, "MMMM yyyy");
    if (view === "day") return format(anchorDate, "EEE, MMM d");
    return `${format(range.start, "MMM d")} – ${format(range.end, "MMM d")}`;
  }, [anchorDate, range.end, range.start, view]);

  const rangeLabel = useMemo(
    () => `${format(range.start, "MMM d")} → ${format(range.end, "MMM d, yyyy")}`,
    [range.start, range.end]
  );

  const showEmptyHint = !busy && !error && blocks.length === 0 && view !== "month";

  return (
    <div className="container">
      <TopBar
        title={title}
        view={view}
        onChangeView={setView}
        onPrev={goPrev}
        onNext={goNext}
        onToday={() => setAnchorDate(new Date())}
        onNewBlock={() => setEditing({ draft: true, date: anchorDate })}
        userEmail={user?.email || ""}
        onLogout={logout}
      />

      {error ? (
        <div className="alert alert-error" role="alert">
          <div className="alert-body">{error}</div>
          <button className="btn btn-sm primary" type="button" onClick={() => load()}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="card card-dense">
        <div className="cal-toolbar">
          <div>
            <strong>{busy ? "Loading blocks…" : `${blocks.length} block${blocks.length === 1 ? "" : "s"} in view`}</strong>
            <span className="muted" style={{ marginLeft: 10 }}>
              {view === "month"
                ? "Shift+click a day to add a block. Otherwise click a day for the hourly view."
                : "Click empty space in the grid to add a 1-hour block. Locked = fixed · overlaps rejected (touching OK)."}
            </span>
          </div>
          <div className="muted cal-hint" title="Current fetch window">
            {rangeLabel}
          </div>
        </div>

        {showEmptyHint ? (
          <div className="empty-state" style={{ marginBottom: 14 }}>
            <h3>No blocks in this range</h3>
            <p className="muted">
              In day/week view, <strong style={{ color: "var(--text)" }}>click empty space</strong> on the timeline to add an hour, use{" "}
              <strong style={{ color: "var(--text)" }}>+ New block</strong>, or open{" "}
              <strong style={{ color: "var(--text)" }}>Month</strong> and Shift+click a day for a quick add.
            </p>
          </div>
        ) : null}

        {view === "month" ? (
          <MonthCalendarGrid
            monthAnchor={anchorDate}
            days={days}
            blocks={blocks}
            onPickDay={(d) => {
              setAnchorDate(d);
              setView("day");
            }}
            onSelectBlock={(b) => setEditing(b)}
            onCreateDraft={(draft) => setEditing(draft)}
          />
        ) : (
          <CalendarGrid days={days} blocks={blocks} onSelectBlock={(b) => setEditing(b)} onCreateDraft={(draft) => setEditing(draft)} />
        )}
      </div>

      <BlockModal
        open={!!editing}
        value={editing}
        onClose={() => setEditing(null)}
        token={token}
        onSaved={() => {
          setEditing(null);
          load();
        }}
        onDeleted={() => {
          setEditing(null);
          load();
        }}
      />
    </div>
  );
}
