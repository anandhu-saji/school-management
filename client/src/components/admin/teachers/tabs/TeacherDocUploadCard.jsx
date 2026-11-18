import { getDocumentUrl } from "../../../../utils/documentUrl";

export default function TeacherDocUploadCard({
  label,
  urlKey,
  nameKey,
  helpText,
  icon = "DOC",
  formData,
  uploadingDoc,
  handleDocumentUpload,
  handleRemoveDocument,
}) {
  const fileUrl = formData[urlKey];
  const fileName = formData[nameKey];
  const isUploading = uploadingDoc[urlKey];
  const isPdf =
    fileUrl &&
    (fileUrl.toLowerCase().endsWith(".pdf") ||
      (fileName && fileName.toLowerCase().endsWith(".pdf")));

  return (
    <div className="form-field-group" style={{ marginBottom: "16px" }}>
      <label>{label}</label>
      <span className="helper-text" style={{ marginBottom: "6px" }}>
        {helpText}
      </span>

      {fileUrl ? (
        <div className="uploaded-file-card">
          <div className="uploaded-file-info">
            {isPdf ? (
              <div className="uploaded-pdf-badge">
                <span>PDF</span>
              </div>
            ) : (
              <img
                src={getDocumentUrl(fileUrl)}
                alt={fileName}
                className="uploaded-file-thumbnail"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div className="uploaded-file-names">
              <span className="uploaded-file-name" title={fileName}>
                {fileName}
              </span>
              <span className="uploaded-file-status">
                ✓ Uploaded &amp; Attached
              </span>
            </div>
          </div>

          <div className="uploaded-file-actions">
            <a
              href={getDocumentUrl(fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="btn-file-preview"
              title="View document in new tab"
            >
              View ↗
            </a>
            <button
              type="button"
              className="btn-file-remove"
              onClick={() => handleRemoveDocument(urlKey, nameKey)}
              title="Remove attached document"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`upload-dropzone ${isUploading ? "disabled" : ""}`}
          style={{ padding: "14px 18px", marginTop: "4px" }}
        >
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            style={{ display: "none" }}
            onChange={(e) => handleDocumentUpload(e, urlKey, nameKey)}
            disabled={isUploading}
          />
          <div
            className="upload-icon-circle"
            style={{ width: "36px", height: "36px", fontSize: "16px" }}
          >
            {isUploading ? "..." : icon}
          </div>
          <p className="upload-prompt-text" style={{ fontSize: "13px" }}>
            {isUploading
              ? "Uploading file..."
              : `Click to browse & upload ${label}`}
          </p>
          <p className="upload-sub-text" style={{ fontSize: "11px" }}>
            Accepts PDF or Images (JPG, PNG) up to 10MB
          </p>
        </label>
      )}
    </div>
  );
}
