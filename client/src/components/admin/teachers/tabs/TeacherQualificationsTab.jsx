import TeacherDocUploadCard from "./TeacherDocUploadCard";

export default function TeacherQualificationsTab({
  formData,
  handleFormChange,
  uploadingDoc,
  handleDocumentUpload,
  handleRemoveDocument,
}) {
  return (
    <div>
      <div className="form-section-header" style={{ marginBottom: "14px" }}>
        Mandatory Academic Degrees &amp; Teaching Eligibility
      </div>

      {/* B.Ed Degree (Essential Teaching Qualification) */}
      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>B.Ed / Teaching Training College *</label>
          <input
            type="text"
            name="bedCollege"
            placeholder="e.g. Govt. College of Teacher Education, Kozhikode"
            value={formData.bedCollege}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Year of Passing B.Ed</label>
          <input
            type="number"
            name="bedYear"
            placeholder="e.g. 2014"
            value={formData.bedYear}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div>
        <TeacherDocUploadCard
          label="B.Ed Degree Certificate / Marklist *"
          urlKey="bedCertificateUrl"
          nameKey="bedCertificateFileName"
          helpText="Upload verified University Degree Certificate or Final Marklist (PDF / Image)"
          icon="DEG"
          formData={formData}
          uploadingDoc={uploadingDoc}
          handleDocumentUpload={handleDocumentUpload}
          handleRemoveDocument={handleRemoveDocument}
        />
      </div>

      {/* Post Graduation / Master's Degree */}
      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Post-Graduation / Master's Degree Title</label>
          <input
            type="text"
            name="pgDegree"
            placeholder="e.g. M.Sc Chemistry / M.A English Literature"
            value={formData.pgDegree}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>PG University / Year</label>
          <input
            type="text"
            name="pgYear"
            placeholder="e.g. MG University (2012)"
            value={formData.pgYear}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div>
        <TeacherDocUploadCard
          label="Master's / Post Graduation Degree Certificate (Optional)"
          urlKey="pgCertificateUrl"
          nameKey="pgCertificateFileName"
          helpText="Mandatory for Higher Secondary School Teacher (HSST) Cadres (PDF / Image)"
          icon="DEG"
          formData={formData}
          uploadingDoc={uploadingDoc}
          handleDocumentUpload={handleDocumentUpload}
          handleRemoveDocument={handleRemoveDocument}
        />
      </div>

      {/* State Eligibility Test (SET / NET / KTET) */}
      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Kerala Eligibility Test (SET / KTET / NET / Ph.D)</label>
          <input
            type="text"
            name="setRollNumber"
            placeholder="e.g. Roll No: SET/2015/88192"
            value={formData.setRollNumber}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <TeacherDocUploadCard
            label="SET / KTET / NET Scorecard / Certificate"
            urlKey="setCertificateUrl"
            nameKey="setCertificateFileName"
            helpText="State / National eligibility scorecard (PDF / Image)"
            icon="CERT"
            formData={formData}
            uploadingDoc={uploadingDoc}
            handleDocumentUpload={handleDocumentUpload}
            handleRemoveDocument={handleRemoveDocument}
          />
        </div>
      </div>

      {/* Prior Experience Certificate */}
      <div>
        <TeacherDocUploadCard
          label="Teaching Experience / Prior Service Book Copy (Optional)"
          urlKey="experienceCertificateUrl"
          nameKey="experienceCertificateFileName"
          helpText="Prior government or aided school service records (PDF/Image)"
          icon="DOC"
          formData={formData}
          uploadingDoc={uploadingDoc}
          handleDocumentUpload={handleDocumentUpload}
          handleRemoveDocument={handleRemoveDocument}
        />
      </div>

      {/* Verification Toggle */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px 16px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="checkbox"
          id="documentsVerified"
          name="documentsVerified"
          checked={formData.documentsVerified}
          onChange={handleFormChange}
          style={{ width: "18px", height: "18px", cursor: "pointer" }}
        />
        <label
          htmlFor="documentsVerified"
          style={{
            fontSize: "12.5px",
            fontWeight: "700",
            color: "#166534",
            cursor: "pointer",
            margin: 0,
            textTransform: "none",
          }}
        >
          Statutory Document Verification Completed by Headmaster / Chief Admin (Rule 12 K.E.R)
        </label>
      </div>
    </div>
  );
}
