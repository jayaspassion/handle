"use client";

// Last resort when the root layout itself fails, so it brings its own <html>
// and plain styles (globals.css may not be available).
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#faf8f5",
          color: "#281331",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6e6677" }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1.1rem",
              borderRadius: 6,
              border: 0,
              background: "#3d2145",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
