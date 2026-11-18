import TeacherDocUploadCard from "./TeacherDocUploadCard";

export default function TeacherIdProofsTab({
  formData,
  handleFormChange,
  uploadingDoc,
  handleDocumentUpload,
  handleRemoveDocument,
}) {
  return (
    <div>
      <div className="form-section-header" style={{ marginBottom: "14px" }}>
        Statutory Government Identification (SPARK / K.E.R Compliant)
      </div>

      {/* Aadhaar Card */}
      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Aadhaar UID Number</label>
          <input
            type="text"
            name="aadharNumber"
            placeholder="XXXX-XXXX-XXXX"
            value={formData.aadharNumber}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <TeacherDocUploadCard
            label="Aadhaar Card Copy"
            urlKey="aadharDocUrl"
            nameKey="aadharDocFileName"
            helpText="Upload Aadhaar front & back copy (PDF or Image)"
            icon="ID"
            formData={formData}
            uploadingDoc={uploadingDoc}
            handleDocumentUpload={handleDocumentUpload}
            handleRemoveDocument={handleRemoveDocument}
          />
        </div>
      </div>

      {/* PAN Card */}
      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Permanent Account Number (PAN)</label>
          <input
            type="text"
            name="panNumber"
            placeholder="e.g. ABCDE1234F"
            value={formData.panNumber}
            onChange={handleFormChange}
          />
          <span className="helper-text">
            Required for government treasury &amp; SPARK payroll.
          </span>
        </div>
        <div>
          <TeacherDocUploadCard
            label="PAN Card Copy"
            urlKey="panDocUrl"
            nameKey="panDocFileName"
            helpText="Upload clear copy of PAN Card (PDF or Image)"
            icon="PAN"
            formData={formData}
            uploadingDoc={uploadingDoc}
            handleDocumentUpload={handleDocumentUpload}
            handleRemoveDocument={handleRemoveDocument}
          />
        </div>
      </div>

      {/* SPARK / Govt Appointment Order */}
      <div>
        <TeacherDocUploadCard
          label="Government PEN / SPARK Cadre Appointment Order"
          urlKey="penAllotmentDocUrl"
          nameKey="penAllotmentDocFileName"
          helpText="Official appointment memo / PEN allotment order issued by Director of General Education (PDF / Image)"
          icon="DOC"
          formData={formData}
          uploadingDoc={uploadingDoc}
          handleDocumentUpload={handleDocumentUpload}
          handleRemoveDocument={handleRemoveDocument}
        />
      </div>
    </div>
  );
}
