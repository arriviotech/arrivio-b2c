import React from "react";
import { Upload, Check, Camera } from "lucide-react";

const RequiredDocuments = ({ documents, handleFileChange, onStartCamera }) => {
    return (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#0f4c3a]/5">
            <div className="flex items-center gap-3 mb-6 border-b border-[#0f4c3a]/10 pb-4">
                <div className="p-2 bg-[#0f4c3a]/5 rounded-lg text-[#111827]"><Upload size={20} /></div>
                <h2 className="font-serif text-xl">Required Documents</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PASSPORT */}
                <label className={`border-2 border-dashed ${documents.passport ? 'border-green-500 bg-green-50' : 'border-[#0f4c3a]/10 hover:bg-[#f0f0f0]/30'} rounded-xl p-8 text-center transition-colors cursor-pointer group relative overflow-hidden`}>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'passport')} />
                    <div className={`w-12 h-12 ${documents.passport ? 'bg-green-100' : 'bg-[#0f4c3a]/5'} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0f4c3a]/10 transition-colors`}>
                        {documents.passport ? <Check size={20} className="text-green-600" /> : <Upload size={20} className="text-[#4b5563]" />}
                    </div>
                    <p className="font-bold text-sm text-[#111827]">{documents.passport ? "Passport Uploaded" : "Passport"}</p>
                    <p className="text-xs text-[#6b7280] mt-1">{documents.passport ? documents.passport.name : "First Page (PDF/JPG)"}</p>
                </label>

                {/* VISA */}
                <label className={`border-2 border-dashed ${documents.visa ? 'border-green-500 bg-green-50' : 'border-[#0f4c3a]/10 hover:bg-[#f0f0f0]/30'} rounded-xl p-8 text-center transition-colors cursor-pointer group relative overflow-hidden`}>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'visa')} />
                    <div className={`w-12 h-12 ${documents.visa ? 'bg-green-100' : 'bg-[#0f4c3a]/5'} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0f4c3a]/10 transition-colors`}>
                        {documents.visa ? <Check size={20} className="text-green-600" /> : <Upload size={20} className="text-[#4b5563]" />}
                    </div>
                    <p className="font-bold text-sm text-[#111827]">{documents.visa ? "Visa Uploaded" : "Visa"}</p>
                    <p className="text-xs text-[#6b7280] mt-1">{documents.visa ? documents.visa.name : "Valid Visa/Permit"}</p>
                </label>

                {/* GOVERNMENT ID */}
                <label className={`border-2 border-dashed ${documents.govId ? 'border-green-500 bg-green-50' : 'border-[#0f4c3a]/10 hover:bg-[#f0f0f0]/30'} rounded-xl p-8 text-center transition-colors cursor-pointer group relative overflow-hidden`}>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'govId')} />
                    <div className={`w-12 h-12 ${documents.govId ? 'bg-green-100' : 'bg-[#0f4c3a]/5'} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0f4c3a]/10 transition-colors`}>
                        {documents.govId ? <Check size={20} className="text-green-600" /> : <Upload size={20} className="text-[#4b5563]" />}
                    </div>
                    <p className="font-bold text-sm text-[#111827]">{documents.govId ? "ID Uploaded" : "Government ID"}</p>
                    <p className="text-xs text-[#6b7280] mt-1">{documents.govId ? documents.govId.name : "National ID"}</p>
                </label>

                {/* SELFIE */}
                <div onClick={onStartCamera} className={`border-2 border-dashed ${documents.selfie ? 'border-green-500 bg-green-50' : 'border-[#0f4c3a]/10 hover:bg-[#f0f0f0]/30'} rounded-xl p-8 text-center transition-colors cursor-pointer group relative overflow-hidden`}>
                    {documents.selfie ? (
                        <>
                            <img src={documents.selfie} alt="Selfie" className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-white shadow-sm" />
                            <p className="font-bold text-sm text-[#111827]">Selfie Captured</p>
                            <p className="text-xs text-[#6b7280] mt-1">Click to retake</p>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-[#0f4c3a]/5 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0f4c3a]/10 transition-colors">
                                <Camera size={20} className="text-[#4b5563]" />
                            </div>
                            <p className="font-bold text-sm text-[#111827]">Selfie</p>
                            <p className="text-xs text-[#6b7280] mt-1">Take a photo now</p>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RequiredDocuments;
