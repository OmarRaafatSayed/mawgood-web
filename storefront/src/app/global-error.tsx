"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "#f9fafb",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
          data-testid="global-error"
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#111" }}>
              حدث خطأ غير متوقع
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: "0.6rem 1.5rem",
                  background: "#F36418",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
                data-testid="global-error-retry-button"
              >
                حاول مرة أخرى
              </button>
              <a
                href="/"
                style={{
                  padding: "0.6rem 1.5rem",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                الصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
