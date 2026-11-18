export default function AddressDetailsTab({ formData, handleFormChange }) {
  return (
    <div>
      <div className="form-section-header">Permanent Residential Address</div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>House Name / Flat No</label>
          <input
            type="text"
            name="houseName"
            placeholder="e.g. Parambil House"
            value={formData.houseName}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Street / Locality</label>
          <input
            type="text"
            name="street"
            placeholder="e.g. Near GHSS Junction"
            value={formData.street}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div className="form-row-grid-3">
        <div className="form-field-group">
          <label>Post Office</label>
          <input
            type="text"
            name="postOffice"
            placeholder="e.g. Rajakkad P.O"
            value={formData.postOffice}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>District</label>
          <select
            name="district"
            value={formData.district}
            onChange={handleFormChange}
          >
            <option value="Idukki">Idukki</option>
            <option value="Ernakulam">Ernakulam</option>
            <option value="Kottayam">Kottayam</option>
            <option value="Thrissur">Thrissur</option>
            <option value="Palakkad">Palakkad</option>
            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
            <option value="Kozhikode">Kozhikode</option>
            <option value="Malappuram">Malappuram</option>
            <option value="Kannur">Kannur</option>
            <option value="Kollam">Kollam</option>
            <option value="Alappuzha">Alappuzha</option>
            <option value="Pathanamthitta">Pathanamthitta</option>
            <option value="Wayanad">Wayanad</option>
            <option value="Kasaragod">Kasaragod</option>
          </select>
        </div>
        <div className="form-field-group">
          <label>PIN Code</label>
          <input
            type="text"
            name="pincode"
            placeholder="685566"
            maxLength="6"
            value={formData.pincode}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div className="form-section-header">
        Previous Education &amp; Transfer Certificate
      </div>

      <div className="form-row-grid-2">
        <div className="form-field-group">
          <label>Previous Institution Attended</label>
          <input
            type="text"
            name="previousSchool"
            placeholder="e.g. St. Mary's High School"
            value={formData.previousSchool}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-field-group">
          <label>Transfer Certificate (TC) Number</label>
          <input
            type="text"
            name="tcNumber"
            placeholder="e.g. TC/2025/482"
            value={formData.tcNumber}
            onChange={handleFormChange}
          />
        </div>
      </div>
    </div>
  );
}
