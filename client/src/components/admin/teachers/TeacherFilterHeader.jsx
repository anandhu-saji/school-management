export default function TeacherFilterHeader({
  searchQuery,
  setSearchQuery,
  selectedDept,
  setSelectedDept,
  setCurrentPage,
  openAddTeacherModal,
}) {
  return (
    <section className="student-header-banner">
      <div className="registry-title-left">
        <div className="registry-icon-badge"></div>
        <div className="registry-title-text">
          <h1>Faculty Directory &amp; Department Roster</h1>
          <p>
            Authorized permanent teaching cadre, PEN allocation,
            statutory ID proofs, and qualification credentials.
          </p>
        </div>
      </div>

      <div className="registry-controls-right">
        {/* Search Box */}
        <div className="search-input-wrapper">
          <span className="search-input-icon"></span>
          <input
            type="text"
            placeholder="Search teacher by name, PEN, Aadhaar..."
            className="registry-search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Department & Wing Filter across all 64 Cadre */}
        <select
          className="registry-select-dropdown"
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Departments &amp; Wings (64 Cadre)</option>
          <optgroup label="Academic Wings">
            <option value="Lower Primary">Lower Primary (LPSA Cadre)</option>
            <option value="Upper Primary">Upper Primary (UPSA Cadre)</option>
            <option value="High School">High School (HST Cadre)</option>
            <option value="Higher Secondary">Higher Secondary (HSST Cadre)</option>
          </optgroup>
          <optgroup label="Subject Specialization">
            <option value="Malayalam">Malayalam</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physical Science">Physical Science</option>
            <option value="Chemistry">Chemistry</option>
            <option value="English">English</option>
            <option value="Social Science">Social Science</option>
            <option value="Commerce">Commerce</option>
            <option value="Natural Science">Natural Science</option>
            <option value="Primary Education">Primary Education</option>
          </optgroup>
        </select>

        {/* Add Teacher Button */}
        <button
          className="btn-new-admission"
          onClick={openAddTeacherModal}
        >
          <span>+</span> Add Teacher
        </button>
      </div>
    </section>
  );
}
