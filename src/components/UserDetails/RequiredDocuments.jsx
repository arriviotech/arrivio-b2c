import React from "react";
import { Upload, Camera, ShieldCheck, Info } from "lucide-react";

const EU_NATIONALITIES = [
  "German", "Austrian", "Swiss", "Dutch", "French", "British", "Spanish", "Italian",
  "Belgian", "Polish", "Czech", "Danish", "Swedish", "Norwegian", "Finnish", "Irish",
  "Portuguese", "Greek", "Hungarian", "Romanian",
];

const RequiredDocuments = ({ documents, handleFileChange, onStartCamera, nationality }) => {
  const isEU = EU_NATIONALITIES.includes(nationality);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

  const DocRow = ({ docKey, label, desc, required, tag, tooltip }) => {
    const file = documents[docKey];
    const uploaded = !!file;
    const fileSize = file?.size ? formatFileSize(file.size) : '';

    return (
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#4b5563] flex items-center gap-1.5">
          {label} {required && <span className="text-[#EA4335]">*</span>}
          {tag && <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${tag === 'Required' ? 'bg-[#EA4335]/10 text-[#EA4335]' : 'bg-[#D4A017]/10 text-[#D4A017]'}`}>{tag}</span>}
          {tooltip && (
            <div className="relative group/doctip">
              <Info size={10} className="text-[#9ca3af]" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/doctip:block z-50">
                <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
                  {tooltip}
                </div>
              </div>
            </div>
          )}
        </label>
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
              <p className={`text-xs font-semibold ${uploaded ? 'text-[#22C55E]' : 'text-[#111827]'}`}>
                {uploaded ? 'Uploaded' : desc}
              </p>
              {uploaded && (
                <p className="text-[9px] text-[#9ca3af] truncate">
                  {file?.name || 'File uploaded'}{fileSize ? ` · ${fileSize}` : ''}
                </p>
              )}
            </div>
          </div>
          <span className={`text-[10px] font-bold shrink-0 ${uploaded ? 'text-[#22C55E]' : 'text-[#0f4c3a]'}`}>
            {uploaded ? 'Change' : 'Upload'}
          </span>
        </label>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={16} className="text-[#0f4c3a]" />
        <h3 className="text-sm font-bold text-[#111827]">Identity & Documents</h3>
      </div>
      <p className="text-[10px] text-[#9ca3af] mb-4">
        {isEU
          ? 'Upload your passport or national ID. Accepted: PDF, JPG, PNG.'
          : 'Upload your passport and visa/residence permit. Accepted: PDF, JPG, PNG.'}
        {' '}Max 5MB per file.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Required: ID Document */}
        <DocRow
          docKey="passport"
          label={isEU ? "Passport / ID" : "Passport"}
          desc={isEU ? "Passport or Personalausweis" : "Passport first page"}
          required
        />

        {/* Visa — required for non-EU, Selfie for EU */}
        {!isEU ? (
          <DocRow
            docKey="visa"
            label="Visa / Permit"
            desc="Valid visa or Aufenthaltstitel"
            required
          />
        ) : (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#4b5563]">
              Selfie <span className="text-[#EA4335]">*</span>
            </label>
            <div
              onClick={onStartCamera}
              className={`flex items-center justify-between px-3.5 py-3 rounded-lg border transition-colors cursor-pointer ${
                documents.selfie ? 'border-[#22C55E]/30 bg-[#22C55E]/5' : 'border-[#0f4c3a]/10 bg-[#f9f9f7] hover:bg-[#f2f2f2]'
              }`}
            >
              <div className="flex items-center gap-3">
                {documents.selfie ? (
                  <img src={documents.selfie} alt="Selfie" className="w-8 h-8 rounded-full object-cover border-2 border-[#22C55E]/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center">
                    <Camera size={14} className="text-[#9ca3af]" />
                  </div>
                )}
                <p className={`text-xs font-semibold ${documents.selfie ? 'text-[#22C55E]' : 'text-[#111827]'}`}>
                  {documents.selfie ? 'Captured' : 'Take a photo'}
                </p>
              </div>
              <span className={`text-[10px] font-bold shrink-0 ${documents.selfie ? 'text-[#22C55E]' : 'text-[#0f4c3a]'}`}>
                {documents.selfie ? 'Retake' : 'Camera'}
              </span>
            </div>
          </div>
        )}

        {/* Selfie for non-EU (separate row) */}
        {!isEU && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#4b5563]">
              Selfie <span className="text-[#EA4335]">*</span>
            </label>
            <div
              onClick={onStartCamera}
              className={`flex items-center justify-between px-3.5 py-3 rounded-lg border transition-colors cursor-pointer ${
                documents.selfie ? 'border-[#22C55E]/30 bg-[#22C55E]/5' : 'border-[#0f4c3a]/10 bg-[#f9f9f7] hover:bg-[#f2f2f2]'
              }`}
            >
              <div className="flex items-center gap-3">
                {documents.selfie ? (
                  <img src={documents.selfie} alt="Selfie" className="w-8 h-8 rounded-full object-cover border-2 border-[#22C55E]/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center">
                    <Camera size={14} className="text-[#9ca3af]" />
                  </div>
                )}
                <p className={`text-xs font-semibold ${documents.selfie ? 'text-[#22C55E]' : 'text-[#111827]'}`}>
                  {documents.selfie ? 'Captured' : 'Take a photo'}
                </p>
              </div>
              <span className={`text-[10px] font-bold shrink-0 ${documents.selfie ? 'text-[#22C55E]' : 'text-[#0f4c3a]'}`}>
                {documents.selfie ? 'Retake' : 'Camera'}
              </span>
            </div>
          </div>
        )}

        {/* Recommended docs — same grid, no separate section */}
        <DocRow docKey="govId" label="SCHUFA" desc="Credit report" tag="Recommended" tooltip="Optional but recommended. Having a SCHUFA report speeds up your approval. Don't have one? No problem, we can proceed without it." />
        <DocRow docKey="rentalRef" label="Landlord Ref" desc="Mietschuldenfreiheit" tag="Recommended" tooltip="A reference from your previous landlord confirming no rental debts. Helpful but not required. First-time renters can skip this." />
      </div>
    </div>
  );
};

export default RequiredDocuments;
