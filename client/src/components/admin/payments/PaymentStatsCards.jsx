export default function PaymentStatsCards({ summary, formatINR }) {
  return (
    <>
      {/* ---------------- 5 TOP KPI SUMMARY CARDS ---------------- */}
      <div className="payment-kpi-grid">
        {/* Card 1: Total Collections */}
        <div className="payment-kpi-card total-collection">
          <div className="kpi-icon-row">
            <span className="kpi-label">TOTAL COLLECTIONS</span>
            <span className="kpi-badge rate">{summary.collectionRate} Collected</span>
          </div>
          <div className="kpi-amount">{formatINR(summary.totalCollected)}</div>
          <div className="kpi-subtext">Total Invoiced: {formatINR(summary.totalBilled)}</div>
        </div>

        {/* Card 2: Pending Dues */}
        <div className="payment-kpi-card pending-dues">
          <div className="kpi-icon-row">
            <span className="kpi-label">PENDING STUDENT DUES</span>
            <span className="kpi-badge due">Action Required</span>
          </div>
          <div className="kpi-amount text-red">{formatINR(summary.totalDue)}</div>
          <div className="kpi-subtext">Outstanding fees awaiting settlement</div>
        </div>

        {/* Card 3: Bus Fee Collection */}
        <div className="payment-kpi-card bus-fee">
          <div className="kpi-icon-row">
            <span className="kpi-label">BUS FEE (FLEET 1-5)</span>
            <span className="kpi-badge bus">Transport</span>
          </div>
          <div className="kpi-amount text-blue">{formatINR(summary.busFee?.collected)}</div>
          <div className="kpi-subtext">Pending: {formatINR(summary.busFee?.due)} • 5 Active Routes</div>
        </div>

        {/* Card 4: Annual / Tuition Fee */}
        <div className="payment-kpi-card annual-fee">
          <div className="kpi-icon-row">
            <span className="kpi-label">ANNUAL &amp; TUITION</span>
            <span className="kpi-badge annual">Govt Approved</span>
          </div>
          <div className="kpi-amount text-teal">{formatINR(summary.annualFee?.collected)}</div>
          <div className="kpi-subtext">Pending: {formatINR(summary.annualFee?.due)} • Composite Term</div>
        </div>

        {/* Card 5: PTA Fund */}
        <div className="payment-kpi-card pta-fund">
          <div className="kpi-icon-row">
            <span className="kpi-label">PTA &amp; WELFARE FUND</span>
            <span className="kpi-badge pta">PTA Executive</span>
          </div>
          <div className="kpi-amount text-purple">{formatINR(summary.ptaFund?.collected)}</div>
          <div className="kpi-subtext">Development &amp; Student Welfare Reserve</div>
        </div>
      </div>

      {/* ---------------- 4 WING PROGRESS OVERVIEW ---------------- */}
      <div className="wing-collection-strip">
        {Object.entries(summary.wingStats || {}).map(([wingName, wData]) => {
          const rate = wData.total > 0 ? Math.round((wData.collected / wData.total) * 100) : 0;
          return (
            <div key={wingName} className="wing-progress-pill-card">
              <div className="wing-header-line">
                <span className="wing-pill-title">{wingName}</span>
                <span className="wing-pill-rate">{rate}%</span>
              </div>
              <div className="wing-bar-wrapper">
                <div className="wing-bar-fill" style={{ width: `${rate}%` }}></div>
              </div>
              <div className="wing-footer-line">
                <span>{formatINR(wData.collected)}</span>
                <span className="text-muted">Due: {formatINR(wData.due)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
