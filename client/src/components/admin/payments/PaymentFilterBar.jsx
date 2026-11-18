export default function PaymentFilterBar({
  searchQuery,
  setSearchQuery,
  selectedWing,
  setSelectedWing,
  selectedCategory,
  setSelectedCategory,
  selectedDivision,
  setSelectedDivision,
  selectedStatus,
  setSelectedStatus,
  academicWings,
  setCurrentPage,
}) {
  return (
    <div className="payment-controls-card">
      {/* Search Input */}
      <div className="search-field-box">
        <span className="search-icon"></span>
        <input
          type="text"
          placeholder="Search by Student Name, Admission No, Receipt #, or UPI ref..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Wing Selector */}
      <div className="filter-dropdown-group">
        <label>Wing:</label>
        <select
          value={selectedWing}
          onChange={(e) => {
            setSelectedWing(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Wings</option>
          <option value="LP School">Lower Primary (LP)</option>
          <option value="UP School">Upper Primary (UP)</option>
          <option value="High School">High School (HS)</option>
          <option value="Higher Secondary">Higher Secondary (HSS)</option>
        </select>
      </div>

      {/* Fee Category Selector */}
      <div className="filter-dropdown-group">
        <label>Fee Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Categories</option>
          <option value="Bus Fee">Bus Fee (School Transport)</option>
          <option value="Annual Fee">Annual Composite Tuition</option>
          <option value="PTA Fund">PTA Welfare &amp; Development</option>
          <option value="Lab &amp; Computer Fee">IT Lab &amp; Science Practicals</option>
          <option value="Special / Exam Fee">Special / Examination Fee</option>
          <option value="Sports &amp; Library">Sports &amp; Library Club</option>
        </select>
      </div>

      {/* Class / Division Selector */}
      <div className="filter-dropdown-group">
        <label>Division:</label>
        <select
          value={selectedDivision}
          onChange={(e) => {
            setSelectedDivision(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Divisions</option>
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
      </div>

      {/* Status Filter Buttons */}
      <div className="payment-status-pills">
        {["All", "Paid", "Partial", "Pending"].map((st) => (
          <button
            key={st}
            className={`status-pill-btn ${selectedStatus === st ? "active" : ""} ${st.toLowerCase()}`}
            onClick={() => {
              setSelectedStatus(st);
              setCurrentPage(1);
            }}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );
}
