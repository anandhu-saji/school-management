export default function StudentFilterBar({
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  selectedDivision,
  setSelectedDivision,
  academicWings,
  openNewAdmissionModal,
}) {
  return (
    <section className="registry-controls-banner">
      <div className="registry-controls-left">
        <div className="registry-title-text">
          <h1>Student Admission &amp; Academic Registry</h1>
          <p>
            Official Kerala Sampoorna student database with digital ID proof
            verification (Images &amp; PDFs).
          </p>
        </div>
      </div>

      <div className="registry-controls-right">
        {/* Search Box */}
        <div className="search-input-wrapper">
          <span className="search-input-icon"></span>
          <input
            type="text"
            placeholder="Name, Roll No, Adm No, Aadhaar, Sampoorna ID..."
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

        {/* Division Select */}
        <select
          className="registry-select-dropdown"
          value={selectedDivision}
          onChange={(e) => {
            setSelectedDivision(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Academic Divisions</option>
          {academicWings.map((wing) => (
            <optgroup key={wing.code} label={wing.wing}>
              {wing.classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.stream})
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* New Admission Button */}
        <button
          className="btn-new-admission"
          onClick={openNewAdmissionModal}
        >
          <span>+</span> New Admission
        </button>
      </div>
    </section>
  );
}
