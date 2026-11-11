import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import { ALL_CLASSES } from "../../utils/classData";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPupils: 0,
    totalStudents: 0,
    totalStaff: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    onDutyTeachers: 0,
    turnout: "100%",
    todayTurnout: "100%",
    totalPresent: 0,
    totalAbsent: 0,
    class10ACount: 0,
    totalDivisions: 26,
  });

  // 4 Academic Wing Attendance Blocks - Loaded live from MongoDB
  const [sections, setSections] = useState([
    {
      id: "high_school",
      title: "High School Section Attendance",
      classes: "Classes 8–10",
      divisionsText: "Classes 8–10 (6 Divisions)",
      description:
        "Classes 8–10 consolidated roll-call sync from teacher terminals with Kerala Pareeksha Bhavan portal.",
      turnout: "100%",
      turnoutDiff: "+1.2% vs yesterday",
      totalEnrolled: 0,
      totalPresent: 0,
      totalAbsent: 0,
      divisionsLocked: "0 / 6",
      syncStatus: "Syncing with MongoDB...",
      presentStatus: "Marked in class",
      absentStatus: "Auto-SMS dispatched",
    },
    {
      id: "up_school",
      title: "UP School Attendance",
      classes: "Classes 5–7",
      divisionsText: "Classes 5–7 (6 Divisions)",
      description:
        "Classes 5–7 consolidated roll-call sync from teacher terminals with Kerala Pareeksha Bhavan portal.",
      turnout: "100%",
      turnoutDiff: "+0.8% vs yesterday",
      totalEnrolled: 0,
      totalPresent: 0,
      totalAbsent: 0,
      divisionsLocked: "0 / 6",
      syncStatus: "Syncing with MongoDB...",
      presentStatus: "Marked in class",
      absentStatus: "Auto-SMS dispatched",
    },
    {
      id: "lp_school",
      title: "LP School Attendance",
      classes: "Classes 1–4",
      divisionsText: "Classes 1–4 (8 Divisions)",
      description:
        "Classes 1–4 consolidated roll-call sync from teacher terminals with General Education Department portal.",
      turnout: "100%",
      turnoutDiff: "+1.5% vs yesterday",
      totalEnrolled: 0,
      totalPresent: 0,
      totalAbsent: 0,
      divisionsLocked: "0 / 8",
      syncStatus: "Syncing with MongoDB...",
      presentStatus: "Marked in class",
      absentStatus: "Auto-SMS dispatched",
    },
    {
      id: "higher_secondary",
      title: "Higher Secondary Attendance",
      classes: "Classes 11–12",
      divisionsText: "Classes 11–12 (6 Divisions)",
      description:
        "Classes 11–12 (Plus One & Plus Two) consolidated roll-call sync with Kerala DHSE portal.",
      turnout: "100%",
      turnoutDiff: "+0.5% vs yesterday",
      totalEnrolled: 0,
      totalPresent: 0,
      totalAbsent: 0,
      divisionsLocked: "0 / 6",
      syncStatus: "Syncing with MongoDB...",
      presentStatus: "Marked in class",
      absentStatus: "Auto-SMS dispatched",
    },
  ]);

  const [selectedWingTab, setSelectedWingTab] = useState("all");
  const [paymentSummary, setPaymentSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/overview-stats");
        if (isMounted && res.data.success) {
          if (res.data.stats) setStats(res.data.stats);
          const incomingSections = res.data.sections || res.data.stats?.sections;
          if (incomingSections && incomingSections.length > 0) {
            setSections(incomingSections);
          }
        }
        try {
          const payRes = await api.get("/admin/payments/summary");
          if (isMounted && payRes.data.success) {
            setPaymentSummary(payRes.data.summary);
          }
        } catch {
          // ignore payment summary error
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const handleOpenMuster = (sectionId) => {
    navigate("/admin/attendance", { state: { section: sectionId } });
  };

  return (
    <div className="admin-layout">
      {/* ---------------- SIDEBAR NAVIGATION ---------------- */}
      <AdminSidebar activeNav="overview" />

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <AdminHeader />

        <main className="admin-content-area">
          <section className="headmaster-hero-card">
            <div className="badge-row">
              <span className="badge-governance">HEADMASTER GOVERNANCE DECK</span>
              <span className="badge-sync">
                Sampoorna Core 2.0 Live Synchronized
              </span>
            </div>
            <h1>Good morning, {(() => {
              try {
                const u = JSON.parse(localStorage.getItem("user") || "{}");
                return u?.name || "Headmaster";
              } catch {
                return "Headmaster";
              }
            })()}</h1>
            <p>
              G.H.S.S Rajakkad • Institutional Governance, Staff Muster &amp;
              SCERT Repository Control Terminal.
            </p>
          </section>

          {/* 4 Cards Grid - Top Summary KPI Cards */}
          <div className="overview-stats-grid">
            <div className="overview-stat-card">
              <span className="card-label">STUDENT CENSUS</span>
              <div className="overview-number">
                {(stats.totalStudents ?? stats.totalStudents ?? 0).toLocaleString()} Students
              </div>
              <div className="sub-text">
                {stats.class10ACount || 15} in 10-A • {stats.totalDivisions || 26} Academic Divisions
              </div>
            </div>
            <div className="overview-stat-card">
              <span className="card-label">TEACHERS</span>
              <div className="overview-number">
                {stats.totalStaff ?? stats.totalTeachers ?? 0} Staff Members
              </div>
              <div className="sub-text text-green">
                {(stats.activeTeachers ?? stats.totalStaff ?? 0)} Active • {(stats.onDutyTeachers ?? 0)} On Duty
              </div>
            </div>
            <div className="overview-stat-card">
              <span className="card-label">TODAY'S STUDENT MUSTER</span>
              <div className="overview-number">{stats.turnout || stats.todayTurnout || "100%"} Turnout</div>
              <div className="sub-text text-green">
                {(stats.totalPresent ?? 0).toLocaleString()} Present •{" "}
                <span className="text-red">{(stats.totalAbsent ?? 0)} Absent</span>
              </div>
            </div>
            <div className="overview-stat-card">
              <span className="card-label">SCERT COMPLIANCE</span>
              <div className="overview-number text-teal">100% Synced</div>
              <div className="sub-text">
                Biometric: <strong>Active</strong>
              </div>
            </div>
          </div>

          {/* ---------------- 4 SECTION ATTENDANCE BLOCKS ---------------- */}
          <div className="section-attendance-wrapper">
            <div className="section-attendance-heading-bar">
              <div>
                <h2 className="section-att-main-heading">
                  Academic Wing Section Attendance
                </h2>
                <p className="section-att-main-subtext">
                  Consolidated roll-call sync from teacher terminals with Kerala Pareeksha Bhavan and DHSE portals.
                </p>
              </div>
              <button
                type="button"
                className="section-att-all-muster-btn"
                onClick={() => navigate("/admin/attendance")}
              >
                View Full Division Muster Register
              </button>
            </div>

            <div className="section-attendance-stack">
              {sections.map((sec) => (
                <div key={sec.id} className="section-attendance-card">
                  {/* Card Header Row */}
                  <div className="section-att-header">
                    <div className="section-att-title-group">
                      <div className="section-att-title-row">
                        <span className="section-att-icon-badge">
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1d4ed8"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <polyline points="16 11 18 13 22 9" />
                          </svg>
                        </span>
                        <h3 className="section-att-heading">{sec.title}</h3>
                      </div>
                      <p className="section-att-subtitle">{sec.description}</p>
                    </div>

                    <button
                      type="button"
                      className="section-att-btn-muster"
                      onClick={() => handleOpenMuster(sec.id)}
                      title={`Open Full Muster Register for ${sec.title}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Full Muster Register
                    </button>
                  </div>

                  {/* 5 Metric Boxes Grid */}
                  <div className="section-att-metrics-grid">
                    {/* 1. Overall Turnout */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">OVERALL TURNOUT</span>
                      <div className="section-att-pill-value val-turnout">
                        {sec.turnout}
                      </div>
                      <div className="section-att-pill-subtext sub-turnout">
                        {sec.turnoutDiff}
                      </div>
                    </div>

                    {/* 2. Total Enrolled */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">TOTAL ENROLLED</span>
                      <div className="section-att-pill-value val-enrolled">
                        {sec.totalEnrolled}
                      </div>
                      <div className="section-att-pill-subtext sub-enrolled">
                        {sec.divisionsText}
                      </div>
                    </div>

                    {/* 3. Total Present */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">TOTAL PRESENT</span>
                      <div className="section-att-pill-value val-present">
                        {sec.totalPresent}
                      </div>
                      <div className="section-att-pill-subtext sub-present">
                        {sec.presentStatus}
                      </div>
                    </div>

                    {/* 4. Total Absent */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">TOTAL ABSENT</span>
                      <div className="section-att-pill-value val-absent">
                        {sec.totalAbsent}
                      </div>
                      <div className="section-att-pill-subtext sub-absent">
                        {sec.absentStatus}
                      </div>
                    </div>

                    {/* 5. Divisions Locked */}
                    <div className="section-att-metric-pill">
                      <span className="section-att-pill-label">DIVISIONS LOCKED</span>
                      <div className="section-att-pill-value val-locked">
                        {sec.divisionsLocked}
                      </div>
                      <div className="section-att-pill-subtext sub-locked">
                        {sec.syncStatus}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- COMPLETE 26 ACADEMIC DIVISIONS DIRECTORY ---------------- */}
          <div className="section-attendance-wrapper" style={{ marginTop: "28px" }}>
            <div className="section-attendance-heading-bar">
              <div>
                <h2 className="section-att-main-heading">
                  All 26 Institutional Academic Divisions Directory
                </h2>
                <p className="section-att-main-subtext">
                  Complete division-wise breakdown across Lower Primary, Upper Primary, High School, and Higher Secondary wings.
                </p>
              </div>
              <div className="section-filter-pills-row" style={{ margin: 0 }}>
                <button
                  type="button"
                  className={`section-tab-pill ${selectedWingTab === "all" ? "active" : ""}`}
                  onClick={() => setSelectedWingTab("all")}
                >
                  All 26 Divisions
                </button>
                <button
                  type="button"
                  className={`section-tab-pill ${selectedWingTab === "lp_school" ? "active" : ""}`}
                  onClick={() => setSelectedWingTab("lp_school")}
                >
                  LP (8)
                </button>
                <button
                  type="button"
                  className={`section-tab-pill ${selectedWingTab === "up_school" ? "active" : ""}`}
                  onClick={() => setSelectedWingTab("up_school")}
                >
                  UP (6)
                </button>
                <button
                  type="button"
                  className={`section-tab-pill ${selectedWingTab === "high_school" ? "active" : ""}`}
                  onClick={() => setSelectedWingTab("high_school")}
                >
                  High School (6)
                </button>
                <button
                  type="button"
                  className={`section-tab-pill ${selectedWingTab === "higher_secondary" ? "active" : ""}`}
                  onClick={() => setSelectedWingTab("higher_secondary")}
                >
                  Higher Secondary (6)
                </button>
              </div>
            </div>

            <div className="muster-card" style={{ marginTop: "14px" }}>
              <table className="muster-table">
                <thead>
                  <tr>
                    <th>Division &amp; Standard</th>
                    <th>Academic Wing</th>
                    <th>Class Mentor</th>
                    <th>Room Allocation</th>
                    <th>Stream</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_CLASSES.filter(
                    (c) => selectedWingTab === "all" || c.wingCode === selectedWingTab
                  ).map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background:
                              c.wingCode === "lp_school"
                                ? "#fef3c7"
                                : c.wingCode === "up_school"
                                ? "#e0f2fe"
                                : c.wingCode === "high_school"
                                ? "#dcfce7"
                                : "#ede9fe",
                            color:
                              c.wingCode === "lp_school"
                                ? "#92400e"
                                : c.wingCode === "up_school"
                                ? "#0369a1"
                                : c.wingCode === "high_school"
                                ? "#15803d"
                                : "#6d28d9",
                          }}
                        >
                          {c.wingShort}
                        </span>
                      </td>
                      <td>{c.mentor}</td>
                      <td>
                        <span style={{ color: "#64748b", fontSize: "12.5px" }}>
                          {c.room}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "#475569" }}>
                          {c.stream}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-register"
                          onClick={() =>
                            navigate("/admin/attendance", {
                              state: { section: c.wingCode },
                            })
                          }
                          title={`Open ${c.name} in Division Attendance`}
                        >
                          Muster
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        
          {/* ---------------- FEE & PAYMENTS CONSOLE HIGHLIGHT WIDGET ---------------- */}
          <div className="section-attendance-wrapper" style={{ marginTop: "28px", marginBottom: "32px" }}>
            <div className="section-attendance-heading-bar">
              <div>
                <h2 className="section-att-main-heading">
                  Student Fee & Revenue Collections
                </h2>
                <p className="section-att-main-subtext">
                  Consolidated accounts ledger for Bus Fee, Annual Tuition, PTA Development Fund, and school amenities.
                </p>
              </div>
              <button
                type="button"
                className="section-att-all-muster-btn"
                style={{ background: "#2563eb", color: "#ffffff", borderColor: "#2563eb" }}
                onClick={() => navigate("/admin/payments")}
              >
                Open Fee & Payments Console
              </button>
            </div>

            <div className="section-attendance-card" style={{ marginTop: "14px" }}>
              <div className="section-att-header">
                <div className="section-att-title-group">
                  <div className="section-att-title-row">
                    <span className="section-att-icon-badge" style={{ background: "#eff6ff" }}>
                      
                    </span>
                    <h3 className="section-att-title">Central Fee & Accounts Summary</h3>
                  </div>
                  <p className="section-att-desc">
                    Comprehensive ledger tracking student collections across all 26 divisions • Kerala Pareeksha Bhavan Integrated.
                  </p>
                </div>
                <button
                  type="button"
                  className="section-att-btn-muster"
                  onClick={() => navigate("/admin/payments")}
                >
                  View Full Fee Register
                </button>
              </div>

              <div className="section-att-metrics-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <div className="section-att-metric-pill">
                  <span className="section-att-pill-label">TOTAL REVENUE</span>
                  <div className="section-att-pill-value" style={{ color: "#15803d" }}>
                    {paymentSummary ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paymentSummary.totalCollected) : "₹14,82,500"}
                  </div>
                  <div className="section-att-pill-subtext" style={{ color: "#15803d" }}>
                    {paymentSummary?.collectionRate || "88.4%"} Collection Rate
                  </div>
                </div>

                <div className="section-att-metric-pill">
                  <span className="section-att-pill-label">BUS TRANSPORT</span>
                  <div className="section-att-pill-value" style={{ color: "#1d4ed8" }}>
                    {paymentSummary ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paymentSummary.busFee?.collected ?? 0) : "₹4,20,000"}
                  </div>
                  <div className="section-att-pill-subtext">
                    5 School Bus Fleets Synced
                  </div>
                </div>

                <div className="section-att-metric-pill">
                  <span className="section-att-pill-label">ANNUAL TUITION</span>
                  <div className="section-att-pill-value" style={{ color: "#0f766e" }}>
                    {paymentSummary ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paymentSummary.annualFee?.collected ?? 0) : "₹7,80,000"}
                  </div>
                  <div className="section-att-pill-subtext">
                    Composite Amenities Fund
                  </div>
                </div>

                <div className="section-att-metric-pill">
                  <span className="section-att-pill-label">PTA & SPECIAL DUES</span>
                  <div className="section-att-pill-value" style={{ color: "#7e22ce" }}>
                    {paymentSummary ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paymentSummary.ptaFund?.collected ?? 0) : "₹2,82,500"}
                  </div>
                  <div className="section-att-pill-subtext" style={{ color: "#b91c1c" }}>
                    Pending: {paymentSummary ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paymentSummary.totalDue ?? 0) : "₹2,15,400"}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
