export default function ExamFilterHeader({
  searchQuery,
  setSearchQuery,
  selectedTerm,
  setSelectedTerm,
  selectedStandard,
  setSelectedStandard,
  setCurrentPage,
  openAddExamModal,
}) {
  return (
    <section className="student-header-banner">
      <div className="registry-title-left">
        <div className="registry-icon-badge"></div>
        <div className="registry-title-text">
          <h1>Examination Timetable &amp; Seating Registry</h1>
          <p>
            Official Kerala General Education Board terminal examination
            schedules, question paper codes, hall allotments &amp;
            invigilation rosters.
          </p>
        </div>
      </div>

      <div className="registry-controls-right">
        {/* Search Box */}
        <div className="search-input-wrapper">
          <span className="search-input-icon"></span>
          <input
            type="text"
            placeholder="Search subject, QP code, hall..."
            className="registry-search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Term Filter */}
        <select
          className="registry-select-dropdown"
          value={selectedTerm}
          onChange={(e) => {
            setSelectedTerm(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Examination Terms</option>
          <option value="SSLC Board Examination">
            SSLC Board Examination (2026-2027)
          </option>
          <option value="Plus Two Higher Secondary">
            Plus Two Higher Secondary (2026-2027)
          </option>
          <option value="High School Annual">
            High School Annual Evaluation (8 &amp; 9)
          </option>
          <option value="Primary Evaluation">
            Primary Evaluation (LP &amp; UP)
          </option>
        </select>

        {/* Standard & Academic Wing Filter across Classes 1 to 12 */}
        <select
          className="registry-select-dropdown"
          value={selectedStandard}
          onChange={(e) => {
            setSelectedStandard(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Standards &amp; Wings (Classes 1 to 12)</option>
          <optgroup label="High School (Classes 8 to 10)">
            <option value="Standard 10">Standard 10 (SSLC Cadre)</option>
            <option value="Standard 9">Standard 9</option>
            <option value="Standard 8">Standard 8</option>
          </optgroup>
          <optgroup label="Higher Secondary (Classes 11 & 12)">
            <option value="Standard 12">Standard 12 (Plus Two Higher Secondary)</option>
            <option value="Standard 11">Standard 11 (Plus One Board Evaluation)</option>
          </optgroup>
          <optgroup label="Upper Primary (Classes 5 to 7)">
            <option value="Standard 7">Class 7 (UP Evaluation)</option>
            <option value="Standard 6">Class 6 (UP Evaluation)</option>
            <option value="Standard 5">Class 5 (UP Evaluation)</option>
          </optgroup>
          <optgroup label="Lower Primary (Classes 1 to 4)">
            <option value="Standard 4">Class 4 (LP Primary Evaluation)</option>
            <option value="Standard 3">Class 3 (LP Primary Evaluation)</option>
            <option value="Standard 2">Class 2 (LP Primary Evaluation)</option>
            <option value="Standard 1">Class 1 (LP Primary Evaluation)</option>
          </optgroup>
        </select>

        {/* Add Exam Schedule Button */}
        <button
          className="btn-new-admission"
          onClick={openAddExamModal}
        >
          <span>+</span> Schedule Exam
        </button>
      </div>
    </section>
  );
}
