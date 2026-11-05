import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosclient";
import { isSessionValid, clearAuthSession } from "../../utils/auth";
import "./../../Styles/StudentDash.css";

import StudentSidebar from "../../components/student/StudentSidebar";
import StudentHeader from "../../components/student/StudentHeader";
import StudentOverviewTab from "../../components/student/StudentOverviewTab";
import StudentAttendanceTab from "../../components/student/StudentAttendanceTab";
import StudentTimetableTab from "../../components/student/StudentTimetableTab";
import StudentFeesTab from "../../components/student/StudentFeesTab";
import StudentDossierModal from "../../components/student/StudentDossierModal";
import StudentHallTicketModal from "../../components/student/StudentHallTicketModal";
import StudentReceiptModal from "../../components/student/StudentReceiptModal";

const lessons = [
  {
    time: "09:30 - 10:45 AM",
    subject: "Mathematics Revision",
    teacher: "Mr. George Varghese",
    room: "Room 14 (Lab Wing)",
    type: "blue",
  },
  {
    time: "11:00 - 12:15 PM",
    subject: "Physics Practical Test",
    teacher: "Mrs. Lakshmi S.",
    room: "Science Laboratory",
    type: "green",
  },
  {
    time: "01:30 - 02:45 PM",
    subject: "Malayalam Model Paper",
    teacher: "Mrs. Priya Nair",
    room: "Class 10-A Room",
    type: "purple",
  },
  {
    time: "03:00 - 04:00 PM",
    subject: "Social Science Quiz",
    teacher: "Sri. K. R. Suresh",
    room: "Room 10 (Main Block)",
    type: "orange",
  },
];

const notices = [
  {
    date: "02 NOV 2026",
    title: "SSLC Board Examination Model Papers Released",
    description:
      "All candidates can download model question papers and verified answer keys from SCERT Kerala repository.",
    tag: "Exam",
    type: "urgent",
  },
  {
    date: "28 OCT 2026",
    title: "Second Terminal Examination Timetable Finalized",
    description:
      "Terminal exam commences from 12 March 2026. Hall tickets verified by respective Class Mentors.",
    tag: "Urgent",
    type: "urgent",
  },
  {
    date: "15 OCT 2026",
    title: "Transport & Special Lab Fee Dues Clearance",
    description:
      "Parents are advised to clear term lab and bus pass contributions at the counter or via online UPI.",
    tag: "Accounts",
    type: "holiday",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Navigation tab state: "overview" | "attendance" | "timetable" | "fees"
  const [activeTab, setActiveTab] = useState("overview");

  // User session
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Data states from backend
  const [dashboardData, setDashboardData] = useState(null);
  const [exams, setExams] = useState([]);
  const [feesData, setFeesData] = useState(null);
  const [, setLoadingMetrics] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [, setLoadingFees] = useState(false);

  // Modals state
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [viewingHallTicket, setViewingHallTicket] = useState(false);
  const [, setCopiedField] = useState("");

  // Fetch published exams (memoized callback)
  const fetchExams = useCallback(async () => {
    try {
      setLoadingExams(true);
      const res = await api.get("/student/exams");
      if (res.data.success) {
        setExams(res.data.exams || []);
      }
    } catch (err) {
      console.error("Failed to load student exams:", err);
    } finally {
      setLoadingExams(false);
    }
  }, []);

  useEffect(() => {
    // 1. Verify session validity
    if (!isSessionValid()) {
      clearAuthSession();
      navigate("/login?session=expired", { replace: true });
      return;
    }

    // 2. Prevent browser back to login
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    // 3. Periodic session check
    const interval = setInterval(() => {
      if (!isSessionValid()) {
        clearAuthSession();
        navigate("/login?session=expired", { replace: true });
      }
    }, 10000);

    // 4. Fetch student dashboard data
    async function fetchDashboardMetrics() {
      try {
        setLoadingMetrics(true);
        const res = await api.get("/student/dashboard-data");
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load student dashboard metrics:", err);
      } finally {
        setLoadingMetrics(false);
      }
    }

    // 5. Fetch fees ledger
    async function fetchFees() {
      try {
        setLoadingFees(true);
        const res = await api.get("/student/fees");
        if (res.data.success) {
          setFeesData(res.data);
        }
      } catch (err) {
        console.error("Failed to load student fees:", err);
      } finally {
        setLoadingFees(false);
      }
    }

    fetchDashboardMetrics();
    fetchExams();
    fetchFees();

    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearInterval(interval);
    };
  }, [navigate, fetchExams]);

  // Refresh exam timetable automatically when opening timetable or overview tab
  useEffect(() => {
    if (activeTab === "timetable" || activeTab === "overview") {
      fetchExams();
    }
  }, [activeTab, fetchExams]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const getDisplayName = (name) => {
    if (!name) return "Student Scholar";
    return name
      .replace(/[._-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getInitials = (name) => {
    const formatted = getDisplayName(name);
    return formatted
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const studentProfile = dashboardData?.student;
  const mentorProfile = dashboardData?.mentor;
  const attendanceStats = dashboardData?.attendance;

  const displayName = getDisplayName(
    studentProfile?.name || user?.name || user?.username || user?.email
  );

  const displayClass = studentProfile?.className || "Class 10-A";
  const totalFeeDue = feesData?.summary?.totalDue ?? 0;
  const nextExam =
    exams.find((e) => e.status !== "Completed" && e.status !== "Postponed") ||
    exams[0];

  return (
    <div className="portal student-portal">
      {/* ---------------- SIDEBAR NAVIGATION ---------------- */}
      <StudentSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        displayName={displayName}
        displayClass={displayClass}
        studentProfile={studentProfile}
        onOpenDossier={() => setIsDossierModalOpen(true)}
        handleLogout={handleLogout}
      />

      <div className="main portal-main student-main-wrapper">
        {/* ---------------- TOPBAR HEADER ---------------- */}
        <StudentHeader
          activeTab={activeTab}
          displayClass={displayClass}
          displayName={displayName}
          onOpenDossier={() => setIsDossierModalOpen(true)}
          getInitials={getInitials}
        />

        {/* ---------------- DASHBOARD CONTENT CONTAINER ---------------- */}
        <main className="content student-content dashboard-content">
          {activeTab === "overview" && (
            <StudentOverviewTab
              displayName={displayName}
              displayClass={displayClass}
              studentProfile={studentProfile}
              user={user}
              mentorProfile={mentorProfile}
              attendanceStats={attendanceStats}
              totalFeeDue={totalFeeDue}
              feesData={feesData}
              nextExam={nextExam}
              lessons={lessons}
              notices={notices}
              onOpenDossier={() => setIsDossierModalOpen(true)}
              onOpenHallTicket={() => setViewingHallTicket(true)}
              setActiveTab={setActiveTab}
              getInitials={getInitials}
            />
          )}

          {activeTab === "attendance" && (
            <StudentAttendanceTab
              displayClass={displayClass}
              attendanceStats={attendanceStats}
              mentorProfile={mentorProfile}
            />
          )}

          {activeTab === "timetable" && (
            <StudentTimetableTab
              loadingExams={loadingExams}
              exams={exams}
              onViewHallTicket={() => setViewingHallTicket(true)}
              onRefreshExams={fetchExams}
            />
          )}

          {activeTab === "fees" && (
            <StudentFeesTab
              feesData={feesData}
              totalFeeDue={totalFeeDue}
              onViewReceipt={(receipt) => setViewingReceipt(receipt)}
            />
          )}

          {/* Footer */}
          <footer className="dashboard-footer">
            <span>
              © 2026 G.H.S.S Rajakkad - General Education Dept., Govt. of Kerala
            </span>
            <div className="footer-links">
              <span>Sampoorna Integrated</span>
              <span>•</span>
              <span>Kerala Pareeksha Bhavan Direct Sync</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Student Identity Dossier & KYC Modal */}
      {studentProfile && (
        <StudentDossierModal
          isOpen={isDossierModalOpen}
          onClose={() => setIsDossierModalOpen(false)}
          student={studentProfile}
          displayName={displayName}
          displayClass={displayClass}
          onCopy={(_, fieldName) => {
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(""), 2000);
          }}
        />
      )}

      {/* Printable Pareeksha Bhavan Hall Ticket Modal */}
      <StudentHallTicketModal
        isOpen={viewingHallTicket}
        onClose={() => setViewingHallTicket(false)}
        displayName={displayName}
        displayClass={displayClass}
        studentProfile={studentProfile}
        exams={exams}
      />

      {/* Receipt Modal */}
      {viewingReceipt && (
        <StudentReceiptModal
          isOpen={Boolean(viewingReceipt)}
          onClose={() => setViewingReceipt(null)}
          receipt={viewingReceipt}
          studentName={displayName}
          studentClass={displayClass}
          admissionNumber={studentProfile?.admissionNumber || "ADM-10A-101"}
        />
      )}
    </div>
  );
}
