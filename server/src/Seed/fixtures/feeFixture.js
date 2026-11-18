export const generateFeeDocuments = (insertedStudents) => {
  const feeTemplates = [
    { feeCategory: "Bus Fee", totalAmount: 4500, term: "Monthly Bus Pass", remarks: "School Bus Route 03 - Rajakkad Town to Kallar" },
    { feeCategory: "Annual Fee", totalAmount: 6800, term: "Annual", remarks: "Composite Academic & Amenities Fee 2026-27" },
    { feeCategory: "PTA Fund", totalAmount: 1500, term: "Annual", remarks: "Parent-Teacher Association Development Fund" },
    { feeCategory: "Bus Fee", totalAmount: 4800, term: "Monthly Bus Pass", remarks: "School Bus Route 01 - Ponmudi & Bisonvalley" },
    { feeCategory: "Lab & Computer Fee", totalAmount: 2200, term: "Term 1", remarks: "High-Tech Computer Lab & Smart Classroom Charge" },
    { feeCategory: "Special / Exam Fee", totalAmount: 1200, term: "Term 1", remarks: "SCERT Model & Board Examination Fee" },
    { feeCategory: "Sports & Library", totalAmount: 850, term: "Annual", remarks: "Sports Equipment & Library Lending Card" },
    { feeCategory: "PTA Fund", totalAmount: 1500, term: "Annual", remarks: "General Education Protection Mission Support" },
  ];

  const paymentModes = [
    "Razorpay / Online",
    "UPI / Online (Google Pay / PhonePe)",
    "Net Banking",
    "Cash at School Counter",
    "Bank Challan (SBT/SBI)",
  ];

  const feeDocsToInsert = [];
  let receiptCounter = 1100;

  // 4a. Pin-to-pin curated fee ledger for student@ghss.edu (Anandhu Saji)
  const anandhuStudent = insertedStudents.find(
    (s) => s.email === "student@ghss.edu" || s.name === "Anandhu Saji"
  );
  if (anandhuStudent) {
    feeDocsToInsert.push(
      {
        receiptNumber: "REC-2026-1041",
        studentId: anandhuStudent._id,
        studentName: anandhuStudent.name,
        admissionNumber: anandhuStudent.admissionNumber,
        classDivision: anandhuStudent.classDivision,
        wing: "High School",
        feeCategory: "Annual Fee",
        term: "Annual",
        totalAmount: 6800,
        amountPaid: 6800,
        dueAmount: 0,
        paymentDate: "2026-10-12",
        paymentMode: "Razorpay / Online",
        transactionReference: "rzp_pay_942001A",
        razorpayOrderId: "order_mock_seed_101",
        razorpayPaymentId: "pay_mock_seed_101",
        razorpaySignature: "sig_mock_seed_101",
        status: "Paid",
        collectedBy: "Razorpay Payment Gateway",
        remarks: "Composite Academic & Amenities Annual Fee 2026-27",
      },
      {
        receiptNumber: "REC-2026-1042",
        studentId: anandhuStudent._id,
        studentName: anandhuStudent.name,
        admissionNumber: anandhuStudent.admissionNumber,
        classDivision: anandhuStudent.classDivision,
        wing: "High School",
        feeCategory: "Bus Fee",
        term: "Monthly Bus Pass",
        totalAmount: 1800,
        amountPaid: 1800,
        dueAmount: 0,
        paymentDate: "2026-10-15",
        paymentMode: "UPI / Online (Google Pay / PhonePe)",
        transactionReference: "UPI/629041043",
        status: "Paid",
        collectedBy: "Accounts Desk / Sri. R. Krishnan",
        remarks: "School Bus Route 03 - Rajakkad to Kallar • Month of October",
      },
      {
        receiptNumber: "REC-2026-1043",
        studentId: anandhuStudent._id,
        studentName: anandhuStudent.name,
        admissionNumber: anandhuStudent.admissionNumber,
        classDivision: anandhuStudent.classDivision,
        wing: "High School",
        feeCategory: "Special / Exam Fee",
        term: "Term 1",
        totalAmount: 1200,
        amountPaid: 600,
        dueAmount: 600,
        paymentDate: "2026-10-18",
        paymentMode: "Cash at School Counter",
        transactionReference: "COUNTER-CASH-1003",
        status: "Partial",
        collectedBy: "Accounts Desk / Sri. R. Krishnan",
        remarks: "First installment for SCERT Model & Board Exam clearance",
      },
      {
        receiptNumber: "REC-2026-1044",
        studentId: anandhuStudent._id,
        studentName: anandhuStudent.name,
        admissionNumber: anandhuStudent.admissionNumber,
        classDivision: anandhuStudent.classDivision,
        wing: "High School",
        feeCategory: "Lab & Computer Fee",
        term: "Term 1",
        totalAmount: 2200,
        amountPaid: 0,
        dueAmount: 2200,
        paymentDate: "2026-11-01",
        paymentMode: "Razorpay / Online",
        transactionReference: "PENDING_ONLINE_PAYMENT",
        status: "Partial",
        collectedBy: "Pending Online Clearance",
        remarks: "High-Tech Computer Lab & Smart Classroom Charge",
      },
      {
        receiptNumber: "REC-2026-1045",
        studentId: anandhuStudent._id,
        studentName: anandhuStudent.name,
        admissionNumber: anandhuStudent.admissionNumber,
        classDivision: anandhuStudent.classDivision,
        wing: "High School",
        feeCategory: "PTA Fund",
        term: "Annual",
        totalAmount: 1500,
        amountPaid: 0,
        dueAmount: 1500,
        paymentDate: "2026-11-05",
        paymentMode: "Cash at School Counter",
        transactionReference: "UNPAID_COUNTER",
        status: "Partial",
        collectedBy: "Pending School Office Clearance",
        remarks: "Parent-Teacher Association Development Fund",
      }
    );
  }

  // 4b. Seed fees for additional students across all 26 classes
  const selectedFeeStudents = insertedStudents
    .filter((s) => s.email !== "student@ghss.edu")
    .slice(0, 50);

  selectedFeeStudents.forEach((s, idx) => {
    const template1 = feeTemplates[idx % feeTemplates.length];
    const template2 = feeTemplates[(idx + 2) % feeTemplates.length];
    const items = [template1, template2];

    items.forEach((tmpl, iIdx) => {
      receiptCounter++;
      const isPaid = (idx + iIdx) % 4 !== 0;
      const amountPaid = isPaid ? tmpl.totalAmount : Math.round(tmpl.totalAmount * 0.5);
      const dueAmount = tmpl.totalAmount - amountPaid;
      const status = dueAmount === 0 ? "Paid" : "Partial";

      let wing = "High School";
      const divLower = (s.classDivision || "").toLowerCase();
      if (divLower.includes("11") || divLower.includes("12") || divLower.includes("science") || divLower.includes("commerce")) {
        wing = "Higher Secondary";
      } else if (divLower.includes("5") || divLower.includes("6") || divLower.includes("7")) {
        wing = "UP School";
      } else if (divLower.includes("1") || divLower.includes("2") || divLower.includes("3") || divLower.includes("4")) {
        wing = "LP School";
      }

      const mode = paymentModes[(idx + iIdx) % paymentModes.length];
      const isRazorpay = mode === "Razorpay / Online";

      feeDocsToInsert.push({
        receiptNumber: `REC-2026-${receiptCounter}`,
        studentId: s._id,
        studentName: s.name,
        admissionNumber: s.admissionNumber,
        classDivision: s.classDivision,
        wing,
        feeCategory: tmpl.feeCategory,
        term: tmpl.term,
        totalAmount: tmpl.totalAmount,
        amountPaid,
        dueAmount,
        paymentDate: `2026-10-${String(10 + (idx % 18)).padStart(2, "0")}`,
        paymentMode: mode,
        transactionReference: isRazorpay
          ? `rzp_pay_${receiptCounter}KL`
          : (idx + iIdx) % 2 === 0
          ? `UPI/${629000000 + receiptCounter}`
          : `COUNTER-CASH-${receiptCounter}`,
        razorpayOrderId: isRazorpay ? `order_RP2026_${receiptCounter}` : undefined,
        razorpayPaymentId: isRazorpay ? `pay_RP2026_${receiptCounter}` : undefined,
        razorpaySignature: isRazorpay ? `sig_RP2026_${receiptCounter}` : undefined,
        status,
        collectedBy: isRazorpay ? "Razorpay Online Gateway" : "Accounts Desk / Sri. R. Krishnan",
        remarks: tmpl.remarks,
      });
    });
  });

  return feeDocsToInsert;
};
