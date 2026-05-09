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
    <header className="top-bar">
      <div>
        <div className="top-bar__meta">FocusBlocks</div>
        <h1 className="top-bar__title">{title}</h1>
      </div>

      <div className="top-bar__actions">
        {userEmail ? (
          <span className="user-chip" title={userEmail}>
            {userEmail}
          </span>
        ) : null}

        <button className="btn btn-sm" type="button" onClick={onPrev} aria-label="Previous period">
          ← Prev
        </button>
        <button className="btn btn-sm primary" type="button" onClick={onToday}>
          Today
        </button>
        <button className="btn btn-sm" type="button" onClick={onNext} aria-label="Next period">
          Next →
        </button>

        <div className="top-bar__divider" aria-hidden />

        <div className="segmented" role="group" aria-label="FocusBlocks view mode">
          <button className={`btn btn-sm ${view === "day" ? "primary" : ""}`} type="button" onClick={() => onChangeView("day")}>
            Day
          </button>
          <button className={`btn btn-sm ${view === "week" ? "primary" : ""}`} type="button" onClick={() => onChangeView("week")}>
            Week
          </button>
          <button className={`btn btn-sm ${view === "month" ? "primary" : ""}`} type="button" onClick={() => onChangeView("month")}>
            Month
          </button>
        </div>

        <div className="top-bar__divider" aria-hidden />

        <button className="btn btn-sm primary" type="button" onClick={onNewBlock}>
          + New block
        </button>
        <button className="btn btn-sm btn-ghost" type="button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
