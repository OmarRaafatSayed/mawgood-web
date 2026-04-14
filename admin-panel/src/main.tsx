import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app.js"

// Global error boundary wrapper
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Global Error Caught:", error)
    console.error("Component Stack:", errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "#f5f5f5",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h1 style={{ fontSize: "1.5rem", color: "#dc2626", marginBottom: "1rem" }}>
              تطبيق Mawgood Admin
            </h1>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              خطأ في التحميل
            </h2>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              حدث خطأ أثناء تحميل التطبيق. يرجى التحقق من الخادم وإعادة المحاولة.
            </p>
            {this.state.error && (
              <details style={{ background: "#f9fafb", padding: "1rem", borderRadius: "4px" }}>
                <summary style={{ cursor: "pointer", fontWeight: 500, marginBottom: "0.5rem" }}>
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <pre
                  style={{
                    fontSize: "0.875rem",
                    overflow: "auto",
                    maxHeight: "300px",
                    color: "#dc2626",
                  }}
                >
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
)
