import { useState } from "react";
import api from "../../../api/axiosclient";
import { checkTeacherAgeEligibility, checkTeacherAppointmentDate } from "../../../utils/ageValidator";
import { validateHumanName } from "../../../utils/nameValidator";
import { useConfirm } from "../../../context/ConfirmContext";

export function useTeacherForm({ fetchTeachers }) {
  const confirm = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("general");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState({});
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const initialForm = {
    name: "",
    pen: "",
    department: "HSST Malayalam",
    designation: "HSST",
    assignedClass: "Class 10-A",
    phone: "+91 94471 23450",
    email: "",
    periods: "24 hrs / Week",
    status: "Active",
    qualification: "M.A, B.Ed, SET",
    dob: "15/05/1988",
    appointmentDate: "01/06/2018",
    // Essential Statutory ID Proofs
    aadharNumber: "",
    aadharDocUrl: null,
    aadharDocFileName: null,
    panNumber: "",
    panDocUrl: null,
    panDocFileName: null,
    penAllotmentDocUrl: null,
    penAllotmentDocFileName: null,
    // Essential Qualification Certificates
    highestDegree: "Post Graduate (Master's)",
    pgDegreeName: "M.Sc Mathematics",
    pgCertificateUrl: null,
    pgCertificateFileName: null,
    ugDegreeName: "B.Sc Mathematics",
    ugCertificateUrl: null,
    ugCertificateFileName: null,
    bedCollege: "Govt. College of Teacher Education",
    bedCertificateUrl: null,
    bedCertificateFileName: null,
    eligibilityExam: "SET / KTET Qualified",
    eligibilityCertificateUrl: null,
    eligibilityCertificateFileName: null,
    experienceCertificateUrl: null,
    experienceCertificateFileName: null,
    documentsVerified: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const openAddTeacherModal = () => {
    setEditingTeacher(null);
    setIsEmailVerified(false);
    setActiveModalTab("general");
    setFormData({
      ...initialForm,
      pen: `849${Math.floor(200 + Math.random() * 800)}`,
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setIsEmailVerified(true);
    setActiveModalTab("general");
    setFormData({
      name: teacher.name || "",
      pen: teacher.pen || "",
      department: teacher.department || "",
      designation: teacher.designation || "HST",
      assignedClass: teacher.assignedClass || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      periods: teacher.periods || "",
      status: teacher.status || "Active",
      qualification: teacher.qualification || "",
      dob: teacher.dob || "15/05/1988",
      appointmentDate: teacher.appointmentDate || "",
      aadharNumber: teacher.aadharNumber || "",
      aadharDocUrl: teacher.aadharDocUrl || null,
      aadharDocFileName: teacher.aadharDocFileName || null,
      panNumber: teacher.panNumber || "",
      panDocUrl: teacher.panDocUrl || null,
      panDocFileName: teacher.panDocFileName || null,
      penAllotmentDocUrl: teacher.penAllotmentDocUrl || null,
      penAllotmentDocFileName: teacher.penAllotmentDocFileName || null,
      highestDegree: teacher.highestDegree || "Post Graduate (Master's)",
      pgDegreeName: teacher.pgDegreeName || "",
      pgCertificateUrl: teacher.pgCertificateUrl || null,
      pgCertificateFileName: teacher.pgCertificateFileName || null,
      ugDegreeName: teacher.ugDegreeName || "",
      ugCertificateUrl: teacher.ugCertificateUrl || null,
      ugCertificateFileName: teacher.ugCertificateFileName || null,
      bedCollege: teacher.bedCollege || "",
      bedCertificateUrl: teacher.bedCertificateUrl || null,
      bedCertificateFileName: teacher.bedCertificateFileName || null,
      eligibilityExam: teacher.eligibilityExam || "",
      eligibilityCertificateUrl: teacher.eligibilityCertificateUrl || null,
      eligibilityCertificateFileName: teacher.eligibilityCertificateFileName || null,
      experienceCertificateUrl: teacher.experienceCertificateUrl || null,
      experienceCertificateFileName: teacher.experienceCertificateFileName || null,
      documentsVerified: teacher.documentsVerified !== false,
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setIsEmailVerified(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "email" && value !== formData.email) {
      setIsEmailVerified(false);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDocumentUpload = async (e, urlKey, nameKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: "File exceeds 10MB limit. Please upload a smaller document.",
      });
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("document", file);

    try {
      setUploadingDoc((prev) => ({ ...prev, [urlKey]: true }));
      const res = await api.post("/upload/document", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          [urlKey]: res.data.fileUrl,
          [nameKey]: res.data.fileName || file.name,
        }));
        setFeedback({
          type: "success",
          message: `${file.name} uploaded & attached successfully!`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "File upload failed.",
      });
    } finally {
      setUploadingDoc((prev) => ({ ...prev, [urlKey]: false }));
    }
  };

  const handleRemoveDocument = (urlKey, nameKey) => {
    setFormData((prev) => ({
      ...prev,
      [urlKey]: null,
      [nameKey]: null,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const nameCheck = validateHumanName(formData.name, "Faculty full name");
    if (nameCheck !== true) {
      setActiveModalTab("general");
      setFeedback({ type: "error", message: nameCheck });
      return;
    }

    if (!formData.pen || !formData.pen.trim()) {
      setActiveModalTab("general");
      setFeedback({
        type: "error",
        message: "Government PEN number is required.",
      });
      return;
    }

    if (!formData.dob || !formData.dob.trim()) {
      setActiveModalTab("general");
      setFeedback({
        type: "error",
        message: "Teacher Date of Birth (DOB) is required.",
      });
      return;
    }

    const ageCheck = checkTeacherAgeEligibility(formData.dob);
    if (!ageCheck.valid) {
      setActiveModalTab("general");
      setFeedback({
        type: "error",
        message: ageCheck.message,
      });
      return;
    }

    if (formData.appointmentDate && formData.appointmentDate.trim()) {
      const apptCheck = checkTeacherAppointmentDate(formData.appointmentDate, formData.dob);
      if (!apptCheck.valid) {
        setActiveModalTab("general");
        setFeedback({
          type: "error",
          message: apptCheck.message,
        });
        return;
      }
    }

    if (!editingTeacher) {
      if (!formData.email || !formData.email.trim()) {
        setActiveModalTab("general");
        setFeedback({
          type: "error",
          message: "Official institutional email is required for faculty registration.",
        });
        return;
      }
      if (!isEmailVerified) {
        setActiveModalTab("general");
        setFeedback({
          type: "error",
          message: "Email verification required: Please verify the teacher's email with the 6-digit OTP code before completing registration.",
        });
        return;
      }
    }

    try {
      setFormSubmitting(true);
      if (editingTeacher) {
        const res = await api.put(
          `/admin/teachers/${editingTeacher._id}`,
          formData
        );
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Updated faculty ${formData.name}!`,
          });
          setTimeout(() => {
            closeModal();
            fetchTeachers();
          }, 800);
        }
      } else {
        const res = await api.post("/admin/teachers", formData);
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Registered faculty ${formData.name} successfully!`,
          });
          setTimeout(() => {
            closeModal();
            fetchTeachers();
          }, 800);
        }
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save record.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!editingTeacher) return;
    const isConfirmed = await confirm({
      title: "Move Faculty to Recycle Bin?",
      message: `Are you sure you want to move ${editingTeacher.name} (PEN: ${editingTeacher.pen}) to the Recycle Bin (soft delete)?`,
      subMessage: "This faculty record will be soft-deleted. You can restore it anytime from the Recycle Bin.",
      confirmText: "Move to Recycle Bin",
      cancelText: "Keep Record",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      setFormSubmitting(true);
      const res = await api.delete(`/admin/teachers/${editingTeacher._id}`);
      if (res.data.success) {
        closeModal();
        fetchTeachers();
        setFeedback({
          type: "success",
          message:
            res.data.message ||
            `Teacher ${editingTeacher.name} moved to trash (soft-deleted). You can restore it from the Recycle Bin.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to delete teacher.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  return {
    isModalOpen,
    editingTeacher,
    isEmailVerified,
    setIsEmailVerified,
    activeModalTab,
    setActiveModalTab,
    formData,
    uploadingDoc,
    formSubmitting,
    feedback,
    openAddTeacherModal,
    openEditModal,
    closeModal,
    handleFormChange,
    handleDocumentUpload,
    handleRemoveDocument,
    handleFormSubmit,
    handleDeleteTeacher,
  };
}
