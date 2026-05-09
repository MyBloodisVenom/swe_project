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
    <div style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
          padding: "0 4px",
        }}
      >
        {WEEKDAYS.map((w) => (
          <div key={w} className="muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>
            {w}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
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
                  className="card"
                  title="Click for day view • Double-click for new block"
                  style={{
                    minHeight: 108,
                    padding: "8px 10px",
                    borderRadius: 14,
                    cursor: "pointer",
                    outline: today ? "2px solid rgba(139,92,246,0.55)" : undefined,
                    background: inMonth ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
                    opacity: inMonth ? 1 : 0.55,
                    display: "grid",
                    gridTemplateRows: "auto 1fr",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "var(--mono)", color: today ? "var(--accent)" : "var(--text)" }}>
                      {format(day, "d")}
                    </span>
                    {list.length > 0 ? (
                      <span className="muted" style={{ fontSize: 11 }}>
                        {list.length} block{list.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>

                  <div style={{ display: "grid", gap: 4, alignContent: "start", overflow: "hidden" }}>
                    {list.slice(0, 3).map((b) => {
                      const start = toLocal(b.start_time);
                      const bg =
                        b.type === "locked"
                          ? "linear-gradient(180deg, rgba(239,68,68,0.22), rgba(239,68,68,0.1))"
                          : "linear-gradient(180deg, rgba(139,92,246,0.22), rgba(139,92,246,0.1))";
                      const border = b.type === "locked" ? "rgba(239,68,68,0.4)" : "rgba(139,92,246,0.4)";
                      return (
                        <button
                          key={b.id}
                          type="button"
                          className="btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBlock(b);
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 8,
                            fontSize: 11,
                            textAlign: "left",
                            background: bg,
                            borderColor: border,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
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
