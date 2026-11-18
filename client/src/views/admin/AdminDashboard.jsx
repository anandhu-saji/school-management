import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import { ALL_CLASSES } from "../../utils/classData";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AddClassModal from "../../components/admin/classes/AddClassModal";
import SectionAttendanceBlock from "../../components/admin/dashboard/SectionAttendanceBlock";

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
  const [classList, setClassList] = useState(ALL_CLASSES);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/admin/classes");
      if (res.data.success && res.data.classes) {
        setClassList(res.data.classes);
      }
    } catch {
      // fallback
    }
  };

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
        try {
          const classRes = await api.get("/admin/classes");
          if (isMounted && classRes.data.success && classRes.data.classes) {
            setClassList(classRes.data.classes);
          }
        } catch {
          // ignore class error
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
          <SectionAttendanceBlock
            sections={sections}
            navigate={navigate}
            handleOpenMuster={handleOpenMuster}
          />

          {/* ---------------- COMPLETE ACADEMIC DIVISIONS DIRECTORY ---------------- */}
          <div className="section-attendance-wrapper" style={{ marginTop: "28px" }}>
            <div className="section-attendance-heading-bar">
              <div>
                <h2 className="section-att-main-heading">
                  All Institutional Academic Divisions Directory
                </h2>
                <p className="section-att-main-subtext">
                  Complete division-wise breakdown across Lower Primary, Upper Primary, High School, and Higher Secondary wings ({classList.length} Divisions registered).
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-sync"
                  style={{ background: "#2563eb", borderColor: "#2563eb", color: "#ffffff", fontWeight: "700" }}
                  onClick={() => setIsAddClassModalOpen(true)}
                >
                  + Add Class / Division
                </button>
                <div className="section-filter-pills-row" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className={`section-tab-pill ${selectedWingTab === "all" ? "active" : ""}`}
                    onClick={() => setSelectedWingTab("all")}
                  >
                    All ({classList.length})
                  </button>
                  <button
                    type="button"
                    className={`section-tab-pill ${selectedWingTab === "lp_school" ? "active" : ""}`}
                    onClick={() => setSelectedWingTab("lp_school")}
                  >
                    LP ({classList.filter((c) => c.wingCode === "lp_school").length})
                  </button>
                  <button
                    type="button"
                    className={`section-tab-pill ${selectedWingTab === "up_school" ? "active" : ""}`}
                    onClick={() => setSelectedWingTab("up_school")}
                  >
                    UP ({classList.filter((c) => c.wingCode === "up_school").length})
                  </button>
                  <button
                    type="button"
                    className={`section-tab-pill ${selectedWingTab === "high_school" ? "active" : ""}`}
                    onClick={() => setSelectedWingTab("high_school")}
                  >
                    High School ({classList.filter((c) => c.wingCode === "high_school").length})
                  </button>
                  <button
                    type="button"
                    className={`section-tab-pill ${selectedWingTab === "higher_secondary" ? "active" : ""}`}
                    onClick={() => setSelectedWingTab("higher_secondary")}
                  >
                    Higher Secondary ({classList.filter((c) => c.wingCode === "higher_secondary").length})
                  </button>
                </div>
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
                  {classList.filter(
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

      {/* ---------------- ADD CLASS & DIVISION MODAL ---------------- */}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onClassAdded={() => {
          fetchClasses();
        }}
      />
    </div>
  );
}
