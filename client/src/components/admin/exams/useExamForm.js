import { useState } from "react";
import api from "../../../api/axiosclient";
import { validateExamDate, formatDateToStandard } from "../../../utils/examDateValidator";
import { useConfirm, useAlert } from "../../../context/ConfirmContext";

export function useExamForm({ fetchExams }) {
  const confirm = useConfirm();
  const customAlert = useAlert();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const initialForm = {
    examName: "SSLC Board Examination March 2027",
    term: "SSLC Board Examination March 2027",
    standard: "Standard 10 (SSLC)",
    date: "",
    startTime: "09:30 AM",
    endTime: "12:15 PM",
    duration: "2 hrs 45 mins",
    subject: "",
    qpCode: "",
    hall: "Halls 01, 02, 03, 04",
    totalCandidates: 242,
    invigilator: "Mrs. Indu B Nair, Sri. George K.",
    maxMarks: 80,
    passMarks: 24,
    status: "Approved & Published",
    instructions:
      "15 minutes cool-off time provided before writing starts. Candidates must be seated by 09:15 AM with valid photo hall tickets.",
  };

  const [formData, setFormData] = useState(initialForm);

  const openAddExamModal = () => {
    setEditingExam(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultUpcomingDate = formatDateToStandard(tomorrow);

    setFormData({
      ...initialForm,
      examName: "SSLC Board Examination March 2027",
      term: "SSLC Board Examination March 2027",
      date: defaultUpcomingDate,
      subject: "",
      qpCode: "",
    });
    setFeedback({ type: "", message: "" });
    setIsScheduleModalOpen(true);
  };

  const openEditExamModal = (exam) => {
    setEditingExam(exam);
    const resolvedName = exam.examName || exam.term || "SSLC Board Examination March 2027";
    setFormData({
      examName: resolvedName,
      term: resolvedName,
      standard: exam.standard || "Standard 10 (SSLC)",
      date: exam.date || "",
      startTime: exam.startTime || "09:30 AM",
      endTime: exam.endTime || "12:15 PM",
      duration: exam.duration || "2 hrs 45 mins",
      subject: exam.subject || "",
      qpCode: exam.qpCode || "",
      hall: exam.hall || "Halls 01, 02, 03, 04",
      totalCandidates: exam.totalCandidates || 242,
      invigilator: exam.invigilator || "Mrs. Indu B Nair",
      maxMarks: exam.maxMarks || 80,
      passMarks: exam.passMarks || 24,
      status: exam.status || "Approved & Published",
      instructions: exam.instructions || "",
    });
    setFeedback({ type: "", message: "" });
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setEditingExam(null);
    setFeedback({ type: "", message: "" });
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.date.trim() || !formData.qpCode.trim()) {
      setFeedback({
        type: "error",
        message: "Subject, Exam Date, and QP Code are required.",
      });
      return;
    }

    const dateValidation = validateExamDate(formData.date);
    if (dateValidation !== true) {
      setFeedback({
        type: "error",
        message: dateValidation,
      });
      return;
    }

    const resolvedName = (formData.examName || formData.term || "SSLC Board Examination March 2027").trim();
    const payload = {
      ...formData,
      examName: resolvedName,
      term: resolvedName,
    };

    try {
      setFormSubmitting(true);
      if (editingExam) {
        const res = await api.put(`/admin/exams/${editingExam._id}`, payload);
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Updated schedule for ${formData.subject}!`,
          });
          setTimeout(() => {
            closeScheduleModal();
            fetchExams();
          }, 700);
        }
      } else {
        const res = await api.post("/admin/exams", payload);
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `New exam paper ${formData.subject} scheduled successfully!`,
          });
          setTimeout(() => {
            closeScheduleModal();
            fetchExams();
          }, 700);
        }
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save exam schedule.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteExam = async (exam) => {
    const isConfirmed = await confirm({
      title: "Move Exam to Recycle Bin?",
      message: `Are you sure you want to move the schedule for ${exam.subject} (${exam.qpCode}) to the Recycle Bin (soft delete)?`,
      subMessage: "You can restore this exam schedule anytime from the Recycle Bin.",
      confirmText: "Move to Recycle Bin",
      cancelText: "Keep Schedule",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      const res = await api.delete(`/admin/exams/${exam._id}`);
      if (res.data.success) {
        fetchExams();
      }
    } catch (err) {
      await customAlert(err.response?.data?.message || "Failed to delete exam schedule.", {
        title: "Deletion Failed",
        type: "danger",
      });
    }
  };

  const handleMarkExamCompleted = async (exam) => {
    const isConfirmed = await confirm({
      title: "Mark Examination as Completed?",
      message: `Are you sure you want to mark "${exam.examName || exam.term} - ${exam.subject}" as Completed?`,
      subMessage: "Once completed, this exam will immediately appear in the Teacher Portal for entering student grades.",
      confirmText: "Mark Completed",
      cancelText: "Cancel",
      type: "info",
    });

    if (!isConfirmed) return;

    try {
      const res = await api.put(`/admin/exams/${exam._id}`, { status: "Completed" });
      if (res.data.success) {
        fetchExams();
      }
    } catch (err) {
      await customAlert(err.response?.data?.message || "Failed to update exam status.", {
        title: "Update Failed",
        type: "danger",
      });
    }
  };

  return {
    isScheduleModalOpen,
    editingExam,
    formData,
    setFormData,
    formSubmitting,
    feedback,
    openAddExamModal,
    openEditExamModal,
    closeScheduleModal,
    handleSaveExam,
    handleDeleteExam,
    handleMarkExamCompleted,
  };
}
