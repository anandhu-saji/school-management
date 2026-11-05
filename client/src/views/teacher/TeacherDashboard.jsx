import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import api from "../../api/axiosclient";
import { clearAuthSession } from "../../utils/auth";
import "../../Styles/AdminDash.css";
import "../../Styles/TeacherDash.css";

import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherAttendanceTab from "../../components/teacher/TeacherAttendanceTab";
import TeacherAcademicsTab from "../../components/teacher/TeacherAcademicsTab";
import TeacherInternalMarksTab from "../../components/teacher/TeacherInternalMarksTab";
import TeacherTimetableTab from "../../components/teacher/TeacherTimetableTab";
import TeacherProfileTab from "../../components/teacher/TeacherProfileTab";
import StudentDossierModal from "../../components/admin/students/StudentDossierModal";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = () => {
    if (location.pathname.includes("students") || location.pathname.includes("academics")) return "academics";
    if (location.pathname.includes("marks")) return "marks";
    if (location.pathname.includes("timetable")) return "timetable";
    if (location.pathname.includes("profile")) return "profile";
    return searchParams.get("tab") || "attendance";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (location.pathname.includes("students") || location.pathname.includes("academics")) {
      setActiveTab("academics");
    } else if (location.pathname.includes("marks")) {
      setActiveTab("marks");
    } else if (location.pathname.includes("timetable")) {
      setActiveTab("timetable");
    } else if (location.pathname.includes("profile")) {
      setActiveTab("profile");
    } else if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab"));
    }
  }, [location.pathname, searchParams]);

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedDivision, setSelectedDivision] = useState("Class 10-A");

  const [teacherProfile, setTeacherProfile] = useState({
    name: "Mrs. Indu B Nair",
    email: "kathalanx@gmail.com",
    assignedClass: "Class 10-A",
    department: "Mathematics",
    pen: "849201",
    penNumber: "PEN-849201",
    designation: "HSST (Junior)",
    employmentType: "Permanent / Sanctioned",
    periodsPerWeek: 26,
    joiningDate: "02 June 2018",
    qualification: "M.Sc. Mathematics, B.Ed, SET",
  });

  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal State for Viewing Student KYC Dossier
  const [dossierStudent, setDossierStudent] = useState(null);

  // Sync tab with URL
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Fetch teacher profile & cadre details
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await api.get("/teacher/profile");
        if (isMounted && res.data.success && res.data.teacher) {
          const rawClass = res.data.teacher.assignedClass || "Class 10-A";
          const cleanClass =
            rawClass
              .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher)\s*$/i, "")
              .replace(/\s*\(.*?\)\s*$/, "")
              .trim() || "Class 10-A";

          setTeacherProfile((prev) => ({
            ...prev,
            ...res.data.teacher,
            assignedClass: cleanClass,
          }));
          setSelectedDivision(cleanClass);
        }
      } catch (err) {
        console.error("Failed to load teacher profile:", err);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch student roster & attendance
  const fetchRoster = useCallback(
    async (divisionToFetch = selectedDivision, dateToFetch = selectedDate) => {
      try {
        const cleanDiv =
          (divisionToFetch || "Class 10-A")
            .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher)\s*$/i, "")
            .replace(/\s*\(.*?\)\s*$/, "")
            .trim() || "Class 10-A";

        const res = await api.get(
          `/teacher/students?division=${encodeURIComponent(
            cleanDiv
          )}&date=${dateToFetch}`
        );

        if (res.data.success) {
          setStudents(res.data.students || []);
          if (res.data.teacher) {
            const rawTeacherClass = res.data.teacher.assignedClass || cleanDiv;
            const cleanTeacherClass =
              rawTeacherClass
                .replace(/\s*(Mentor|Class Teacher|In-charge|Teacher)\s*$/i, "")
                .replace(/\s*\(.*?\)\s*$/, "")
                .trim() || cleanDiv;

            setTeacherProfile((prev) => ({
              ...prev,
              ...res.data.teacher,
              assignedClass: cleanTeacherClass,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      }
    },
    [selectedDivision, selectedDate]
  );

  useEffect(() => {
    fetchRoster(selectedDivision, selectedDate);
  }, [selectedDivision, selectedDate, fetchRoster]);

  // Logout handler
  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  // Save Attendance to database
  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setFeedback({ message: "", type: "" });

      const [y, m, d] = selectedDate.split("-");
      const checkDate = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
      if (checkDate.getUTCDay() === 0) {
        setFeedback({
          message:
            "Invalid date: Sundays are weekly holidays per Kerala Education Rules (KER). Attendance cannot be recorded.",
          type: "error",
        });
        setSaving(false);
        return;
      }

      const payload = {
        date: selectedDate,
        classDivision: selectedDivision,
        records: students.map((s) => ({
          studentId: s._id,
          rollNumber: s.rollNumber,
          name: s.name,
          status: s.status,
        })),
      };

      const res = await api.post("/teacher/attendance", payload);

      if (res.data.success) {
        setFeedback({
          message: `Attendance for ${selectedDivision} on ${selectedDate} saved to DB successfully!`,
          type: "success",
        });
        setTimeout(() => setFeedback({ message: "", type: "" }), 3500);
        fetchRoster(selectedDivision, selectedDate);
      }
    } catch (err) {
      setFeedback({
        message: err.response?.data?.message || "Failed to save attendance.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="teacher-layout">
      {/* Sidebar Navigation */}
      <TeacherSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        teacherProfile={teacherProfile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="teacher-main-wrapper">
        <TeacherHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          selectedDivision={selectedDivision}
          onDivisionChange={(newDiv) => {
            setSelectedDivision(newDiv);
            fetchRoster(newDiv, selectedDate);
          }}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <main className="teacher-content" style={{ padding: "24px 28px" }}>
          {activeTab === "attendance" && (
            <TeacherAttendanceTab
              teacherProfile={teacherProfile}
              selectedDivision={selectedDivision}
              selectedDate={selectedDate}
              students={students}
              setStudents={setStudents}
              saving={saving}
              onSaveAttendance={handleSaveAttendance}
              feedback={feedback}
            />
          )}

          {activeTab === "academics" && (
            <TeacherAcademicsTab
              selectedDivision={selectedDivision}
              students={students}
              onViewDossier={(student) => setDossierStudent(student)}
            />
          )}

          {activeTab === "marks" && (
            <TeacherInternalMarksTab
              selectedDivision={selectedDivision}
              teacherProfile={teacherProfile}
            />
          )}

          {activeTab === "timetable" && (
            <TeacherTimetableTab
              selectedDivision={selectedDivision}
            />
          )}

          {activeTab === "profile" && (
            <TeacherProfileTab teacherProfile={teacherProfile} />
          )}
        </main>
      </div>

      {/* Student KYC Dossier Popup Modal */}
      {dossierStudent && (
        <StudentDossierModal
          student={dossierStudent}
          onClose={() => setDossierStudent(null)}
        />
      )}
    </div>
  );
}
