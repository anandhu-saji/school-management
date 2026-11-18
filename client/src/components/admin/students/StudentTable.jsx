import { getDocumentUrl } from "../../../utils/documentUrl";

export default function StudentTable({
  paginatedStudents,
  loading,
  openEditModal,
  setDossierStudent,
  currentPage,
  pageSize,
  totalStudentsCount,
  totalPages,
  setCurrentPage,
  handleExportCSV,
}) {
  return (
    <div className="students-registry-card">
      <table className="student-table">
        <thead>
          <tr>
            <th>ROLL NO</th>
            <th>ADM NO / SAMPOORNA ID</th>
            <th>STUDENT NAME</th>
            <th>DIVISION</th>
            <th>GUARDIAN CONTACT</th>
            <th>CATEGORY / GENDER</th>
            <th>ATTENDANCE %</th>
            <th style={{ textAlign: "right" }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan="8"
                style={{ textAlign: "center", padding: "30px" }}
              >
                Loading Sampoorna student register...
              </td>
            </tr>
          ) : paginatedStudents.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                style={{ textAlign: "center", padding: "30px" }}
              >
                No matching student records found.
              </td>
            </tr>
          ) : (
            paginatedStudents.map((std) => {
              const catClean = std.category.toLowerCase();
              let catClass = "general";
              if (catClean.includes("obc")) catClass = "obc";
              else if (catClean.includes("sc") || catClean.includes("st"))
                catClass = "sc";
              else if (catClean.includes("oec")) catClass = "oec";

              return (
                <tr key={std._id}>
                  <td>
                    <span className="roll-no-badge">
                      {std.rollNoFormatted}
                    </span>
                  </td>
                  <td>
                    <span
                      className="adm-no-link"
                      onClick={() => openEditModal(std)}
                      title="Click to Edit Student"
                    >
                      {std.admissionNumber}
                    </span>
                    <span className="subtext-dim">{std.sampoornaId}</span>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        flexWrap: "wrap",
                      }}
                    >
                      {std.aadhaarNumber ? (
                        <span
                          className="aadhaar-verified-pill"
                          title={`Aadhaar: ${std.aadhaarNumber}`}
                        >
                          ✓ UID Linked
                        </span>
                      ) : (
                        <span
                          className="aadhaar-pending-pill"
                          title="Aadhaar UID not linked yet"
                        >
                          UID Pending
                        </span>
                      )}

                      {/* Clickable ID Proof File indicator if uploaded */}
                      {std.idProofUrl && (
                        <a
                          href={getDocumentUrl(std.idProofUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="id-proof-doc-link"
                          title={`View Uploaded ${std.idProofType || "ID Proof"} (${std.idProofFileName || "Document"})`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {std.idProofFileType === "pdf" ? "PDF" : "Doc"}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="student-name-cell">
                    <strong
                      style={{ cursor: "pointer", color: "#135bec" }}
                      onClick={() => setDossierStudent(std)}
                      title="Click to view full student dossier"
                    >
                      {std.name}
                    </strong>
                    <span className="subtext-dim">DOB: {std.dob}</span>
                    {std.email && (
                      <span
                        className="subtext-dim"
                        style={{
                          color: "#2563eb",
                          fontSize: "11px",
                          display: "block",
                          marginTop: "2px",
                        }}
                      >
                        {std.email}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="pill-division">{std.division}</span>
                  </td>
                  <td>
                    <strong>{std.guardian}</strong>
                    <span className="subtext-dim">{std.parentContact}</span>
                  </td>
                  <td>
                    <span className={`category-badge ${catClass}`}>
                      {std.category}
                    </span>
                  </td>
                  <td>
                    <span className="attendance-rate-green">
                      {std.attendance}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <button
                        className="btn-dossier-link"
                        onClick={() => setDossierStudent(std)}
                        title="View Student Dossier &amp; ID Proofs"
                      >
                        Dossier
                      </button>
                      <button
                        className="btn-edit-link"
                        onClick={() => openEditModal(std)}
                        title="Edit Record"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination & Export Bar */}
      <div className="registry-footer-bar">
        <div>
          Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
          <strong>
            {Math.min(currentPage * pageSize, totalStudentsCount)}
          </strong>{" "}
          of <strong>{totalStudentsCount.toLocaleString()}</strong> students
        </div>

        <div className="pagination-controls">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            &lt;
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            const pNum = i + 1;
            return (
              <button
                key={pNum}
                className={`page-btn ${
                  currentPage === pNum ? "active" : ""
                }`}
                onClick={() => setCurrentPage(pNum)}
              >
                {pNum}
              </button>
            );
          })}
          {totalPages > 5 && <span style={{ padding: "0 6px" }}>...</span>}
          {totalPages > 5 && (
            <button
              className={`page-btn ${
                currentPage === totalPages ? "active" : ""
              }`}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          )}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            &gt;
          </button>
        </div>

        <button className="btn-export-link" onClick={handleExportCSV}>
          Export Sampoorna SSLC Nominal Roll (CSV/PDF)
        </button>
      </div>
    </div>
  );
}
