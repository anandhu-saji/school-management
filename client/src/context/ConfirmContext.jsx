import { createContext, useContext, useState, useRef, useCallback } from "react";
import ConfirmDialog from "../components/common/ConfirmDialog";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "Confirm Action",
    message: "",
    subMessage: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "danger",
    showCancel: true,
  });

  const resolverRef = useRef(null);

  /**
   * Request user confirmation.
   * Can be passed an object or a plain string message.
   * Resolves to true if user clicks confirm, or false if cancelled.
   */
  const confirm = useCallback((options) => {
    const opts = typeof options === "string" ? { message: options } : (options || {});

    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        title: opts.title || (opts.type === "danger" ? "Confirm Deletion" : "Confirm Action"),
        message: opts.message || "Are you sure you want to proceed?",
        subMessage: opts.subMessage || "",
        confirmText: opts.confirmText || (opts.type === "danger" ? "Yes, Proceed" : "Confirm"),
        cancelText: opts.cancelText || "Cancel",
        type: opts.type || "danger",
        showCancel: opts.showCancel !== false,
      });
    });
  }, []);

  /**
   * Request user acknowledgment (alert dialog without cancel button).
   */
  const alertDialog = useCallback((message, options = {}) => {
    const opts = typeof options === "string" ? { title: options } : options;
    return confirm({
      title: opts.title || "Notification",
      message: typeof message === "string" ? message : opts.message || "",
      subMessage: opts.subMessage || "",
      type: opts.type || "info",
      confirmText: opts.confirmText || "OK",
      showCancel: false,
    });
  }, [confirm]);

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm, alert: alertDialog }}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        subMessage={dialogState.subMessage}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        type={dialogState.type}
        showCancel={dialogState.showCancel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * Hook to show custom confirmation dialog:
 * const confirm = useConfirm();
 * const ok = await confirm({ title: "...", message: "...", type: "danger" });
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}

/**
 * Hook to show custom alert modal:
 * const alert = useAlert();
 * await alert("Record updated successfully!", { title: "Success", type: "success" });
 */
export function useAlert() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useAlert must be used within a ConfirmProvider");
  }
  return context.alert;
}

export default ConfirmContext;
