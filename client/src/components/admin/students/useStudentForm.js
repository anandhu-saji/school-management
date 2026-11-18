import { useState } from "react";
import api from "../../../api/axiosclient";
import { normalizeClassDivision } from "../../../utils/classData";
import { checkStudentAgeEligibility } from "../../../utils/ageValidator";
import { validateHumanName } from "../../../utils/nameValidator";

export const initialStudentForm = {
  name: "",
  email: "",
  rollNumber: "",
  admissionNumber: "",
  sampoornaId: "",
  division: "Class 10-A",
  gender: "Male",
  category: "General",
  dob: "2010-05-14",
  bloodGroup: "O+",
  religion: "Hindu",
  caste: "",
  aadhaarNumber: "",
  birthCertificateNumber: "",
  idProofUrl: "",
  idProofType: "Aadhaar Card",
  idProofFileName: "",
  idProofFileType: "",
  birthCertificateUrl: "",
  birthCertificateFileName: "",
  identificationMarks: "",
  fatherName: "",
  motherName: "",
  guardian: "",
  guardianRelation: "Father",
  parentContact: "",
  altContact: "",
  houseName: "",
  street: "",
  postOffice: "",
  city: "",
  district: "Idukki",
  state: "Kerala",
  pincode: "",
  previousSchool: "",
  tcNumber: "",
};

export default function useStudentForm({
  students,
  fetchStudents,
  setFeedback,
  confirm,
  fileInputRef,
  bcFileInputRef,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("personal");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingIdProof, setUploadingIdProof] = useState(false);
  const [uploadingBcProof, setUploadingBcProof] = useState(false);
  const [formData, setFormData] = useState(initialStudentForm);

  const openNewAdmissionModal = () => {
    setEditingStudent(null);
    setIsEmailVerified(false);
    setActiveModalTab("personal");
    const nextRoll = students.length + 1;
    setFormData({
      ...initialStudentForm,
      email: "",
      rollNumber: nextRoll,
      admissionNumber: `ADM-${14920 + nextRoll}`,
      sampoornaId: `SMP-06042-${880 + nextRoll}`,
      dob: "2010-05-14",
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setIsEmailVerified(true);
    setActiveModalTab("personal");
    setFormData({
      name: student.name || "",
      email: student.email || "",
      rollNumber: student.rollNumber || "",
      admissionNumber: student.admissionNumber || "",
      sampoornaId: student.sampoornaId || "",
      division: (() => {
        const norm = normalizeClassDivision(student.classDivision || student.division);
        return norm ? norm.name : (student.classDivision || student.division || "Class 10-A");
      })(),
      gender: student.gender || "Male",
      category: student.category ? student.category.split(" / ")[0] : "General",
      dob: student.dob || "2010-05-14",
      bloodGroup: student.bloodGroup || "O+",
      religion: student.religion || "Hindu",
      caste: student.caste || "",
      aadhaarNumber: student.aadhaarNumber || "",
      birthCertificateNumber: student.birthCertificateNumber || "",
      idProofUrl: student.idProofUrl || "",
      idProofType: student.idProofType || "Aadhaar Card",
      idProofFileName: student.idProofFileName || "",
      idProofFileType: student.idProofFileType || "",
      birthCertificateUrl: student.birthCertificateUrl || "",
      birthCertificateFileName: student.birthCertificateFileName || "",
      identificationMarks: student.identificationMarks || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      guardian: student.guardian || "",
      guardianRelation: student.guardianRelation || "Father",
      parentContact: student.parentContact || "",
      altContact: student.altContact || "",
      houseName: student.address?.houseName || "",
      street: student.address?.street || "",
      postOffice: student.address?.postOffice || "",
      city: student.address?.city || "",
      district: student.address?.district || "Idukki",
      state: student.address?.state || "Kerala",
      pincode: student.address?.pincode || "",
      previousSchool: student.previousSchool || "",
      tcNumber: student.tcNumber || "",
    });
    setFeedback({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setIsEmailVerified(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value !== formData.email) {
      setIsEmailVerified(false);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, fieldType = "idProof") => {
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
      if (fieldType === "idProof") setUploadingIdProof(true);
      else setUploadingBcProof(true);

      const res = await api.post("/upload/document", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        if (fieldType === "idProof") {
          setFormData((prev) => ({
            ...prev,
            idProofUrl: res.data.fileUrl,
            idProofFileName: res.data.fileName,
            idProofFileType: res.data.fileType,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            birthCertificateUrl: res.data.fileUrl,
            birthCertificateFileName: res.data.fileName,
          }));
        }
        setFeedback({
          type: "success",
          message: `${file.name} uploaded successfully!`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "File upload failed.",
      });
    } finally {
      if (fieldType === "idProof") {
        setUploadingIdProof(false);
        if (fileInputRef?.current) fileInputRef.current.value = "";
      } else {
        setUploadingBcProof(false);
        if (bcFileInputRef?.current) bcFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveUploadedFile = (fieldType = "idProof") => {
    if (fieldType === "idProof") {
      setFormData((prev) => ({
        ...prev,
        idProofUrl: "",
        idProofFileName: "",
        idProofFileType: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        birthCertificateUrl: "",
        birthCertificateFileName: "",
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const nameCheck = validateHumanName(formData.name, "Student full name");
    if (nameCheck !== true) {
      setActiveModalTab("personal");
      setFeedback({ type: "error", message: nameCheck });
      return;
    }

    if (formData.fatherName && formData.fatherName.trim()) {
      const fCheck = validateHumanName(formData.fatherName, "Father's name");
      if (fCheck !== true) {
        setActiveModalTab("family");
        setFeedback({ type: "error", message: fCheck });
        return;
      }
    }

    if (formData.motherName && formData.motherName.trim()) {
      const mCheck = validateHumanName(formData.motherName, "Mother's name");
      if (mCheck !== true) {
        setActiveModalTab("family");
        setFeedback({ type: "error", message: mCheck });
        return;
      }
    }

    if (formData.guardian && formData.guardian.trim()) {
      const gCheck = validateHumanName(formData.guardian, "Guardian's name");
      if (gCheck !== true) {
        setActiveModalTab("family");
        setFeedback({ type: "error", message: gCheck });
        return;
      }
    }

    if (!editingStudent && formData.email && formData.email.trim() && !isEmailVerified) {
      setActiveModalTab("personal");
      setFeedback({
        type: "error",
        message: "Email verification required: Please verify the student's email with the 6-digit OTP code before completing admission.",
      });
      return;
    }
    if (formData.dob) {
      const ageCheck = checkStudentAgeEligibility(formData.dob, formData.division);
      if (!ageCheck.valid) {
        setActiveModalTab("personal");
        setFeedback({
          type: "error",
          message: ageCheck.message,
        });
        return;
      }
    }

    try {
      setFormSubmitting(true);
      const norm = normalizeClassDivision(formData.division);
      const canonDiv = norm ? norm.name : (formData.division || "Class 10-A");
      const submissionData = {
        ...formData,
        division: canonDiv,
        classDivision: canonDiv,
        className: canonDiv,
      };
      if (editingStudent) {
        const res = await api.put(
          `/admin/students/${editingStudent._id}`,
          submissionData
        );
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Updated student ${formData.name}!`,
          });
          setTimeout(() => {
            closeModal();
            fetchStudents();
          }, 800);
        }
      } else {
        const res = await api.post("/admin/students", submissionData);
        if (res.data.success) {
          setFeedback({
            type: "success",
            message: `Student ${formData.name} admitted successfully with Sampoorna ID ${res.data.student?.sampoornaId}!`,
          });
          setTimeout(() => {
            closeModal();
            fetchStudents();
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

  const handleDeleteStudent = async () => {
    if (!editingStudent) return;
    const isConfirmed = await confirm({
      title: "Move Student to Recycle Bin?",
      message: `Are you sure you want to move ${editingStudent.name} to the Recycle Bin (soft delete)?`,
      subMessage: "You can restore this student record anytime from the Recycle Bin.",
      confirmText: "Move to Recycle Bin",
      cancelText: "Keep Student",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      setFormSubmitting(true);
      const res = await api.delete(`/admin/students/${editingStudent._id}`);
      if (res.data.success) {
        closeModal();
        fetchStudents();
        setFeedback({
          type: "success",
          message:
            res.data.message ||
            `Student ${editingStudent.name} moved to trash (soft-deleted). You can restore it from the Recycle Bin.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to delete student.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  return {
    isModalOpen,
    editingStudent,
    activeModalTab,
    setActiveModalTab,
    formData,
    formSubmitting,
    uploadingIdProof,
    uploadingBcProof,
    isEmailVerified,
    setIsEmailVerified,
    openNewAdmissionModal,
    openEditModal,
    closeModal,
    handleFormChange,
    handleFileUpload,
    handleRemoveUploadedFile,
    handleFormSubmit,
    handleDeleteStudent,
  };
}
