import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DivisionAttendance.css";

export default function DivisionAttendance() {
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/division-muster")
      .then(res => { if (res.data.success) setDivisions(res.data.divisions); })
      .catch(err => console.log(err));
  }, []);

  const filtered = divisions.filter(d => d.standardDivision.toLowerCase().includes(search.toLowerCase()) || d.mentor.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <div className="school-code-label">School Code: 06042</div>
          <div className="sampoorna-live-pill"><span className="dot"></span> SAMPOORNA 2.0 LIVE</div>
          <nav className="console-nav-list">
            <button className="console-nav-item" onClick={() => navigate("/admin/overview")}>Overview and Dashboard</button>
            <button className="console-nav-item active">Division wise Attendance</button>
            <button className="console-nav-item" onClick={() => navigate("/admin/teachers")}>Teachers Records</button>
            <button className="console-nav-item" onClick={() => navigate("/admin/students")}>Students Records</button>
            <button className="console-nav-item" onClick={() => navigate("/admin/exams")}>Exam Timetables</button>
          </nav>
        </div>
      </aside>

      <div className="admin-main-wrapper">
        <header className="admin-top-header"><span>Sampoorna Admin Console • Division Muster</span></header>
        <main className="admin-content-area">
          <div className="hero-banner">
            <h1>Division–Wise Live Attendance Muster &amp; Analytics</h1>
            <button className="btn-sync" onClick={() => window.location.reload()}>🔄 Refresh Sync</button>
          </div>

          <div className="muster-card">
            <div className="muster-header">
              <h2>☑️ Division Muster Verification Register</h2>
              <input type="text" placeholder="Search Division, Mentor..." value={search} onChange={e => setSearch(e.target.value)} className="search-box" />
            </div>

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
                {filtered.map(div => (
                  <tr key={div.id}>
                    <td><strong>{div.standardDivision}</strong> <br/><small>{div.stream}</small></td>
                    <td>{div.mentor}</td>
                    <td>{div.enrolled}</td>
                    <td className="text-green">{div.present}</td>
                    <td className="text-red">{div.absent}</td>
                    <td><span className="pill-turnout">{div.turnoutRate}</span></td>
                    <td><span className="pill-synced">✓ Verified &amp; Locked</span></td>
                    <td><button className="btn-register" onClick={() => navigate("/teacher/dashboard")}>Register</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}