import { supabase } from "../client";

const DOC_TYPE_LABELS = {
  passport: "Passport",
  national_id: "National ID",
  residence_permit: "Residence Permit",
  employment_contract: "Employment Contract",
  payslip: "Payslip",
  work_visa: "Work Visa",
  ausbildungsvertrag: "Apprenticeship Contract",
  azubi_stipend_proof: "Azubi Stipend Proof",
  student_visa: "Student Visa",
  enrollment_letter: "University Enrollment Letter",
  financial_support_proof: "Financial Support Proof",
};

export function getDocTypeLabel(type) {
  return DOC_TYPE_LABELS[type] || type;
}

export async function getMyDocuments(userId) {
  // Fetch all applications for this user, then their documents
  const { data: applications, error: appErr } = await supabase
    .from("applications")
    .select("id, status, units!unit_id ( unit_number, unit_type, properties ( name, city ) )")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  if (appErr) throw appErr;
  if (!applications?.length) return [];

  const appIds = applications.map(a => a.id);

  const { data: docs, error: docErr } = await supabase
    .from("application_documents")
    .select("id, application_id, document_type, storage_path, file_name, file_size_bytes, mime_type, is_verified, rejection_reason, expires_at, created_at")
    .in("application_id", appIds)
    .order("created_at", { ascending: false });

  if (docErr) throw docErr;

  // Group docs by application with property info
  const appMap = {};
  for (const app of applications) {
    appMap[app.id] = {
      applicationId: app.id,
      status: app.status,
      propertyName: app.units?.properties?.name || "Unknown Property",
      city: app.units?.properties?.city || "",
      unitNumber: app.units?.unit_number || "",
      unitType: app.units?.unit_type || "",
      documents: [],
    };
  }

  for (const doc of docs || []) {
    if (appMap[doc.application_id]) {
      appMap[doc.application_id].documents.push(doc);
    }
  }

  // Return only applications that have documents
  return Object.values(appMap).filter(a => a.documents.length > 0);
}

export async function getDocumentUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from("tenant-documents")
    .createSignedUrl(storagePath, 300); // 5 min expiry

  if (error) throw error;
  return data.signedUrl;
}
