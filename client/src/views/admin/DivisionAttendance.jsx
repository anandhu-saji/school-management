import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/AdminDash.css";
import { ALL_CLASSES } from "../../utils/classData";

export default function DivisionAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(
    location.state?.section || "all"
  );
  const [divisions, setDivisions] = useState(
    ALL_CLASSES.map((c) => ({
      id: c.id,
      standardDivision: c.name,
      stream: c.stream ? `(${c.stream})` : "(General)",
      mentor: c.mentor,
      enrolled: c.enrolled || 45,
      present: c.present || 43,
      absent: c.absent || 2,
      turnoutRate: c.turnoutRate || "95.6%",
      syncStatus: "Verified & Locked",
      section: c.code || (c.standard?.includes("11") || c.standard?.includes("12") ? "higher_secondary" : c.standard?.includes("8") || c.standard?.includes("9") || c.standard?.includes("10") ? "high_school" : c.standard?.includes("5") || c.standard?.includes("6") || c.standard?.includes("7") ? "up_school" : "lp_school"),
      sectionLabel: c.wingShort || "General",
    }))
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Class Attendance Register Modal State
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDate, setRegisterDate] = useState(todayStr);
  const [registerStudents, setRegisterStudents] = useState([]);
  const [registerStats, setRegisterStats] = useState({
    totalEnrolled: 0,
    presentCount: 0,
    absentCount: 0,
    leaveCount: 0,
    turnoutRate: "100%",
  });
  const [registerMentor, setRegisterMentor] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSaving, setRegisterSaving] = useState(false);
  const [registerSearch, setRegisterSearch] = useState("");
  const [registerFilter, setRegisterFilter] = useState("All");
  const [registerFeedback, setRegisterFeedback] = useState({
    type: "",
    message: "",
  });

  // Fetch Division Muster List
  const fetchMuster = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/division-muster");
      if (res.data.success) {
        setDivisions(res.data.divisions || []);
      }
    } catch (err) {
      console.error("Error loading muster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadMuster = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/division-muster");
        if (isMounted && res.data.success) {
          setDivisions(res.data.divisions || []);
        }
      } catch (err) {
        console.error("Error loading muster:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadMuster();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  // Filter divisions in main table by search and academic section
  const filteredDivisions = useMemo(() => {
    return divisions.filter((d) => {
      const matchSearch =
        d.standardDivision.toLowerCase().includes(search.toLowerCase()) ||
        d.mentor.toLowerCase().includes(search.toLowerCase()) ||
        (d.sectionLabel && d.sectionLabel.toLowerCase().includes(search.toLowerCase()));

      const matchSection =
        activeSection === "all" ||
        d.section === activeSection ||
        (d.sectionLabel && d.sectionLabel.toLowerCase() === activeSection.toLowerCase());

      return matchSearch && matchSection;
    });
  }, [divisions, search, activeSection]);

  // Open Class Attendance Register Modal
  const handleOpenRegister = async (div) => {
    setSelectedDivision(div);
    setIsRegisterOpen(true);
    setRegisterFeedback({ type: "", message: "" });
    setRegisterSearch("");
    setRegisterFilter("All");
    await fetchRegisterData(div.standardDivision, registerDate);
  };

  // Fetch Register Data from Backend
  const fetchRegisterData = async (divisionName, dateStr) => {
    try {
      setRegisterLoading(true);
      setRegisterFeedback({ type: "", message: "" });
      const res = await api.get(
        `/admin/attendance/register?division=${encodeURIComponent(
          divisionName
        )}&date=${dateStr}`
      );
      if (res.data.success) {
        setRegisterStudents(res.data.students || []);
        if (res.data.stats) setRegisterStats(res.data.stats);
        if (res.data.mentor) setRegisterMentor(res.data.mentor);
      }
    } catch (err) {
      console.error("Error fetching class attendance register:", err);
      setRegisterFeedback({
        type: "error",
        message: "Failed to load attendance register for this division.",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  // Change Date inside Register Modal
  const handleDateChange = async (newDate) => {
    setRegisterDate(newDate);
    if (selectedDivision) {
      await fetchRegisterData(selectedDivision.standardDivision, newDate);
    }
  };

  // Toggle single student's status
  const handleToggleStatus = (studentId, newStatus) => {
    setRegisterStudents((prev) => {
      const updated = prev.map((s) =>
        s._id === studentId ? { ...s, status: newStatus } : s
      );

      // Recalculate stats dynamically
      const present = updated.filter((s) => s.status === "Present").length;
      const absent = updated.filter((s) => s.status === "Absent").length;
      const leaves = updated.filter(
        (s) => s.status === "Leave" || s.status === "On Leave"
      ).length;
      const rate =
        updated.length > 0
          ? ((present / updated.length) * 100).toFixed(1) + "%"
          : "100%";

      setRegisterStats({
        totalEnrolled: updated.length,
        presentCount: present,
        absentCount: absent,
        leaveCount: leaves,
        turnoutRate: rate,
      });

      return updated;
    });
  };

  // Mark all students Present or Absent
  const handleMarkAll = (status) => {
    setRegisterStudents((prev) => {
      const updated = prev.map((s) => ({ ...s, status }));
      const present = status === "Present" ? updated.length : 0;
      const absent = status === "Absent" ? updated.length : 0;
      const rate =
        status === "Present" ? "100.0%" : "0.0%";

      setRegisterStats({
        totalEnrolled: updated.length,
        presentCount: present,
        absentCount: absent,
        leaveCount: 0,
        turnoutRate: rate,
      });

      return updated;
    });
  };

  // Save / Sync Register to Database
  const handleSaveRegister = async () => {
    if (!selectedDivision) return;
    try {
      setRegisterSaving(true);
      setRegisterFeedback({ type: "", message: "" });

      const payload = {
        date: registerDate,
        classDivision: selectedDivision.standardDivision,
        records: registerStudents.map((s) => ({
          studentId: s._id,
          rollNumber: s.rollNumber,
          name: s.name,
          status: s.status,
        })),
      };

      const res = await api.post("/admin/attendance/register", payload);
      if (res.data.success) {
        setRegisterFeedback({
          type: "success",
          message: `Attendance register for ${selectedDivision.standardDivision} on ${registerDate} saved & locked successfully!`,
        });

        // Update the main divisions table view with the updated counts
        setDivisions((prev) =>
          prev.map((d) =>
            d.id === selectedDivision.id ||
            d.standardDivision === selectedDivision.standardDivision
              ? {
                  ...d,
                  present: registerStats.presentCount,
                  absent: registerStats.absentCount,
                  turnoutRate: registerStats.turnoutRate,
                  syncStatus: "Verified & Locked",
                }
              : d
          )
        );

        setTimeout(() => {
          setRegisterFeedback({ type: "", message: "" });
        }, 4000);
      }
    } catch (err) {
      setRegisterFeedback({
        type: "error",
        message:
          err.response?.data?.message || "Failed to save attendance register.",
      });
    } finally {
      setRegisterSaving(false);
    }
  };

  // Export CSV for Class Attendance Register
  const handleExportCSV = () => {
    if (!registerStudents.length || !selectedDivision) return;
    const headers = [
      "Roll No",
      "Admission No",
      "Student Name",
      "Gender",
      "Status",
      "Date",
      "Division",
      "Class Mentor",
      "Cumulative Turnout",
    ];
    const rows = registerStudents.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.admissionNumber}"`,
      `"${s.name}"`,
      `"${s.gender}"`,
      `"${s.status}"`,
      `"${registerDate}"`,
      `"${selectedDivision.standardDivision}"`,
      `"${registerMentor || selectedDivision.mentor}"`,
      `"${s.overallAttendance}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sampoorna_Attendance_${selectedDivision.standardDivision.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${registerDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students inside modal
  const filteredRegisterStudents = useMemo(() => {
    return registerStudents.filter((s) => {
      const q = registerSearch.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        String(s.rollNumber).includes(q) ||
        s.admissionNumber.toLowerCase().includes(q);

      const matchFilter =
        registerFilter === "All" || s.status === registerFilter;

      return matchSearch && matchFilter;
    });
  }, [registerStudents, registerSearch, registerFilter]);

  return (
    <div className="admin-layout">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="admin-sidebar">
        <div>
          <div className="sidebar-header">
            <div className="school-code-label">School Code: 06042</div>
            <div className="sampoorna-live-pill">
              <span className="dot"></span> SAMPOORNA 2.0 LIVE
            </div>
          </div>

          <div className="sidebar-section-title">CONSOLE NAVIGATION</div>
          <nav className="console-nav-list">
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/dashboard")}
            >
              <span>▦</span> Overview and Dashboard
            </button>
            <button className="console-nav-item active">
              <span>👥</span> Division wise Attendance
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/teachers")}
            >
              <span>🗂</span> Teachers Records
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/students")}
            >
              <span>🎓</span> Students Records
            </button>
            <button
              className="console-nav-item"
              onClick={() => navigate("/admin/exams")}
            >
              <span>📅</span> Exam Timetables
            </button>
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="sidebar-bottom-profile">
          <div className="profile-avatar-circle">
            <span>🛡</span>
          </div>
          <div className="profile-details-column">
            <div className="profile-name-row">
              <span>Sri. K. R. Madhavan</span>
              <span className="verified-badge-icon">✓</span>
            </div>
            <p className="profile-role-subtext">Headmaster / Chief Admin</p>
            <p className="profile-id-code">ADM-GHSS-01</p>
          </div>
          <button
            className="logout-icon-btn"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            ⇥
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <header className="admin-top-header">
          <span>
            Kerala General Education Dept. •{" "}
            <strong>Sampoorna Admin Console</strong> • Division Muster
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="badge-sync">🟢 AY 2025–2026</span>
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
            >
              👤
            </button>
          </div>
        </header>

        <main className="admin-content-area">
          <div className="hero-banner">
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>
                Division–Wise Live Attendance Muster &amp; Analytics
              </h1>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                Official daily muster register across High School &amp; Higher Secondary divisions.
              </p>
            </div>
            <button className="btn-sync" onClick={fetchMuster}>
              🔄 Refresh Sync
            </button>
          </div>

          <div className="muster-card">
            <div className="muster-header">
              <h2>☑️ Division Muster Verification Register</h2>
              <input
                type="text"
                placeholder="Search Division, Mentor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-box"
              />
            </div>

            {/* Academic Wing Section Filter Pills */}
            <div className="section-filter-pills-row">
              <button
                type="button"
                className={`section-tab-pill ${activeSection === "all" ? "active" : ""}`}
                onClick={() => setActiveSection("all")}
              >
                All Wings ({divisions.length || 26} Divisions)
              </button>
              <button
                type="button"
                className={`section-tab-pill ${activeSection === "high_school" ? "active" : ""}`}
                onClick={() => setActiveSection("high_school")}
              >
                High School (Classes 8–10)
              </button>
              <button
                type="button"
                className={`section-tab-pill ${activeSection === "up_school" ? "active" : ""}`}
                onClick={() => setActiveSection("up_school")}
              >
                UP School (Classes 5–7)
              </button>
              <button
                type="button"
                className={`section-tab-pill ${activeSection === "lp_school" ? "active" : ""}`}
                onClick={() => setActiveSection("lp_school")}
              >
                LP School (Classes 1–4)
              </button>
              <button
                type="button"
                className={`section-tab-pill ${activeSection === "higher_secondary" ? "active" : ""}`}
                onClick={() => setActiveSection("higher_secondary")}
              >
                Higher Secondary (Classes 11–12)
              </button>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                Loading Division Muster records...
              </div>
            ) : (
              <table className="muster-table">
                <thead>
                  <tr>
                    <th>Standard &amp; Division</th>
                    <th>Class Mentor</th>
                    <th>Enrolled</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Turnout Rate</th>
                    <th>Sampoorna Sync</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDivisions.map((div) => (
                    <tr key={div.id}>
                      <td>
                        <strong>{div.standardDivision}</strong> <br />
                        <small>{div.stream}</small>
                      </td>
                      <td>{div.mentor}</td>
                      <td>{div.enrolled}</td>
                      <td className="text-green">{div.present}</td>
                      <td className="text-red">{div.absent}</td>
                      <td>
                        <span className="pill-turnout">{div.turnoutRate}</span>
                      </td>
                      <td>
                        <span className="pill-synced">✓ Verified &amp; Locked</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-register"
                          onClick={() => handleOpenRegister(div)}
                          title={`Open ${div.standardDivision} Class Attendance Register`}
                        >
                          Register 📖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* =========================================================================
          CLASS ATTENDANCE REGISTER MODAL
          ========================================================================= */}
      {isRegisterOpen && selectedDivision && (
        <div
          className="modal-overlay"
          onClick={() => setIsRegisterOpen(false)}
        >
          <div
            className="modal-content-card modal-lg"
            style={{ maxWidth: "980px", maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header-row">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      background: "#1d4ed8",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    LIVE REGISTER
                  </span>
                  <h3 style={{ margin: 0 }}>
                    {selectedDivision.standardDivision} Attendance Register
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "#64748b",
                    margin: "4px 0 0 0",
                  }}
                >
                  Class Mentor:{" "}
                  <strong>{registerMentor || selectedDivision.mentor}</strong> •
                  School Code: 06042
                </p>
              </div>

              {/* Date Picker & Close Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="attendance-date-picker-box">
                  <span style={{ fontSize: "14px" }}>📅</span>
                  <input
                    type="date"
                    className="attendance-date-input"
                    value={registerDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsRegisterOpen(false)}
                  title="Close Register"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="allotment-modal-body" style={{ maxHeight: "74vh", overflowY: "auto" }}>
              {/* Feedback Alerts */}
              {registerFeedback.message && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    background:
                      registerFeedback.type === "error"
                        ? "#fee2e2"
                        : "#dcfce7",
                    color:
                      registerFeedback.type === "error"
                        ? "#b91c1c"
                        : "#15803d",
                  }}
                >
                  {registerFeedback.message}
                </div>
              )}

              {/* Top 4 Summary Cards Grid */}
              <div className="attendance-summary-pills-row">
                <div className="attendance-summary-mini-card">
                  <span className="attendance-mini-label">Total Enrolled</span>
                  <span className="attendance-mini-value">
                    {registerStats.totalEnrolled} Students
                  </span>
                </div>
                <div className="attendance-summary-mini-card">
                  <span className="attendance-mini-label">Present Today</span>
                  <span className="attendance-mini-value" style={{ color: "#16a34a" }}>
                    {registerStats.presentCount} Students
                  </span>
                </div>
                <div className="attendance-summary-mini-card">
                  <span className="attendance-mini-label">Absent Today</span>
                  <span className="attendance-mini-value" style={{ color: "#dc2626" }}>
                    {registerStats.absentCount} Students
                  </span>
                </div>
                <div className="attendance-summary-mini-card">
                  <span className="attendance-mini-label">Turnout Rate</span>
                  <span className="attendance-mini-value" style={{ color: "#2563eb" }}>
                    {registerStats.turnoutRate}
                  </span>
                </div>
              </div>

              {/* Toolbar: Search, Filters & Bulk Actions */}
              <div className="attendance-register-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "240px" }}>
                  <input
                    type="text"
                    placeholder="Search by Roll No, Student Name, Adm No..."
                    value={registerSearch}
                    onChange={(e) => setRegisterSearch(e.target.value)}
                    className="search-box"
                    style={{ margin: 0, width: "100%", maxWidth: "340px", padding: "8px 14px" }}
                  />

                  {/* Filter Pills */}
                  <div className="attendance-filter-tabs">
                    <button
                      type="button"
                      className={`att-tab-btn ${
                        registerFilter === "All" ? "active" : ""
                      }`}
                      onClick={() => setRegisterFilter("All")}
                    >
                      All ({registerStudents.length})
                    </button>
                    <button
                      type="button"
                      className={`att-tab-btn ${
                        registerFilter === "Present" ? "active" : ""
                      }`}
                      onClick={() => setRegisterFilter("Present")}
                    >
                      Present ({registerStats.presentCount})
                    </button>
                    <button
                      type="button"
                      className={`att-tab-btn ${
                        registerFilter === "Absent" ? "active" : ""
                      }`}
                      onClick={() => setRegisterFilter("Absent")}
                    >
                      Absent ({registerStats.absentCount})
                    </button>
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="attendance-bulk-actions">
                  <button
                    type="button"
                    className="btn-bulk-present"
                    onClick={() => handleMarkAll("Present")}
                    title="Mark all enrolled students as Present"
                  >
                    ✓ Mark All Present
                  </button>
                  <button
                    type="button"
                    className="btn-bulk-absent"
                    onClick={() => handleMarkAll("Absent")}
                    title="Mark all enrolled students as Absent"
                  >
                    ✕ Mark All Absent
                  </button>
                </div>
              </div>

              {/* Students Register Table */}
              {registerLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                    fontWeight: "600",
                  }}
                >
                  Loading student roster &amp; attendance marks...
                </div>
              ) : filteredRegisterStudents.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  No matching students found in this division.
                </div>
              ) : (
                <div className="allotment-table-wrapper">
                  <table className="allotment-schedule-table">
                    <thead>
                      <tr>
                        <th style={{ width: "65px" }}>Roll #</th>
                        <th style={{ width: "120px" }}>Adm No</th>
                        <th>Student Name</th>
                        <th style={{ width: "90px" }}>Gender</th>
                        <th style={{ width: "210px", textAlign: "center" }}>
                          Attendance Status
                        </th>
                        <th style={{ width: "130px", textAlign: "center" }}>
                          Monthly Leaves
                        </th>
                        <th style={{ width: "110px", textAlign: "right" }}>
                          Turnout
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegisterStudents.map((s) => {
                        const isPresent = s.status === "Present";
                        const isAbsent = s.status === "Absent";
                        const isLeave =
                          s.status === "Leave" ||
                          s.status === "On Leave" ||
                          s.status === "Half Day";

                        return (
                          <tr
                            key={s._id}
                            style={{
                              background: isAbsent ? "#fff7f7" : "#ffffff",
                            }}
                          >
                            <td>
                              <strong style={{ color: isAbsent ? "#b91c1c" : "#0f172a" }}>
                                #{String(s.rollNumber).padStart(2, "0")}
                              </strong>
                            </td>
                            <td>
                              <span style={{ fontSize: "12px", color: "#475569", fontFamily: "monospace" }}>
                                {s.admissionNumber}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: isAbsent ? "#fee2e2" : "#e0e7ff",
                                    color: isAbsent ? "#b91c1c" : "#3730a3",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                  }}
                                >
                                  {s.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <span style={{ fontWeight: "700", color: "#0f172a" }}>
                                  {s.name}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>
                                {s.gender}
                              </span>
                            </td>

                            {/* Segmented Status Toggle */}
                            <td style={{ textAlign: "center" }}>
                              <div className="reg-segmented-toggle">
                                <button
                                  type="button"
                                  className={`reg-segment-btn ${
                                    isPresent ? "active-present" : ""
                                  }`}
                                  onClick={() =>
                                    handleToggleStatus(s._id, "Present")
                                  }
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  className={`reg-segment-btn ${
                                    isAbsent ? "active-absent" : ""
                                  }`}
                                  onClick={() =>
                                    handleToggleStatus(s._id, "Absent")
                                  }
                                >
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  className={`reg-segment-btn ${
                                    isLeave ? "active-leave" : ""
                                  }`}
                                  onClick={() =>
                                    handleToggleStatus(s._id, "On Leave")
                                  }
                                >
                                  Leave
                                </button>
                              </div>
                            </td>

                            <td style={{ textAlign: "center" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 8px",
                                  borderRadius: "12px",
                                  background:
                                    s.monthlyLeavesTaken > 0
                                      ? "#fef3c7"
                                      : "#f1f5f9",
                                  color:
                                    s.monthlyLeavesTaken > 0
                                      ? "#b45309"
                                      : "#475569",
                                }}
                              >
                                {s.monthlyLeavesTaken || 0} Days Taken
                              </span>
                            </td>

                            <td style={{ textAlign: "right" }}>
                              <strong style={{ color: "#059669" }}>
                                {s.overallAttendance}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Statutory Note Box */}
              <div
                style={{
                  marginTop: "16px",
                  background: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "12px",
                  color: "#475569",
                  lineHeight: "1.5",
                }}
              >
                <strong>Kerala Education Rules (K.E.R) Ch. XIV-A:</strong>{" "}
                Attendance muster must be recorded for each session. Saving this
                register synchronizes records directly to the Sampoorna 2.0
                state academic database.
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="modal-footer-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsRegisterOpen(false)}
              >
                Close Register
              </button>
              <button
                type="button"
                className="btn-seating-action"
                onClick={handleExportCSV}
                title="Export this division register to CSV"
              >
                Export Register (CSV) ⤓
              </button>
              <button
                type="button"
                className="btn-modal-save"
                onClick={handleSaveRegister}
                disabled={registerSaving}
              >
                {registerSaving
                  ? "Saving & Locking..."
                  : "Save & Lock Register ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
