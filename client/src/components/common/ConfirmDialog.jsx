import { useEffect, useRef } from "react";
import "../../Styles/ConfirmDialog.css";

// SVG Icons for different dialog types
function DangerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  subMessage = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  showCancel = true,
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus confirm button upon opening
    const timer = setTimeout(() => {
      if (confirmBtnRef.current) {
        confirmBtnRef.current.focus();
      }
    }, 50);

    // Handle ESC key to cancel
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case "danger":
        return <DangerIcon />;
      case "warning":
        return <WarningIcon />;
      case "info":
        return <InfoIcon />;
      case "success":
        return <SuccessIcon />;
      default:
        return <DangerIcon />;
    }
  };

  return (
    <div
      className="confirm-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="confirm-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="confirm-header">
          <div className={`confirm-icon-wrap ${type}`}>
            {renderIcon()}
          </div>
          <div className="confirm-title-area">
            <h3 id="confirm-dialog-title" className="confirm-title">
              {title}
            </h3>
            <span className="confirm-subtitle-tag">
              Sampoorna 2.0 • Security Confirmation
            </span>
          </div>
          <button
            type="button"
            className="confirm-close-btn"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="confirm-body">
          <p className="confirm-message">{message}</p>
          {subMessage && (
            <div className={`confirm-submessage ${type}`}>
              <span className="confirm-submessage-icon">⚠️</span>
              <span>{subMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="confirm-footer">
          {showCancel && (
            <button
              type="button"
              className="confirm-btn-cancel"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            ref={confirmBtnRef}
            type="button"
            className={`confirm-btn-action ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
