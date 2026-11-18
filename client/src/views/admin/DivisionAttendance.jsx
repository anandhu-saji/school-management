import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axiosclient";
import "../../Styles/AdminDash.css";
import { ALL_CLASSES } from "../../utils/classData";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AttendanceRegisterModal from "../../components/admin/attendance/AttendanceRegisterModal";
import DivisionMusterTable from "../../components/admin/attendance/DivisionMusterTable";
import AddClassModal from "../../components/admin/classes/AddClassModal";

export default function DivisionAttendance() {
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
      section:
        c.code ||
        (c.standard?.includes("11") || c.standard?.includes("12")
          ? "higher_secondary"
          : c.standard?.includes("8") || c.standard?.includes("9") || c.standard?.includes("10")
          ? "high_school"
          : c.standard?.includes("5") || c.standard?.includes("6") || c.standard?.includes("7")
          ? "up_school"
          : "lp_school"),
      sectionLabel: c.wingShort || "General",
    }))
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

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
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Open Class Attendance Register Modal
  const handleOpenRegister = async (div) => {
    setSelectedDivision(div);
    setIsRegisterOpen(true);
    setRegisterFeedback({ type: "", message: "" });
    setRegisterSearch("");
    setRegisterFilter("All");
    await fetchRegisterData(div.standardDivision, registerDate);
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
      const rate = status === "Present" ? "100.0%" : "0.0%";

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
      <AdminSidebar activeNav="attendance" />

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="admin-main-wrapper">
        <AdminHeader />

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
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn-sync"
                style={{ background: "#2563eb", borderColor: "#2563eb", color: "#ffffff", fontWeight: "700" }}
                onClick={() => setIsAddClassModalOpen(true)}
              >
                + Add Class / Division
              </button>
              <button className="btn-sync" onClick={fetchMuster}>
                Refresh Sync
              </button>
            </div>
          </div>

          <DivisionMusterTable
            divisions={divisions}
            filteredDivisions={filteredDivisions}
            search={search}
            setSearch={setSearch}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            loading={loading}
            onOpenRegister={handleOpenRegister}
          />
        </main>
      </div>

      {/* ---------------- CLASS ATTENDANCE REGISTER MODAL ---------------- */}
      <AttendanceRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        selectedDivision={selectedDivision}
        registerDate={registerDate}
        onDateChange={handleDateChange}
        registerMentor={registerMentor}
        registerFeedback={registerFeedback}
        registerStats={registerStats}
        registerSearch={registerSearch}
        setRegisterSearch={setRegisterSearch}
        registerFilter={registerFilter}
        setRegisterFilter={setRegisterFilter}
        registerStudents={registerStudents}
        filteredRegisterStudents={filteredRegisterStudents}
        registerLoading={registerLoading}
        registerSaving={registerSaving}
        onToggleStatus={handleToggleStatus}
        onMarkAll={handleMarkAll}
        onSaveRegister={handleSaveRegister}
        onExportCSV={handleExportCSV}
      />

      {/* ---------------- ADD CLASS & DIVISION MODAL ---------------- */}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onClassAdded={() => {
          fetchMuster();
        }}
      />
    </div>
  );
}
