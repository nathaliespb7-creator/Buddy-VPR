import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Ловит ошибки в дереве компонентов и показывает заглушку вместо белого экрана */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          padding: "2rem",
          fontFamily: "'Manrope', sans-serif",
          textAlign: "center",
          maxWidth: "400px",
          margin: "2rem auto",
        }}>
          <h2 style={{ color: "#0d9488" }}>Что-то пошло не так</h2>
          <p style={{ color: "#64748b", marginBottom: "1rem" }}>
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "0.5rem 1rem",
              background: "#0d9488",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
