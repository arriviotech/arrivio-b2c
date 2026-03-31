import React, { forwardRef, useState } from "react";
import { User, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import VerifyOtpModal from "../common/VerifyOtpModal";

const CustomDobInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className={`w-full text-left bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors flex items-center justify-between ${!value ? 'text-[#9ca3af]' : 'text-[#111827]'}`}
  >
    <span className="truncate">{value || placeholder}</span>
    <Calendar size={15} className="text-[#9ca3af] shrink-0" />
  </button>
));

const VerifiedBadge = () => (
  <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full ml-1">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    Verified
  </span>
);

const VerifyButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-[8px] font-bold text-[#D4A017] bg-[#D4A017]/10 px-1.5 py-0.5 rounded-full ml-1 hover:bg-[#D4A017]/20 transition-colors"
  >
    Verify
  </button>
);

const PersonalDetails = ({ formData, handleChange, setFormData, countryCode, setCountryCode, verifiedFields = {}, onFieldVerified }) => {
  const inputClass = "w-full bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827] placeholder:text-[#9ca3af]";
  const verifiedInputClass = "w-full bg-[#22C55E]/[0.03] border border-[#22C55E]/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#22C55E]/40 transition-colors text-[#111827]";
  const unverifiedInputClass = "w-full bg-[#D4A017]/[0.03] border border-[#D4A017]/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4A017]/30 transition-colors text-[#111827] placeholder:text-[#9ca3af]";

  const [verifyModal, setVerifyModal] = useState(null); // 'email' | 'phone' | null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <User size={16} className="text-[#0f4c3a]" />
        <h3 className="text-sm font-bold text-[#111827]">Personal Information</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">First Name <span className="text-[#EA4335]">*</span></label>
          <input type="text" name="firstName" required value={formData.firstName || ""} onChange={handleChange} className={inputClass} placeholder="John" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Last Name <span className="text-[#EA4335]">*</span></label>
          <input type="text" name="lastName" required value={formData.lastName || ""} onChange={handleChange} className={inputClass} placeholder="Doe" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Date of Birth <span className="text-[#EA4335]">*</span></label>
          <DatePicker
            selected={formData.dob ? new Date(formData.dob) : null}
            onChange={(date) => setFormData(prev => ({ ...prev, dob: date ? date.toISOString().split('T')[0] : "" }))}
            dateFormat="dd/MM/yyyy"
            showYearDropdown showMonthDropdown dropdownMode="select"
            maxDate={new Date()} yearDropdownItemNumber={100} scrollableYearDropdown
            customInput={<CustomDobInput placeholder="DD/MM/YYYY" />}
            wrapperClassName="w-full"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">
            Email <span className="text-[#EA4335]">*</span>
            {verifiedFields.email ? <VerifiedBadge /> : formData.email && <VerifyButton onClick={() => setVerifyModal('email')} />}
          </label>
          <input
            type="email" name="email" required
            value={formData.email || ""} onChange={handleChange}
            className={verifiedFields.email ? verifiedInputClass : formData.email ? unverifiedInputClass : inputClass}
            placeholder="john@example.com"
            readOnly={!!verifiedFields.email}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Who's moving in? <span className="text-[#EA4335]">*</span></label>
          <select name="occupants" required value={formData.occupants || ""} onChange={handleChange} className={`${inputClass} ${!formData.occupants ? 'text-[#9ca3af]' : 'text-[#111827]'}`}>
            <option value="" className="text-[#9ca3af]">Select</option>
            <option value="1" className="text-[#111827]">Just me (1 person)</option>
            <option value="2" className="text-[#111827]">Me + partner (2 people)</option>
            <option value="3" className="text-[#111827]">Me + family (3 people)</option>
            <option value="4" className="text-[#111827]">Sharing (4+ people)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">
            Phone Number <span className="text-[#EA4335]">*</span>
            {verifiedFields.phone ? <VerifiedBadge /> : formData.phone && <VerifyButton onClick={() => setVerifyModal('phone')} />}
          </label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827] font-medium shrink-0"
              disabled={!!verifiedFields.phone}
            >
              <option value="+49">🇩🇪 +49</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+86">🇨🇳 +86</option>
            </select>
            <input
              type="tel" name="phone" required
              value={formData.phone || ""} onChange={handleChange}
              className={`flex-1 ${verifiedFields.phone ? verifiedInputClass : formData.phone ? unverifiedInputClass : inputClass}`}
              placeholder="123 456 7890"
              readOnly={!!verifiedFields.phone}
            />
          </div>
        </div>
      </div>

      {/* Verify OTP Modal */}
      {verifyModal && (
        <VerifyOtpModal
          type={verifyModal}
          value={verifyModal === 'email' ? formData.email : `${countryCode}${formData.phone}`}
          onVerified={() => {
            onFieldVerified?.(verifyModal);
            setVerifyModal(null);
          }}
          onClose={() => setVerifyModal(null)}
        />
      )}
    </div>
  );
};

export default PersonalDetails;
