import React from "react";
import { Home } from "lucide-react";

const LifestyleDetails = ({ formData, handleChange }) => {
  const inputClass = "w-full bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827] placeholder:text-[#9ca3af]";
  const selectClass = (value) => `${inputClass} ${!value ? 'text-[#9ca3af]' : 'text-[#111827]'}`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Home size={16} className="text-[#0f4c3a]" />
        <h3 className="text-sm font-bold text-[#111827]">Lifestyle & Preferences</h3>
      </div>
      <p className="text-[10px] text-[#9ca3af] mb-4">Help us match you with the right accommodation</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Do you have pets? <span className="text-[#EA4335]">*</span></label>
          <select name="hasPets" required value={formData.hasPets || ""} onChange={handleChange} className={selectClass(formData.hasPets)}>
            <option value="" className="text-[#9ca3af]">Select</option>
            <option value="no" className="text-[#111827]">No pets</option>
            <option value="cat" className="text-[#111827]">Yes, Cat</option>
            <option value="dog_small" className="text-[#111827]">Yes, Small dog</option>
            <option value="dog_large" className="text-[#111827]">Yes, Large dog</option>
            <option value="other" className="text-[#111827]">Yes, Other</option>
          </select>
        </div>

        {/* Smoking */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Do you smoke? <span className="text-[#EA4335]">*</span></label>
          <select name="smoking" required value={formData.smoking || ""} onChange={handleChange} className={selectClass(formData.smoking)}>
            <option value="" className="text-[#9ca3af]">Select</option>
            <option value="no" className="text-[#111827]">Non-smoker</option>
            <option value="outside" className="text-[#111827]">Only outside / balcony</option>
            <option value="yes" className="text-[#111827]">Yes</option>
          </select>
        </div>

        {/* Parking */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Need parking?</label>
          <select name="needsParking" value={formData.needsParking || ""} onChange={handleChange} className={selectClass(formData.needsParking)}>
            <option value="" className="text-[#9ca3af]">Select (optional)</option>
            <option value="no" className="text-[#111827]">No</option>
            <option value="car" className="text-[#111827]">Yes, Car</option>
            <option value="bike" className="text-[#111827]">Yes, Bike only</option>
            <option value="both" className="text-[#111827]">Yes, Car & Bike</option>
          </select>
        </div>

        {/* Special requirements */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Special requirements</label>
          <select name="specialRequirements" value={formData.specialRequirements || ""} onChange={handleChange} className={selectClass(formData.specialRequirements)}>
            <option value="" className="text-[#9ca3af]">Select (optional)</option>
            <option value="none" className="text-[#111827]">None</option>
            <option value="wheelchair" className="text-[#111827]">Wheelchair accessible</option>
            <option value="ground_floor" className="text-[#111827]">Ground floor preferred</option>
            <option value="elevator" className="text-[#111827]">Elevator required</option>
            <option value="storage" className="text-[#111827]">Extra storage needed</option>
          </select>
        </div>

        {/* Additional notes */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Anything else we should know?</label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes || ""}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Any special requests, dietary needs, or other information (optional)"
          />
        </div>
      </div>
    </div>
  );
};

export default LifestyleDetails;
