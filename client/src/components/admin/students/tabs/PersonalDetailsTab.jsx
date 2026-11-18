import { ALL_CLASSES } from "../../../../utils/classData";
import { checkStudentAgeEligibility } from "../../../../utils/ageValidator";
import EmailOtpVerification from "../../../common/EmailOtpVerification";

export default function PersonalDetailsTab({
  formData,
  handleFormChange,
  editingStudent,
  isEmailVerified,
  setIsEmailVerified,
  currentDivisionName,
  academicWings,
}) {
  return (
    <div>
      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Student Full Name *</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Aaditya S. Kumar"
            value={formData.name}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Student Email ID (Mail ID)</label>
          <input
            type="email"
            name="email"
            placeholder="student@ghss.edu"
            value={formData.email}
            onChange={handleFormChange}
          />
          <EmailOtpVerification
            email={formData.email}
            purpose="student_admission"
            isVerified={isEmailVerified}
            setIsVerified={setIsEmailVerified}
            disabled={Boolean(editingStudent)}
          />
          {!editingStudent && (
            <div
              style={{
                marginTop: "6px",
                padding: "6px 10px",
                borderRadius: "6px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                fontSize: "11.5px",
                color: "#1e40af",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🔑</span>
              <span>
                Primary login password: <strong>Student@123</strong>.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Roll Number</label>
          <input
            type="number"
            name="rollNumber"
            placeholder="e.g. 1"
            value={formData.rollNumber}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Class &amp; Division</label>
          <select
            name="division"
            value={currentDivisionName}
            onChange={handleFormChange}
          >
            <option value="">-- Select Class &amp; Division --</option>
            {currentDivisionName &&
              !ALL_CLASSES.some((c) => c.name === currentDivisionName) && (
                <option value={currentDivisionName}>
                  {currentDivisionName} (Current)
                </option>
              )}
            {academicWings.map((wing) => (
              <optgroup key={wing.code} label={wing.wing}>
                {wing.classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.stream})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Admission Number</label>
          <input
            type="text"
            name="admissionNumber"
            placeholder="ADM-14920"
            value={formData.admissionNumber}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Sampoorna ID</label>
          <input
            type="text"
            name="sampoornaId"
            placeholder="SMP-06042-881"
            value={formData.sampoornaId}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div className="form-row-grid-3">
        <div className="form-field-group">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label style={{ margin: 0 }}>Date of Birth *</label>
            {formData.dob &&
              (() => {
                const check = checkStudentAgeEligibility(
                  formData.dob,
                  formData.division
                );
                return (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: check.valid ? "#16a34a" : "#dc2626",
                      background: check.valid ? "#f0fdf4" : "#fef2f2",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {check.valid ? `✓ ${check.message}` : `${check.message}`}
                  </span>
                );
              })()}
          </div>
          <input
            type="text"
            name="dob"
            placeholder="DD/MM/YYYY (e.g. 14/05/2010)"
            value={formData.dob}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="form-field-group">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleFormChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-field-group">
          <label>Blood Group</label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleFormChange}
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>

      <div className="form-row-grid-3">
        <div className="form-field-group">
          <label>Social Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleFormChange}
          >
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="OEC">OEC</option>
          </select>
        </div>
        <div className="form-field-group">
          <label>Religion</label>
          <select
            name="religion"
            value={formData.religion}
            onChange={handleFormChange}
          >
            <option value="Hindu">Hindu</option>
            <option value="Christian">Christian</option>
            <option value="Muslim">Muslim</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-field-group">
          <label>Caste / Community</label>
          <input
            type="text"
            name="caste"
            placeholder="e.g. Nair, Ezhava, etc."
            value={formData.caste}
            onChange={handleFormChange}
          />
        </div>
      </div>
    </div>
  );
}
