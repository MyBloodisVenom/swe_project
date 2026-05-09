import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <div className="card error-boundary__card">
            <h1>Something broke</h1>
            <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
              FocusBlocks hit an unexpected error. Your data is still on the server; try reloading the page.
            </p>
            <pre>{this.state.error.message}</pre>
            <button type="button" className="btn primary" onClick={() => window.location.reload()}>
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
