import { ALL_CLASSES } from "../../../../utils/classData";
import { checkTeacherAgeEligibility, checkTeacherAppointmentDate } from "../../../../utils/ageValidator";
import EmailOtpVerification from "../../../common/EmailOtpVerification";

export default function TeacherCadreTab({
  formData,
  handleFormChange,
  editingTeacher,
  currentAssignedClass,
  academicWings,
  isEmailVerified,
  setIsEmailVerified,
}) {
  return (
    <div>
      <div className="form-field-group">
        <label>Faculty Full Name *</label>
        <input
          type="text"
          name="name"
          required
          placeholder="e.g. Mrs. Priya Nair"
          value={formData.name}
          onChange={handleFormChange}
        />
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Government PEN Number *</label>
          <input
            type="text"
            name="pen"
            required
            placeholder="e.g. 849201"
            value={formData.pen}
            onChange={handleFormChange}
          />
          <span className="helper-text">
            Permanent Employee Number (SPARK).
          </span>
        </div>
        <div className="form-field-group">
          <label>Department &amp; Cadre</label>
          <input
            type="text"
            name="department"
            placeholder="e.g. HSST Malayalam"
            value={formData.department}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Assigned Division / Mentorship</label>
          <select
            name="assignedClass"
            value={currentAssignedClass}
            onChange={handleFormChange}
          >
            <option value="">-- Select Assigned Division / Class --</option>
            <option value="General / Subject Faculty">
              General / Subject Faculty (No Class Mentorship)
            </option>
            {currentAssignedClass &&
              !ALL_CLASSES.some((c) => c.name === currentAssignedClass) &&
              currentAssignedClass !== "General / Subject Faculty" && (
                <option value={currentAssignedClass}>
                  {currentAssignedClass} (Current)
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
          <span className="helper-text">
            Official division mentorship or standard classroom charge.
          </span>
        </div>
        <div className="form-field-group">
          <label>Periods / Workload Allotted</label>
          <input
            type="text"
            name="periods"
            placeholder="e.g. 24 hrs / Week"
            value={formData.periods}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Official Contact Mobile</label>
          <input
            type="text"
            name="phone"
            placeholder="+91 94471 23450"
            value={formData.phone}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Official Email ID (Mail ID)</label>
          <input
            type="email"
            name="email"
            placeholder="teacher@ghssrajakkad.kerala.gov.in"
            value={formData.email}
            onChange={handleFormChange}
          />
          <EmailOtpVerification
            email={formData.email}
            purpose="teacher_registration"
            isVerified={isEmailVerified}
            setIsVerified={setIsEmailVerified}
            disabled={Boolean(editingTeacher)}
          />
          {!editingTeacher && (
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
                Primary login password: <strong>Teacher@123</strong>.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <label style={{ margin: 0, whiteSpace: "nowrap" }}>
              Date of Birth *
            </label>
            {formData.dob &&
              (() => {
                const check = checkTeacherAgeEligibility(formData.dob);
                return (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      color: check.valid ? "#16a34a" : "#dc2626",
                      background: check.valid ? "#f0fdf4" : "#fef2f2",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: `1px solid ${
                        check.valid ? "#bbf7d0" : "#fecaca"
                      }`,
                    }}
                    title={check.message}
                  >
                    {check.valid
                      ? `✓ ${check.badge || `Age: ${check.age} yrs`}`
                      : `${check.badge || check.message}`}
                  </span>
                );
              })()}
          </div>
          <input
            type="text"
            name="dob"
            required
            placeholder="DD/MM/YYYY (e.g. 15/05/1988)"
            value={formData.dob}
            onChange={handleFormChange}
          />
          <span className="helper-text">
            Statutory entry age under K.E.R: 25 – 60 years.
          </span>
        </div>
        <div className="form-field-group">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <label style={{ margin: 0, whiteSpace: "nowrap" }}>
              Date of Appointment
            </label>
            {formData.appointmentDate &&
              (() => {
                const check = checkTeacherAppointmentDate(
                  formData.appointmentDate,
                  formData.dob
                );
                return (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: check.valid ? "#dcfce7" : "#fee2e2",
                      color: check.valid ? "#15803d" : "#b91c1c",
                      border: `1px solid ${
                        check.valid ? "#bbf7d0" : "#fecaca"
                      }`,
                    }}
                    title={check.message}
                  >
                    {check.valid
                      ? check.badge
                      : `✕ ${check.badge || check.message}`}
                  </span>
                );
              })()}
          </div>
          <input
            type="text"
            name="appointmentDate"
            placeholder="DD/MM/YYYY (e.g. 01/06/2018)"
            value={formData.appointmentDate}
            onChange={handleFormChange}
            style={{
              borderColor:
                formData.appointmentDate &&
                !checkTeacherAppointmentDate(
                  formData.appointmentDate,
                  formData.dob
                ).valid
                  ? "#ef4444"
                  : undefined,
            }}
          />
          <span className="helper-text">
            Official appointment memo / joining date under K.E.R. (Cannot be future date).
          </span>
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Current Duty Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleFormChange}
          >
            <option value="Active">Active</option>
            <option value="In Class">In Class</option>
            <option value="On Duty">On Duty</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
        <div className="form-field-group">
          <label>Teaching Qualification Summary</label>
          <input
            type="text"
            name="qualification"
            placeholder="e.g. M.A, B.Ed, SET"
            value={formData.qualification}
            onChange={handleFormChange}
          />
        </div>
      </div>
    </div>
  );
}
