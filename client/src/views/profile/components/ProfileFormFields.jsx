export default function ProfileFormFields({
  formData,
  handleInputChange,
  role,
}) {
  return (
    <>
      <div className="profile-form-section-title">
        <span>👤</span>
        <span>Personal &amp; Contact Details</span>
      </div>

      <div className="profile-form-grid">
        <div className="profile-form-group">
          <label className="profile-form-label">
            Full Legal Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            className="profile-form-input"
            value={formData.name || ""}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            Institutional Email ID{" "}
            <span className="field-official-tag">Official</span>
          </label>
          <input
            type="email"
            name="email"
            className="profile-form-input readonly"
            value={formData.email || ""}
            readOnly
            title="Official institutional email ID cannot be edited online"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            Official Phone Number <span className="required">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            className="profile-form-input"
            value={formData.phone || ""}
            onChange={handleInputChange}
            placeholder="+91 98765 43210"
            required
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">Gender</label>
          <select
            name="gender"
            className="profile-form-select"
            value={formData.gender || "Male"}
            onChange={handleInputChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">Date of Birth</label>
          <input
            type="text"
            name="dob"
            className="profile-form-input"
            value={formData.dob || ""}
            onChange={handleInputChange}
            placeholder="YYYY-MM-DD or DD/MM/YYYY"
          />
        </div>

        {role === "student" && (
          <div className="profile-form-group">
            <label className="profile-form-label">Blood Group</label>
            <select
              name="bloodGroup"
              className="profile-form-select"
              value={formData.bloodGroup || "O+"}
              onChange={handleInputChange}
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
        )}

        {role === "teacher" && (
          <div className="profile-form-group">
            <label className="profile-form-label">
              Academic Qualifications
            </label>
            <input
              type="text"
              name="qualification"
              className="profile-form-input"
              value={formData.qualification || ""}
              onChange={handleInputChange}
              placeholder="M.Sc, B.Ed, SET"
            />
          </div>
        )}
      </div>

      {/* Student-Specific Guardian and Address */}
      {role === "student" && (
        <>
          <div className="profile-form-section-title">
            <span>👨‍👩‍👧</span>
            <span>Guardian &amp; Residential Address</span>
          </div>

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label className="profile-form-label">Guardian Full Name</label>
              <input
                type="text"
                name="guardian"
                className="profile-form-input"
                value={formData.guardian || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Parent / Guardian Contact
              </label>
              <input
                type="tel"
                name="parentContact"
                className="profile-form-input"
                value={formData.parentContact || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="profile-form-group span-2">
              <label className="profile-form-label">
                House Name / Door Number
              </label>
              <input
                type="text"
                name="houseName"
                className="profile-form-input"
                value={formData.houseName || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                City / Village / Post Office
              </label>
              <input
                type="text"
                name="city"
                className="profile-form-input"
                value={formData.city || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Postal PIN Code</label>
              <input
                type="text"
                name="pincode"
                className="profile-form-input"
                value={formData.pincode || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
