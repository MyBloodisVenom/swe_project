import { format, isSameMonth, isToday, parseISO } from "date-fns";
import { useMemo } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayKey(d) {
  return format(d, "yyyy-MM-dd");
}

function toLocal(iso) {
  return parseISO(iso);
}

export function MonthCalendarGrid({ monthAnchor, days, blocks, onPickDay, onSelectBlock, onCreateDraft }) {
  const blocksByDay = useMemo(() => {
    const map = new Map();
    for (const b of blocks) {
      const k = dayKey(toLocal(b.start_time));
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(b);
    }
    for (const [, list] of map) {
      list.sort((a, b) => toLocal(a.start_time).getTime() - toLocal(b.start_time).getTime());
    }
    return map;
  }, [blocks]);

  const weeks = useMemo(() => {
    const rows = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [days]);

  return (
    <div className="month-grid">
      <div className="month-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="month-week">
            {week.map((day) => {
              const k = dayKey(day);
              const list = blocksByDay.get(k) || [];
              const inMonth = isSameMonth(day, monthAnchor);
              const today = isToday(day);

              function handleCellClick() {
                onPickDay(day);
              }

              function handleDoubleClick(e) {
                e.stopPropagation();
                onCreateDraft({ draft: true, date: day });
              }

              const cellClass = ["month-cell", !inMonth ? "month-cell--fade" : "", today ? "month-cell--today" : ""]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={day.toISOString()}
                  role="button"
                  tabIndex={0}
                  onClick={handleCellClick}
                  onDoubleClick={handleDoubleClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPickDay(day);
                    }
                  }}
                  className={cellClass}
                  title="Click: day view · Double-click: new block"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span className={`month-cell__day ${today ? "month-cell__day--today" : ""}`}>{format(day, "d")}</span>
                    {list.length > 0 ? (
                      <span className="muted" style={{ fontSize: 11 }}>
                        {list.length}
                      </span>
                    ) : null}
                  </div>

                  <div style={{ display: "grid", gap: 4, alignContent: "start", overflow: "hidden" }}>
                    {list.slice(0, 3).map((b) => {
                      const start = toLocal(b.start_time);
                      const locked = b.type === "locked";
                      const pillClass = locked ? "month-block-btn btn btn-sm block-pill--locked" : "month-block-btn btn btn-sm block-pill--flex";
                      return (
                        <button
                          key={b.id}
                          type="button"
                          className={pillClass}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBlock(b);
                          }}
                          title={b.title}
                        >
                          <span style={{ fontFamily: "var(--mono)", marginRight: 6 }}>{format(start, "HH:mm")}</span>
                          {b.title || "(untitled)"}
                        </button>
                      );
                    })}
                    {list.length > 3 ? (
                      <div className="muted" style={{ fontSize: 11 }}>
                        +{list.length - 3} more
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
