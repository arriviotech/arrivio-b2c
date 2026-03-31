import React from "react";
import { Phone } from "lucide-react";

const RELATIONSHIPS = [
  "Parent", "Spouse / Partner", "Sibling", "Friend", "Relative", "Colleague", "Other",
];

const EmergencyContact = ({ formData, handleChange }) => {
  const inputClass = "w-full bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827] placeholder:text-[#9ca3af]";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Phone size={16} className="text-[#0f4c3a]" />
        <h3 className="text-sm font-bold text-[#111827]">Emergency Contact</h3>
      </div>
      <p className="text-[10px] text-[#9ca3af] mb-4">Someone we can reach in case of an emergency (optional)</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Full Name</label>
          <input
            type="text" name="emergencyContactName"
            value={formData.emergencyContactName || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="Contact's full name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Relationship</label>
          <select
            name="emergencyContactRelation"
            value={formData.emergencyContactRelation || ""}
            onChange={handleChange}
            className={`${inputClass} ${!formData.emergencyContactRelation ? 'text-[#9ca3af]' : 'text-[#111827]'}`}
          >
            <option value="" className="text-[#9ca3af]">Select relationship</option>
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r} className="text-[#111827]">{r}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Phone Number</label>
          <input
            type="tel" name="emergencyContactPhone"
            value={formData.emergencyContactPhone || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="+49 123 456 7890"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Email</label>
          <input
            type="email" name="emergencyContactEmail"
            value={formData.emergencyContactEmail || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="contact@example.com"
          />
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;
