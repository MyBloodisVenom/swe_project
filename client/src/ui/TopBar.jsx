export function TopBar({
  title,
  view,
  onChangeView,
  onPrev,
  onNext,
  onToday,
  onNewBlock,
  userEmail,
  onLogout,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <div className="muted" style={{ fontSize: 12 }}>
          Time-Block Calendar
        </div>
        <div style={{ fontSize: 22, fontWeight: 600 }}>{title}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <div className="muted" style={{ fontSize: 12, marginRight: 6 }}>
          {userEmail}
        </div>

        <button className="btn" type="button" onClick={onPrev}>
          Prev
        </button>
        <button className="btn" type="button" onClick={onToday}>
          Today
        </button>
        <button className="btn" type="button" onClick={onNext}>
          Next
        </button>

        <div style={{ width: 1, height: 28, background: "var(--border)", margin: "0 2px" }} />

        <button className={`btn ${view === "day" ? "primary" : ""}`} type="button" onClick={() => onChangeView("day")}>
          Day
        </button>
        <button className={`btn ${view === "week" ? "primary" : ""}`} type="button" onClick={() => onChangeView("week")}>
          Week
        </button>
        <button className={`btn ${view === "month" ? "primary" : ""}`} type="button" onClick={() => onChangeView("month")}>
          Month
        </button>

        <div style={{ width: 1, height: 28, background: "var(--border)", margin: "0 2px" }} />

        <button className="btn primary" type="button" onClick={onNewBlock}>
          New block
        </button>
        <button className="btn" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

