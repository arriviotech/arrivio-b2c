import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, CheckCircle, Clock, XCircle,
  AlertTriangle, Loader2, Home, Calendar
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMyDocuments, getDocumentUrl, getDocTypeLabel } from "../../supabase/services/documents.service";
import toast from "react-hot-toast";
import DocumentsSkeleton from "../../components/skeletons/DocumentsSkeleton";

const VERIFICATION_STYLES = {
  verified: { icon: CheckCircle, label: "Verified", bg: "bg-[#22C55E]/10", text: "text-[#16a34a]" },
  pending: { icon: Clock, label: "Pending Review", bg: "bg-amber-50", text: "text-amber-500" },
  rejected: { icon: XCircle, label: "Rejected", bg: "bg-red-50", text: "text-[#EA4335]" },
};

const EXPECTED_DOCS = [
  "Passport or National ID",
  "Employment Contract / Enrollment Letter",
  "Visa or Residence Permit",
  "Proof of Income / Financial Support",
];

const Documents = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (!user) return;
    getMyDocuments(user.id)
      .then(setGroups)
      .catch(() => toast.error("Failed to load documents"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDownload = async (doc) => {
    setDownloading(doc.id);
    try {
      const url = await getDocumentUrl(doc.storage_path);
      window.open(url, "_blank");
    } catch {
      toast.error("Failed to generate download link");
    } finally {
      setDownloading(null);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return <DocumentsSkeleton />;
  }

  return (
    <div>
      <h2 className="text-xl font-serif text-[#111827] mb-1">My Documents</h2>
      <p className="text-xs text-[#6b7280] mb-6">Documents uploaded during your applications</p>

      {groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <motion.div
              key={group.applicationId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
            >
              {/* Application Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <Home size={12} className="text-[#9ca3af]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                  {group.propertyName}{group.city ? `, ${group.city}` : ""}
                  {group.unitNumber ? ` · Unit ${group.unitNumber}` : ""}
                </p>
              </div>

              {/* Documents List */}
              <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
                {group.documents.map((doc, di) => {
                  const verStatus = doc.is_verified ? "verified" : doc.rejection_reason ? "rejected" : "pending";
                  const style = VERIFICATION_STYLES[verStatus];
                  const StatusIcon = style.icon;
                  const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date();

                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: di * 0.03 }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[#f7f7f7] transition-colors"
                    >
                      {/* File Icon */}
                      <div className="w-10 h-10 rounded-xl bg-[#f2f2f2] flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-[#374151]" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-[#111827] truncate">{getDocTypeLabel(doc.document_type)}</p>
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${style.bg} ${style.text}`}>
                            <StatusIcon size={9} /> {style.label}
                          </span>
                          {isExpired && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-red-50 text-[#EA4335]">
                              <AlertTriangle size={9} /> Expired
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#9ca3af]">
                          <span className="truncate max-w-[150px]">{doc.file_name}</span>
                          {doc.file_size_bytes && <span>· {formatSize(doc.file_size_bytes)}</span>}
                          <span>· {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          {doc.expires_at && (
                            <span className="flex items-center gap-0.5">
                              <Calendar size={9} /> Expires {new Date(doc.expires_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                        {doc.rejection_reason && (
                          <p className="text-[10px] text-[#EA4335] mt-1">Reason: {doc.rejection_reason}</p>
                        )}
                      </div>

                      {/* Download */}
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={downloading === doc.id}
                        className="w-9 h-9 rounded-xl bg-[#f2f2f2] hover:bg-[#0f4c3a] hover:text-white flex items-center justify-center text-[#374151] transition-colors shrink-0 disabled:opacity-50"
                      >
                        {downloading === doc.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-[#9ca3af]" />
          </div>
          <h3 className="text-sm font-bold text-[#111827] mb-1">No documents yet</h3>
          <p className="text-xs text-[#6b7280] mb-6 max-w-sm mx-auto">
            Documents will appear here once you start an application and upload your files.
          </p>
        </div>
      )}

      {/* Expected Documents Guide */}
      <div className="mt-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2 px-1">Documents You May Need</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {EXPECTED_DOCS.map((doc) => (
            <div key={doc} className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-[#e5e7eb]">
              <div className="w-5 h-5 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center">
                <CheckCircle size={10} className="text-[#9ca3af]" />
              </div>
              <span className="text-xs text-[#6b7280]">{doc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Documents;
