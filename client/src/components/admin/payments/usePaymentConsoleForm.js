import { useState, useEffect, useMemo } from "react";
import api from "../../../api/axiosclient";
import { normalizeClassDivision, getAcademicWingForClass } from "../../../utils/classData";
import { validateHumanName } from "../../../utils/nameValidator";
import { useConfirm } from "../../../context/ConfirmContext";

export function usePaymentConsoleForm({ fetchPayments, studentsList }) {
  const confirm = useConfirm();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentLookupResults, setStudentLookupResults] = useState([]);

  const initialForm = {
    studentName: "",
    admissionNumber: "",
    rollNumber: "",
    classDivision: "Class 10-A",
    wing: "High School",
    feeCategory: "Bus Fee",
    academicYear: "2026-2027",
    term: "Term 1",
    totalAmount: 4500,
    amountPaid: 4500,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "Razorpay / Online",
    transactionReference: "",
    dueDate: "2026-11-20",
    remarks: "",
    collectedBy: "Accounts Desk / Sri. R. Krishnan",
  };

  const [paymentForm, setPaymentForm] = useState(initialForm);

  // Real-time backend search for student lookup in modal
  useEffect(() => {
    if (!studentSearchQuery.trim()) {
      setStudentLookupResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/admin/students?search=${encodeURIComponent(studentSearchQuery.trim())}&limit=6`);
        if (res.data.success && res.data.students) {
          setStudentLookupResults(res.data.students);
        }
      } catch (err) {
        console.error("Backend student lookup failed:", err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [studentSearchQuery]);

  // Filtered students for autocomplete inside modal (prefer backend results)
  const filteredStudentsForLookup = useMemo(() => {
    if (!studentSearchQuery.trim()) return [];
    if (studentLookupResults.length > 0) return studentLookupResults.slice(0, 6);
    const query = studentSearchQuery.toLowerCase();
    return (studentsList || [])
      .filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          (s.admissionNumber && s.admissionNumber.toLowerCase().includes(query)) ||
          (s.classDivision && s.classDivision.toLowerCase().includes(query))
      )
      .slice(0, 6);
  }, [studentSearchQuery, studentLookupResults, studentsList]);

  // Handle selecting a student in modal
  const handleSelectStudent = (student) => {
    const rawClass = student.classDivision || student.className || "Class 10-A";
    const norm = normalizeClassDivision(rawClass);
    const canonClass = norm ? norm.name : rawClass;
    const derivedWing = getAcademicWingForClass(canonClass);

    setPaymentForm((prev) => ({
      ...prev,
      studentId: student._id || null,
      studentName: student.name,
      admissionNumber: student.admissionNumber || "",
      rollNumber: student.rollNumber || "",
      classDivision: canonClass,
      wing: derivedWing,
    }));
    setStudentSearchQuery("");
  };

  // Open Record Modal (Create or Edit)
  const handleOpenRecordModal = (paymentToEdit = null) => {
    if (paymentToEdit) {
      setEditingPayment(paymentToEdit);
      setPaymentForm({
        studentId: paymentToEdit.studentId || null,
        studentName: paymentToEdit.studentName || "",
        admissionNumber: paymentToEdit.admissionNumber || "",
        rollNumber: paymentToEdit.rollNumber || "",
        classDivision: paymentToEdit.classDivision || "Class 10-A",
        wing: paymentToEdit.wing || "High School",
        feeCategory: paymentToEdit.feeCategory || "Bus Fee",
        academicYear: paymentToEdit.academicYear || "2026-2027",
        term: paymentToEdit.term || "Term 1",
        totalAmount: paymentToEdit.totalAmount || 0,
        amountPaid: paymentToEdit.amountPaid || 0,
        paymentDate: paymentToEdit.paymentDate || new Date().toISOString().split("T")[0],
        paymentMode: paymentToEdit.paymentMode || "UPI / Online (Google Pay / PhonePe)",
        transactionReference: paymentToEdit.transactionReference || "",
        dueDate: paymentToEdit.dueDate || "2026-11-20",
        remarks: paymentToEdit.remarks || "",
        collectedBy: paymentToEdit.collectedBy || "Accounts Desk / Sri. R. Krishnan",
      });
    } else {
      setEditingPayment(null);
      setPaymentForm(initialForm);
    }
    setStudentSearchQuery("");
    setIsRecordModalOpen(true);
  };

  // Open Receipt Modal
  const handleOpenReceiptModal = (payment) => {
    setViewingReceipt(payment);
    setIsReceiptModalOpen(true);
  };

  // Save payment (POST / PUT)
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.studentName || !paymentForm.admissionNumber || !paymentForm.classDivision) {
      setFeedback({ type: "error", message: "Please fill in all mandatory student details." });
      return;
    }

    const nameCheck = validateHumanName(paymentForm.studentName, "Student name");
    if (nameCheck !== true) {
      setFeedback({ type: "error", message: nameCheck });
      return;
    }

    try {
      setFormSubmitting(true);
      setFeedback({ type: "", message: "" });

      if (editingPayment) {
        const res = await api.put(`/admin/payments/${editingPayment._id}`, paymentForm);
        if (res.data.success) {
          setFeedback({ type: "success", message: "Fee payment record updated successfully!" });
          setIsRecordModalOpen(false);
          fetchPayments();
        }
      } else {
        const res = await api.post("/admin/payments", paymentForm);
        if (res.data.success) {
          setFeedback({ type: "success", message: "New fee payment recorded into ledger!" });
          setIsRecordModalOpen(false);
          fetchPayments();
        }
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save payment record.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete payment (Soft Delete)
  const handleDeletePayment = async (id, receiptNo) => {
    const isConfirmed = await confirm({
      title: "Move Payment to Recycle Bin?",
      message: `Are you sure you want to move payment record ${receiptNo} to the Recycle Bin (soft delete)?`,
      subMessage: "You can restore this payment voucher anytime from the Recycle Bin.",
      confirmText: "Move to Recycle Bin",
      cancelText: "Keep Record",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      const res = await api.delete(`/admin/payments/${id}`);
      if (res.data.success) {
        setFeedback({
          type: "success",
          message:
            res.data.message ||
            `Receipt ${receiptNo} moved to Recycle Bin (soft-deleted). You can restore it anytime.`,
        });
        fetchPayments();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to delete payment record.",
      });
    }
  };

  return {
    isRecordModalOpen,
    setIsRecordModalOpen,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    editingPayment,
    viewingReceipt,
    formSubmitting,
    feedback,
    setFeedback,
    studentSearchQuery,
    setStudentSearchQuery,
    filteredStudentsForLookup,
    paymentForm,
    setPaymentForm,
    handleSelectStudent,
    handleOpenRecordModal,
    handleOpenReceiptModal,
    handleSavePayment,
    handleDeletePayment,
  };
}
