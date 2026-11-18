import { ALL_CLASSES } from "../../utils/classData.js";

export const generateStudentDocuments = ({ studentUserId, hssStudentUserId }) => {
  const sampleKeralaNames = [
    { name: "Aaditya S. Kumar", g: "Male", cat: "General", dob: "14/05/2010", p: "Santhosh Kumar K." },
    { name: "Ananya Manoj", g: "Female", cat: "OBC", dob: "22/08/2010", p: "Manoj Varghese" },
    { name: "Devanand P. B.", g: "Male", cat: "SC", dob: "11/01/2010", p: "Balakrishnan P." },
    { name: "Fathima Nizar", g: "Female", cat: "OEC", dob: "03/12/2009", p: "Nizar Rawther" },
    { name: "Gopika Krishna", g: "Female", cat: "General", dob: "18/07/2010", p: "Radhakrishnan P." },
    { name: "Harikrishnan M.", g: "Male", cat: "OBC", dob: "09/03/2010", p: "Muraleedharan V." },
    { name: "Irfan Habeeb", g: "Male", cat: "General", dob: "25/11/2010", p: "Habeeb Rahman" },
    { name: "Kavya Rajesh", g: "Female", cat: "OBC", dob: "14/06/2010", p: "Rajesh Kumar" },
    { name: "Muhammed Bilal", g: "Male", cat: "OEC", dob: "29/09/2010", p: "Shajahan E." },
    { name: "Nandana Suresh", g: "Female", cat: "General", dob: "05/02/2010", p: "Suresh Babu" },
    { name: "Pranav P.", g: "Male", cat: "General", dob: "19/04/2010", p: "Pradeep Kumar" },
    { name: "Rithika Nair", g: "Female", cat: "General", dob: "30/10/2010", p: "Vijayan Nair" },
    { name: "Rohit R. Chandran", g: "Male", cat: "SC", dob: "12/08/2010", p: "Ramachandran K." },
    { name: "Sneha Santhosh", g: "Female", cat: "OBC", dob: "07/01/2010", p: "Santhosh M." },
    { name: "Vaishnav V.", g: "Male", cat: "General", dob: "15/09/2010", p: "Venugopal K." },
  ];

  const allStudentsToInsert = [];
  let globalRollIndex = 1;

  ALL_CLASSES.forEach((cls) => {
    const clsName = cls.name; // e.g. "Class 10-A"
    const clsCode = cls.id;   // e.g. "10-A"

    // 15 Students per division
    sampleKeralaNames.forEach((item, rIdx) => {
      const roll = rIdx + 1;
      const isStudentTestUser = clsCode === "10-A" && item.name === "Aaditya S. Kumar";
      const studentName = isStudentTestUser ? "Anandhu Saji" : item.name;

      const admNo = `ADM-${clsCode.replace(/[^a-zA-Z0-9]/g, "")}-${100 + roll}`;
      const smpId = `SMP-06042-${clsCode.replace(/[^a-zA-Z0-9]/g, "")}-${200 + roll}`;

      const doc = {
        rollNumber: roll,
        name: studentName,
        gender: item.g,
        category: item.cat,
        dob: item.dob,
        bloodGroup: roll % 4 === 0 ? "A+" : roll % 4 === 1 ? "B+" : roll % 4 === 2 ? "O+" : "AB+",
        religion: "Hindu",
        caste: item.cat,
        admissionNumber: admNo,
        studentId: admNo,
        sampoornaId: smpId,
        classDivision: clsName,
        className: clsName,
        division: clsCode,
        overallAttendance: (95 + ((roll * 2) % 5)).toFixed(1) + "%",
        parentContact: `+91 94471 ${String(10000 + (globalRollIndex % 90000))}`,
        fatherName: item.p,
        motherName: `Smt. ${item.p.split(" ")[0]}a Devi`,
        guardian: item.p,
        guardianRelation: "Father",
        aadhaarNumber: `7845 ${String(1000 + (globalRollIndex % 9000))} ${String(5000 + (globalRollIndex % 5000))}`,
        birthCertificateNumber: `KL-IDK-2024-${String(10000 + globalRollIndex)}`,
        address: {
          houseName: `${item.p.split(" ")[0]} Nivas`,
          street: "Post Office Road",
          postOffice: "Rajakkad P.O",
          city: "Rajakkad",
          district: "Idukki",
          state: "Kerala",
          pincode: "685566",
        },
        fullAddress: `${item.p.split(" ")[0]} Nivas, Post Office Road, Rajakkad P.O, Idukki, Kerala - 685566`,
        previousSchool: "Government Lower/Upper Primary School",
        tcNumber: `TC-${5000 + globalRollIndex}`,
        identificationMarks: "A small mole on the right cheek",
        monthlyLeavesTaken: roll % 5 === 0 ? 1 : 0,
      };

      if (isStudentTestUser) {
        doc.userId = studentUserId;
        doc.email = "student@ghss.edu";
      }
      if (clsCode === "12-Science" && roll === 1) {
        doc.userId = hssStudentUserId;
        doc.email = "hss_student@ghss.edu";
      }

      allStudentsToInsert.push(doc);
      globalRollIndex++;
    });
  });

  return allStudentsToInsert;
};
