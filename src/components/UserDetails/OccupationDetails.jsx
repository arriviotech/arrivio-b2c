import React from "react";
import { Briefcase, Upload } from "lucide-react";

const NATIONALITIES = [
  "American", "Australian", "Austrian", "Bangladeshi", "Belgian", "Brazilian",
  "British", "Canadian", "Chinese", "Czech", "Danish", "Dutch", "Egyptian",
  "Finnish", "French", "German", "Greek", "Hungarian", "Indian", "Irish",
  "Italian", "Japanese", "Kenyan", "Korean", "Nigerian", "Norwegian", "Pakistani",
  "Polish", "Portuguese", "Romanian", "South African", "Spanish", "Swedish",
  "Swiss", "Turkish", "Other",
];

const OccupationDetails = ({ formData, handleChange, documents, handleFileChange, monthlyRent = 0 }) => {
  const inputClass = "w-full bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827] placeholder:text-[#9ca3af]";

  const selectClass = (value) => `${inputClass} ${!value ? 'text-[#9ca3af]' : 'text-[#111827]'}`;

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleValidatedUpload = (e, docKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large (${formatFileSize(file.size)}). Maximum size is 5MB.`);
      e.target.value = '';
      return;
    }
    handleFileChange(e, docKey);
  };

  const FileUploadRow = ({ docKey, desc }) => {
    const file = documents[docKey];
    const uploaded = !!file;
    const fileSize = file?.size ? formatFileSize(file.size) : '';
    return (
      <label className={`flex items-center justify-between px-3.5 py-3 rounded-lg border transition-colors cursor-pointer ${
        uploaded ? 'border-[#22C55E]/30 bg-[#22C55E]/5' : 'border-[#0f4c3a]/10 bg-[#f9f9f7] hover:bg-[#f2f2f2]'
      }`}>
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleValidatedUpload(e, docKey)} />
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${uploaded ? 'bg-[#22C55E]/10' : 'bg-[#0f4c3a]/5'}`}>
            {uploaded ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <Upload size={14} className="text-[#9ca3af]" />
            )}
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-semibold ${uploaded ? 'text-[#22C55E]' : 'text-[#111827]'}`}>{uploaded ? 'Uploaded' : desc}</p>
            {uploaded && (
              <p className="text-[9px] text-[#9ca3af] truncate">
                {file?.name || 'File uploaded'}{fileSize ? ` · ${fileSize}` : ''}
              </p>
            )}
            {!uploaded && <p className="text-[9px] text-[#9ca3af]">PDF, JPG, PNG · Max 5MB</p>}
          </div>
        </div>
        <span className={`text-[10px] font-bold shrink-0 ${uploaded ? 'text-[#22C55E]' : 'text-[#0f4c3a]'}`}>
          {uploaded ? 'Change' : 'Upload'}
        </span>
      </label>
    );
  };

  const moveReasons = formData.occupation === 'study'
    ? [
        { value: "new_study", label: "Starting studies" },
        { value: "exchange", label: "Exchange / Erasmus semester" },
        { value: "relocation", label: "Relocating to the city" },
        { value: "internship", label: "Internship" },
        { value: "other", label: "Other" },
      ]
    : formData.occupation === 'azubi'
    ? [
        { value: "new_ausbildung", label: "Starting Ausbildung" },
        { value: "relocation", label: "Relocating to the city" },
        { value: "other", label: "Other" },
      ]
    : [
        { value: "new_job", label: "Starting a new job" },
        { value: "relocation", label: "Relocating to the city" },
        { value: "transfer", label: "Company transfer" },
        { value: "internship", label: "Internship / Training" },
        { value: "other", label: "Other" },
      ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Briefcase size={16} className="text-[#0f4c3a]" />
        <h3 className="text-sm font-bold text-[#111827]">Occupation & Background</h3>
      </div>
      <p className="text-[10px] text-[#9ca3af] mb-4">Tell us about your work or study situation</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nationality */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Nationality <span className="text-[#EA4335]">*</span></label>
          <select name="nationality" required value={formData.nationality || ""} onChange={handleChange} className={selectClass(formData.nationality)}>
            <option value="" className="text-[#9ca3af]">Select nationality</option>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n} className="text-[#111827]">{n}</option>
            ))}
          </select>
        </div>

        {/* Status selector — dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">I am currently <span className="text-[#EA4335]">*</span></label>
          <select name="occupation" required value={formData.occupation || ""} onChange={handleChange} className={selectClass(formData.occupation)}>
            <option value="" className="text-[#9ca3af]">Select status</option>
            <option value="work" className="text-[#111827]">Working / Employed</option>
            <option value="azubi" className="text-[#111827]">Azubi / Ausbildung</option>
            <option value="study" className="text-[#111827]">Studying / Student</option>
          </select>
        </div>

        {/* Work fields */}
        {formData.occupation === 'work' && (
          <>
            {/* Row 1: Employer + Job Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Employer / Company <span className="text-[#EA4335]">*</span></label>
              <input type="text" name="employer" required value={formData.employer || ""} onChange={handleChange} className={inputClass} placeholder="Company Name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Job Title <span className="text-[#EA4335]">*</span></label>
              <input type="text" name="jobTitle" required value={formData.jobTitle || ""} onChange={handleChange} className={inputClass} placeholder="Position" />
            </div>
            {/* Row 2: Status + Income */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Employment Status <span className="text-[#EA4335]">*</span></label>
              <select name="employmentStatus" value={formData.employmentStatus || ""} onChange={handleChange} className={selectClass(formData.employmentStatus)} required>
                <option value="" className="text-[#9ca3af]">Select status</option>
                <option value="Full-time employed" className="text-[#111827]">Full-time employed</option>
                <option value="Part-time employed" className="text-[#111827]">Part-time employed</option>
                <option value="Self-employed / Freelancer" className="text-[#111827]">Self-employed / Freelancer</option>
                <option value="Starting new job" className="text-[#111827]">Starting new job (with offer letter)</option>
                <option value="Probation period" className="text-[#111827]">Probation period</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Monthly Income (€) <span className="text-[#EA4335]">*</span></label>
              <input type="number" name="income" required value={formData.income || ""} onChange={handleChange} className={inputClass} placeholder="e.g. 2500" />
            </div>
          </>
        )}

        {/* Azubi fields */}
        {formData.occupation === 'azubi' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Training Company <span className="text-[#EA4335]">*</span></label>
              <input type="text" name="employer" required value={formData.employer || ""} onChange={handleChange} className={inputClass} placeholder="Company Name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Training Role <span className="text-[#EA4335]">*</span></label>
              <input type="text" name="jobTitle" required value={formData.jobTitle || ""} onChange={handleChange} className={inputClass} placeholder="e.g. IT-Systemkaufmann" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Ausbildung Year <span className="text-[#EA4335]">*</span></label>
              <select name="employmentStatus" value={formData.employmentStatus || ""} onChange={handleChange} className={selectClass(formData.employmentStatus)} required>
                <option value="" className="text-[#9ca3af]">Select year</option>
                <option value="1st Year" className="text-[#111827]">1st Year</option>
                <option value="2nd Year" className="text-[#111827]">2nd Year</option>
                <option value="3rd Year" className="text-[#111827]">3rd Year</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Monthly Stipend (€) <span className="text-[#EA4335]">*</span></label>
              <input type="number" name="income" required value={formData.income || ""} onChange={handleChange} className={inputClass} placeholder="e.g. 800" />
            </div>
          </>
        )}

        {/* Study fields */}
        {formData.occupation === 'study' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">University <span className="text-[#EA4335]">*</span></label>
              <input type="text" name="university" required value={formData.university || ""} onChange={handleChange} className={inputClass} placeholder="University Name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Course / Program <span className="text-[#EA4335]">*</span></label>
              <input type="text" name="course" required value={formData.course || ""} onChange={handleChange} className={inputClass} placeholder="e.g. Computer Science" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Student Status <span className="text-[#EA4335]">*</span></label>
              <select name="employmentStatus" value={formData.employmentStatus || ""} onChange={handleChange} className={selectClass(formData.employmentStatus)} required>
                <option value="" className="text-[#9ca3af]">Select status</option>
                <option value="Full-time student" className="text-[#111827]">Full-time student</option>
                <option value="Part-time student (working)" className="text-[#111827]">Part-time student (working alongside)</option>
                <option value="Exchange / Erasmus" className="text-[#111827]">Exchange / Erasmus student</option>
                <option value="PhD / Research" className="text-[#111827]">PhD / Research</option>
                <option value="Scholarship holder" className="text-[#111827]">Scholarship holder</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#4b5563]">Monthly Budget (€) <span className="text-[#EA4335]">*</span></label>
              <input type="number" name="income" required value={formData.income || ""} onChange={handleChange} className={inputClass} placeholder="e.g. 1200" />
            </div>
          </>
        )}

        {/* Rent-to-income ratio — shows after income is entered */}
        {formData.income && monthlyRent > 0 && (() => {
          const ratio = Math.round((monthlyRent / Number(formData.income)) * 100);
          const isGood = ratio <= 33;
          const isModerate = ratio > 33 && ratio <= 50;
          return (
            <div className="sm:col-span-2">
              <div className={`rounded-lg px-4 py-3 border ${
                isGood ? 'bg-[#22C55E]/5 border-[#22C55E]/20' : isModerate ? 'bg-[#D4A017]/5 border-[#D4A017]/20' : 'bg-[#EA4335]/5 border-[#EA4335]/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-[11px] font-semibold ${isGood ? 'text-[#22C55E]' : isModerate ? 'text-[#D4A017]' : 'text-[#EA4335]'}`}>
                    {ratio}% of your income goes to rent
                  </p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isGood ? 'bg-[#22C55E]/10 text-[#22C55E]' : isModerate ? 'bg-[#D4A017]/10 text-[#D4A017]' : 'bg-[#EA4335]/10 text-[#EA4335]'
                  }`}>
                    {isGood ? 'Good' : isModerate ? 'Moderate' : 'High'}
                  </span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all ${isGood ? 'bg-[#22C55E]' : isModerate ? 'bg-[#D4A017]' : 'bg-[#EA4335]'}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between text-[9px] text-[#6b7280]">
                  <span>€{monthlyRent.toLocaleString()} rent / €{Number(formData.income).toLocaleString()} income</span>
                  <span>{isGood ? 'Recommended: below 33%' : isModerate ? 'Aim for below 33%' : 'Should be below 33%'}</span>
                </div>
                {!isGood && (
                  <p className={`text-[9px] mt-2 ${isModerate ? 'text-[#D4A017]' : 'text-[#EA4335]'}`}>
                    {isModerate
                      ? 'Slightly above the recommended range, but your application can still be approved.'
                      : `For this unit, we recommend a minimum income of €${Math.ceil(monthlyRent / 0.33).toLocaleString()} to keep rent within 33% of your earnings.`}
                  </p>
                )}
              </div>
              {ratio > 40 && (
                <div className="mt-2 bg-[#EA4335]/5 border border-[#EA4335]/15 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-[#EA4335] font-semibold mb-2">Your rent is above 40% of your income. You can add a guarantor to strengthen your application.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#EA4335]/70">Guarantor name</label>
                      <input type="text" name="guarantorName" value={formData.guarantorName || ""} onChange={handleChange}
                        className="w-full bg-white border border-[#EA4335]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#EA4335]/30 text-[#111827] placeholder:text-[#9ca3af]"
                        placeholder="Full name (optional)" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#EA4335]/70">Guarantor phone</label>
                      <input type="tel" name="guarantorPhone" value={formData.guarantorPhone || ""} onChange={handleChange}
                        className="w-full bg-white border border-[#EA4335]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#EA4335]/30 text-[#111827] placeholder:text-[#9ca3af]"
                        placeholder="Phone number (optional)" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Proof document — full width */}
        {formData.occupation === 'work' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#4b5563]">Proof of employment <span className="text-[#EA4335]">*</span></label>
            <FileUploadRow docKey="workDocument" desc="Contract, offer letter, or payslips" />
          </div>
        )}
        {formData.occupation === 'azubi' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#4b5563]">Training Contract <span className="text-[#EA4335]">*</span></label>
            <FileUploadRow docKey="workDocument" desc="Ausbildungsvertrag or stipend proof" />
          </div>
        )}
        {formData.occupation === 'study' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#4b5563]">Admission letter <span className="text-[#EA4335]">*</span></label>
            <FileUploadRow docKey="admissionLetter" desc="Enrollment or admission letter" />
          </div>
        )}

        {/* Reason for move */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Reason for moving <span className="text-[#EA4335]">*</span></label>
          <select name="moveReason" value={formData.moveReason || ""} onChange={handleChange} className={selectClass(formData.moveReason)} required>
            <option value="" className="text-[#9ca3af]">Select reason</option>
            {moveReasons.map((r) => (
              <option key={r.value} value={r.value} className="text-[#111827]">{r.label}</option>
            ))}
          </select>
        </div>

        {/* How did you hear */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">How did you hear about us?</label>
          <select name="referralSource" value={formData.referralSource || ""} onChange={handleChange} className={selectClass(formData.referralSource)}>
            <option value="" className="text-[#9ca3af]">Select (optional)</option>
            <option value="google" className="text-[#111827]">Google search</option>
            <option value="social_media" className="text-[#111827]">Social media</option>
            <option value="friend" className="text-[#111827]">Friend / Word of mouth</option>
            <option value="university" className="text-[#111827]">University / Institution</option>
            <option value="employer" className="text-[#111827]">Employer referral</option>
            <option value="other" className="text-[#111827]">Other</option>
          </select>
        </div>

        {/* Language preference */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Preferred Language</label>
          <select name="language" value={formData.language || ""} onChange={handleChange} className={selectClass(formData.language)}>
            <option value="" className="text-[#9ca3af]">Select (optional)</option>
            <option value="en" className="text-[#111827]">English</option>
            <option value="de" className="text-[#111827]">Deutsch</option>
            <option value="fr" className="text-[#111827]">Français</option>
            <option value="es" className="text-[#111827]">Español</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OccupationDetails;
