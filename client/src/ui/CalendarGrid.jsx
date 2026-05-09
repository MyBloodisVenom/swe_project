import { addMinutes, differenceInMinutes, format, isSameDay, parseISO, set } from "date-fns";
import { useMemo } from "react";

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 56; // px

function toLocalDate(iso) {
  return parseISO(iso);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function CalendarGrid({ days, blocks, onSelectBlock, onCreateDraft }) {
  const hours = useMemo(() => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i), []);

  const blocksByDay = useMemo(() => {
    return days.map((day) => {
      const list = blocks.filter((b) => isSameDay(toLocalDate(b.start_time), day));
      return { day, list };
    });
  }, [blocks, days]);

  return (
    <div className="cal-scroll">
      <div
        className="cal-grid cal-grid--week"
        style={{ "--cols": days.length }}
      >
        <div />
        {days.map((d) => (
          <div key={d.toISOString()} className="cal-day-head">
            <div className="cal-day-head__dow">{format(d, "EEE")}</div>
            <div className="muted cal-day-head__date">{format(d, "MMM d")}</div>
          </div>
        ))}

        <div className="cal-time-rail">
          {hours.slice(0, -1).map((h) => (
            <div key={h} className="cal-time-slot">
              <span>{String(h).padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>

        {blocksByDay.map(({ day, list }) => (
          <DayColumn
            key={day.toISOString()}
            day={day}
            blocks={list}
            onSelectBlock={onSelectBlock}
            onCreateDraft={onCreateDraft}
          />
        ))}
      </div>
    </div>
  );
}

function DayColumn({ day, blocks, onSelectBlock, onCreateDraft }) {
  const totalHours = END_HOUR - START_HOUR;
  const height = totalHours * HOUR_HEIGHT;

  function handleDoubleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutesFromStart = clamp(Math.floor((y / HOUR_HEIGHT) * 60 / 15) * 15, 0, totalHours * 60 - 15);
    const start = addMinutes(set(day, { hours: START_HOUR, minutes: 0, seconds: 0, milliseconds: 0 }), minutesFromStart);
    const end = addMinutes(start, 60);
    onCreateDraft({ draft: true, date: day, startIso: start.toISOString(), endIso: end.toISOString() });
  }

  return (
    <div
      className="day-column"
      style={{
        height,
      }}
      onDoubleClick={handleDoubleClick}
      role="presentation"
      title="Double-click to add a 1-hour block"
    >
      {Array.from({ length: totalHours }, (_, i) => (
        <div
          key={i}
          className="day-column__line"
          style={{
            top: i * HOUR_HEIGHT,
            height: HOUR_HEIGHT,
            borderTop: i === 0 ? "none" : undefined,
          }}
        />
      ))}

      {blocks.map((b) => (
        <BlockPill key={b.id} block={b} day={day} onSelect={() => onSelectBlock(b)} />
      ))}
    </div>
  );
}

function BlockPill({ block, day, onSelect }) {
  const start = toLocalDate(block.start_time);
  const end = toLocalDate(block.end_time);
  const dayStart = set(day, { hours: START_HOUR, minutes: 0, seconds: 0, milliseconds: 0 });

  const minutesFromStart = differenceInMinutes(start, dayStart);
  const durationMin = Math.max(15, differenceInMinutes(end, start));

  const top = (minutesFromStart / 60) * HOUR_HEIGHT;
  const height = (durationMin / 60) * HOUR_HEIGHT;

  const variant = block.type === "locked" ? "block-pill--locked" : "block-pill--flex";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`btn block-pill ${variant}`}
      style={{
        top: clamp(top, 0, 99999),
        height: clamp(height, 28, 99999),
      }}
      title={`${format(start, "p")} – ${format(end, "p")}`}
    >
      <div style={{ display: "grid", gap: 4, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
          <div style={{ fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{block.title}</div>
          <div className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
            {format(start, "HH:mm")}–{format(end, "HH:mm")}
          </div>
        </div>
        <div className="muted" style={{ fontSize: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span>★ {block.importance}</span>
          {block.location ? <span>{block.location}</span> : null}
          <span>{block.type}</span>
        </div>
      </div>
    </button>
  );
}
