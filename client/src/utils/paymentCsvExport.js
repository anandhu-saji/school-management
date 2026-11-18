/**
 * Export fee payments ledger to CSV
 */
export async function exportPaymentLedgerCsv(payments, customAlert) {
  if (!payments || payments.length === 0) {
    if (customAlert) {
      await customAlert("No payment records available to export.", {
        title: "Export Notice",
        type: "warning",
      });
    }
    return;
  }

  const headers = [
    "Receipt Number",
    "Date",
    "Student Name",
    "Admission Number",
    "Class Division",
    "Wing",
    "Fee Category",
    "Term",
    "Total Amount",
    "Amount Paid",
    "Due Amount",
    "Payment Mode",
    "Transaction Ref",
    "Status",
  ];

  const rows = payments.map((p) => [
    `"${p.receiptNumber}"`,
    `"${p.paymentDate}"`,
    `"${p.studentName}"`,
    `"${p.admissionNumber}"`,
    `"${p.classDivision}"`,
    `"${p.wing}"`,
    `"${p.feeCategory}"`,
    `"${p.term}"`,
    p.totalAmount,
    p.amountPaid,
    p.dueAmount,
    `"${p.paymentMode}"`,
    `"${p.transactionReference || ""}"`,
    `"${p.status}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `GHSS_Fee_Ledger_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
