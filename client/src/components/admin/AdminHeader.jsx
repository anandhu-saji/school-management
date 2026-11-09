export default function AdminHeader() {
  return (
    <header className="admin-top-header">
      <span>
        Kerala General Education Dept. •{" "}
        <strong>Sampoorna Admin Console</strong> • School Code: 06042
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="badge-sync">AY 2025–2026</span>
        <button
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#135bec",
            color: "#ffffff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Admin Profile"
        >
          A
        </button>
      </div>
    </header>
  );
}
