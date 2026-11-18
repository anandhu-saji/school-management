export default function FamilyDetailsTab({ formData, handleFormChange }) {
  return (
    <div>
      <div className="form-section-header">
        Parent &amp; Guardian Information
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Father's Full Name</label>
          <input
            type="text"
            name="fatherName"
            placeholder="e.g. Santhosh Kumar K."
            value={formData.fatherName}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Mother's Full Name</label>
          <input
            type="text"
            name="motherName"
            placeholder="e.g. Rekha Santhosh"
            value={formData.motherName}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Primary Guardian Name *</label>
          <input
            type="text"
            name="guardian"
            placeholder="e.g. Santhosh Kumar K."
            value={formData.guardian}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Relationship with Student</label>
          <select
            name="guardianRelation"
            value={formData.guardianRelation}
            onChange={handleFormChange}
          >
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Grandfather">Grandfather</option>
            <option value="Grandmother">Grandmother</option>
            <option value="Uncle">Uncle</option>
            <option value="Legal Guardian">Legal Guardian</option>
          </select>
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Primary Mobile (SMS / WhatsApp) *</label>
          <input
            type="text"
            name="parentContact"
            placeholder="+91 94473 11820"
            value={formData.parentContact}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Emergency / Alternate Contact</label>
          <input
            type="text"
            name="altContact"
            placeholder="+91 98460 00000"
            value={formData.altContact}
            onChange={handleFormChange}
          />
        </div>
      </div>
    </div>
  );
}
