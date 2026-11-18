import { getDocumentUrl } from "../../../../utils/documentUrl";

export default function IdProofsTab({
  formData,
  handleFormChange,
  handleFileUpload,
  handleRemoveUploadedFile,
  uploadingIdProof,
  uploadingBcProof,
  fileInputRef,
  bcFileInputRef,
}) {
  return (
    <div>
      <div className="form-section-header">
        Government Identity Documents &amp; Upload
      </div>

      {/* Aadhaar Number Field */}
      <div className="form-field-group">
        <label>Aadhaar Card Number (12-Digit UID)</label>
        <input
          type="text"
          name="aadhaarNumber"
          maxLength="14"
          placeholder="XXXX XXXX XXXX (e.g. 5482 9102 3841)"
          value={formData.aadhaarNumber}
          onChange={handleFormChange}
        />
        <span className="helper-text">
          Mandatory for UDISE+ and Kerala Sampoorna direct scholarship seeding.
        </span>
      </div>

      {/* 1. Upload Aadhaar / Primary ID Proof File */}
      <div className="form-field-group" style={{ marginBottom: "20px" }}>
        <label>Upload Aadhaar / ID Proof Document (Image or PDF)</label>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => handleFileUpload(e, "idProof")}
        />

        {formData.idProofUrl ? (
          <div className="uploaded-file-card">
            <div className="uploaded-file-info">
              {formData.idProofFileType === "pdf" ? (
                <div className="uploaded-pdf-badge">
                  <span>PDF</span>
                </div>
              ) : (
                <img
                  src={getDocumentUrl(formData.idProofUrl)}
                  alt="ID Proof Preview"
                  className="uploaded-file-thumbnail"
                />
              )}
              <div className="uploaded-file-names">
                <span className="uploaded-file-name">
                  {formData.idProofFileName || "Aadhaar_Proof_Document"}
                </span>
                <span className="uploaded-file-status">
                  ✓ Uploaded &amp; Attached
                </span>
              </div>
            </div>
            <div className="uploaded-file-actions">
              <a
                href={getDocumentUrl(formData.idProofUrl)}
                target="_blank"
                rel="noreferrer"
                className="btn-file-preview"
              >
                View / Open ↗
              </a>
              <button
                type="button"
                className="btn-file-remove"
                onClick={() => handleRemoveUploadedFile("idProof")}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`upload-dropzone ${uploadingIdProof ? "disabled" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon-circle">
              {uploadingIdProof ? "..." : "Upload"}
            </div>
            <p className="upload-prompt-text">
              {uploadingIdProof
                ? "Uploading document to secure storage..."
                : "Click to upload Aadhaar / ID Proof file"}
            </p>
            <p className="upload-sub-text">
              Supports PDF documents or Image files (JPG, PNG, WEBP) up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Birth Certificate Number Field */}
      <div className="form-field-group">
        <label>Birth Certificate Registration Number</label>
        <input
          type="text"
          name="birthCertificateNumber"
          placeholder="e.g. KL-2010-060421-BC"
          value={formData.birthCertificateNumber}
          onChange={handleFormChange}
        />
      </div>

      {/* 2. Upload Birth Certificate File (Optional) */}
      <div className="form-field-group" style={{ marginBottom: "20px" }}>
        <label>Upload Birth Certificate Copy (Optional - Image or PDF)</label>
        <input
          type="file"
          ref={bcFileInputRef}
          accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => handleFileUpload(e, "birthCertificate")}
        />

        {formData.birthCertificateUrl ? (
          <div className="uploaded-file-card">
            <div className="uploaded-file-info">
              <div
                className="uploaded-pdf-badge"
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  borderColor: "#bae6fd",
                }}
              >
                <span>DOC</span>
              </div>
              <div className="uploaded-file-names">
                <span className="uploaded-file-name">
                  {formData.birthCertificateFileName || "Birth_Certificate"}
                </span>
                <span className="uploaded-file-status">
                  ✓ Uploaded &amp; Attached
                </span>
              </div>
            </div>
            <div className="uploaded-file-actions">
              <a
                href={getDocumentUrl(formData.birthCertificateUrl)}
                target="_blank"
                rel="noreferrer"
                className="btn-file-preview"
              >
                View / Open ↗
              </a>
              <button
                type="button"
                className="btn-file-remove"
                onClick={() => handleRemoveUploadedFile("birthCertificate")}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`upload-dropzone ${uploadingBcProof ? "disabled" : ""}`}
            onClick={() => bcFileInputRef.current?.click()}
          >
            <div
              className="upload-icon-circle"
              style={{ background: "#f0fdf4", color: "#16a34a" }}
            >
              {uploadingBcProof ? "..." : "Upload"}
            </div>
            <p className="upload-prompt-text">
              {uploadingBcProof
                ? "Uploading certificate..."
                : "Click to upload Birth Certificate file (Image or PDF)"}
            </p>
            <p className="upload-sub-text">
              Local Self Government / Corporation registration certificate
            </p>
          </div>
        )}
      </div>

      <div className="form-field-group">
        <label>Visible Identification Marks (Govt. SSLC)</label>
        <input
          type="text"
          name="identificationMarks"
          placeholder="e.g. A mole on the right cheek / A small scar on the left forehead"
          value={formData.identificationMarks}
          onChange={handleFormChange}
        />
        <span className="helper-text">
          Recorded on the SSLC Book &amp; Hall Ticket for identification.
        </span>
      </div>
    </div>
  );
}
