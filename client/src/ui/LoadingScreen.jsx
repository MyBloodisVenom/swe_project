export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="card loading-card" role="status" aria-live="polite">
        <div className="spinner" aria-hidden />
        <p>Verifying your session…</p>
      </div>
    </div>
  );
}
