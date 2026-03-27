import React, { forwardRef } from "react";
import { User, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Custom Input for DatePicker
const CustomDobInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <button
        type="button"
        onClick={onClick}
        ref={ref}
        className={`w-full text-left bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors flex items-center justify-between group h-[50px] ${!value ? 'text-[#9ca3af]' : 'text-[#111827]'}`}
    >
        <span className="truncate">{value || placeholder}</span>
        <Calendar size={18} className="text-[#9ca3af] group-hover:text-[#4b5563] transition-colors shrink-0" />
    </button>
));

const PersonalDetails = ({ formData, handleChange, setFormData, countryCode, setCountryCode }) => {
    return (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#0f4c3a]/5">
            <div className="flex items-center gap-3 mb-6 border-b border-[#0f4c3a]/10 pb-4">
                <div className="p-2 bg-[#0f4c3a]/5 rounded-lg text-[#111827]"><User size={20} /></div>
                <h2 className="font-serif text-xl">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">First Name</label>
                    <input
                        type="text" name="firstName" required
                        value={formData.firstName || ""}
                        className="w-full bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
                        onChange={handleChange}
                    />
                </div>
                <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">Last Name</label>
                    <input
                        type="text" name="lastName" required
                        value={formData.lastName || ""}
                        className="w-full bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
                        onChange={handleChange}
                    />
                </div>
                <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">Date of Birth</label>
                    <DatePicker
                        selected={formData.dob ? new Date(formData.dob) : null}
                        onChange={(date) => setFormData(prev => ({ ...prev, dob: date ? date.toISOString().split('T')[0] : "" }))}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                        customInput={<CustomDobInput placeholder="Select Date of Birth" />}
                        wrapperClassName="w-full"
                        required
                    />
                </div>
                <div className="md:col-span-8 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">Phone Number</label>
                    <div className="flex gap-2">
                        <div className="relative shrink-0">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="appearance-none bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl pl-4 pr-8 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827] text-sm h-full font-medium"
                            >
                                <option value="+49">🇩🇪 +49</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+33">🇫🇷 +33</option>
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+86">🇨🇳 +86</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#9ca3af]">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                        <input
                            type="tel" name="phone" required
                            value={formData.phone || ""}
                            className="flex-1 bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors min-w-0"
                            onChange={handleChange}
                            placeholder="123 456 7890"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PersonalDetails;
