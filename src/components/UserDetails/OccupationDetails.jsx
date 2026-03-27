import React from "react";
import { Briefcase, Check, Upload } from "lucide-react";

const OccupationDetails = ({ formData, handleChange, documents, handleFileChange }) => {
    return (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#0f4c3a]/5">
            <div className="flex items-center gap-3 mb-6 border-b border-[#0f4c3a]/10 pb-4">
                <div className="p-2 bg-[#0f4c3a]/5 rounded-lg text-[#111827]"><Briefcase size={20} /></div>
                <h2 className="font-serif text-xl">Occupation & Activity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OCCUPATION SELECTOR */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">Current Status</label>
                    <select
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="w-full bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827] font-medium"
                    >
                        <option value="work">Start Work / Employed</option>
                        <option value="study">Study / Student</option>
                    </select>
                </div>

                {/* CONDITIONAL FIELDS: WORK */}
                {formData.occupation === 'work' && (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">Employer / Company</label>
                            <input
                                type="text" name="employer" required
                                value={formData.employer || ""}
                                className="w-full bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
                                onChange={handleChange}
                                placeholder="Company Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">Job Title</label>
                            <input
                                type="text" name="jobTitle" required
                                value={formData.jobTitle || ""}
                                className="w-full bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
                                onChange={handleChange}
                                placeholder="Position"
                            />
                        </div>
                    </>
                )}

                {/* CONDITIONAL FIELDS: STUDY */}
                {formData.occupation === 'study' && (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">University / Institution</label>
                            <input
                                type="text" name="university" required
                                value={formData.university || ""}
                                className="w-full bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
                                onChange={handleChange}
                                placeholder="University Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">Course / Program</label>
                            <input
                                type="text" name="course" required
                                value={formData.course || ""}
                                className="w-full bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
                                onChange={handleChange}
                                placeholder="e.g. Computer Science"
                            />
                        </div>
                    </>
                )}

                {/* SHARED INCOME FIELD REPLACED BY DOCUMENTS */}
                {formData.occupation === 'work' && (
                    <label className={`border-2 border-dashed ${documents.workDocument ? 'border-green-500 bg-green-50' : 'border-[#0f4c3a]/10 hover:bg-[#f0f0f0]/30'} rounded-xl p-4 text-center transition-colors cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center`}>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'workDocument')} />
                        <div className={`w-10 h-10 ${documents.workDocument ? 'bg-green-100' : 'bg-[#0f4c3a]/5'} rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0f4c3a]/10 transition-colors`}>
                            {documents.workDocument ? <Check size={18} className="text-green-600" /> : <Upload size={18} className="text-[#4b5563]" />}
                        </div>
                        <p className="font-bold text-xs text-[#111827]">{documents.workDocument ? "Uploaded" : "Work Document"}</p>
                    </label>
                )}

                {formData.occupation === 'study' && (
                    <label className={`border-2 border-dashed ${documents.admissionLetter ? 'border-green-500 bg-green-50' : 'border-[#0f4c3a]/10 hover:bg-[#f0f0f0]/30'} rounded-xl p-4 text-center transition-colors cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center`}>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'admissionLetter')} />
                        <div className={`w-10 h-10 ${documents.admissionLetter ? 'bg-green-100' : 'bg-[#0f4c3a]/5'} rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0f4c3a]/10 transition-colors`}>
                            {documents.admissionLetter ? <Check size={18} className="text-green-600" /> : <Upload size={18} className="text-[#4b5563]" />}
                        </div>
                        <p className="font-bold text-xs text-[#111827]">{documents.admissionLetter ? "Uploaded" : "Admission Letter"}</p>
                    </label>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4b5563]">
                        {formData.occupation === 'study' ? 'Study Status' : 'Employment Status'}
                    </label>
                    <select
                        name="employmentStatus"
                        value={formData.employmentStatus || ""}
                        onChange={handleChange}
                        className="w-full bg-[#f0f0f0]/70 border border-[#0f4c3a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827]"
                    >
                        {formData.occupation === 'work' ? (
                            <>
                                <option value="">Select status</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Self-employed">Self-employed</option>
                                <option value="Freelancer">Freelancer</option>
                                <option value="Intern">Intern</option>
                            </>
                        ) : (
                            <>
                                <option value="">Select status</option>
                                <option value="Full-time Student">Full-time Student</option>
                                <option value="Part-time Student">Part-time Student</option>
                                <option value="Exchange Student">Exchange Student</option>
                                <option value="Research Scholar">Research Scholar</option>
                                <option value="Intern">Intern</option>
                            </>
                        )}
                    </select>
                </div>
            </div>
        </section>
    );
};

export default OccupationDetails;
