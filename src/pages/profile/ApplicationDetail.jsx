import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, CreditCard, FileText, Clock, Home, ArrowLeft,
  CheckCircle, XCircle, User, Briefcase, Phone, Mail, Globe, ShieldCheck,
  ClipboardList, PenTool, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext";
import OptimizedImage from "../../components/common/OptimizedImage";
import { THUMBNAIL_SIZES } from "../../utils/imageUtils";
import SEO from "../../components/common/SEO";

const STATUS_CONFIG = {
  pending_payment: { label: "Pending Payment", color: "text-amber-500", bg: "bg-amber-50", icon: CreditCard, desc: "Complete your holding deposit to proceed." },
  pending_profile: { label: "Application Incomplete", color: "text-amber-500", bg: "bg-amber-50", icon: ClipboardList, desc: "Fill out your application form to continue." },
  pending_signature: { label: "Pending Signature", color: "text-amber-500", bg: "bg-amber-50", icon: PenTool, desc: "Sign your lease agreement to proceed." },
  pending_approval: { label: "Under Review", color: "text-blue-500", bg: "bg-blue-50", icon: Clock, desc: "Your application is being reviewed by our team. We'll notify you once a decision is made." },
  under_review: { label: "Under Review", color: "text-blue-500", bg: "bg-blue-50", icon: Clock, desc: "Your application is being reviewed by our team. We'll notify you once a decision is made." },
  approved: { label: "Approved", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", icon: CheckCircle, desc: "Congratulations! Your application has been approved." },
  rejected: { label: "Rejected", color: "text-[#EA4335]", bg: "bg-red-50", icon: XCircle, desc: "Unfortunately your application was not approved." },
  withdrawn: { label: "Withdrawn", color: "text-[#6b7280]", bg: "bg-[#f2f2f2]", icon: AlertCircle, desc: "You withdrew this application." },
  cancelled: { label: "Cancelled", color: "text-[#6b7280]", bg: "bg-[#f2f2f2]", icon: XCircle, desc: "This application was cancelled." },
};

const STEP_ITEMS = [
  { key: "pending_payment", label: "Pay", icon: CreditCard },
  { key: "pending_profile", label: "Apply", icon: ClipboardList },
  { key: "pending_signature", label: "Sign", icon: PenTool },
  { key: "under_review", label: "Review", icon: Clock },
  { key: "approved", label: "Move in", icon: Home },
];

const STEP_KEYS = STEP_ITEMS.map(s => s.key);

const ApplicationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const fetch = async () => {
      const [{ data: appData }, { data: profileData }] = await Promise.all([
        supabase
          .from("applications")
          .select(`*, units!unit_id (
            unit_number, unit_type, slug, property_id,
            unit_pricing_rules ( monthly_rent_cents ),
            properties ( name, slug, city, district, address_line1,
              property_photos ( storage_path, is_primary, display_order )
            )
          )`)
          .eq("id", id)
          .eq("profile_id", user.id)
          .single(),
        supabase
          .from("application_profiles")
          .select("*")
          .eq("application_id", id)
          .maybeSingle(),
      ]);
      setApp(appData);
      setProfile(profileData);
      setLoading(false);
    };
    fetch();
  }, [user, id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#e5e7eb] rounded-lg" />
        <div className="h-48 bg-[#e5e7eb] rounded-2xl" />
        <div className="h-32 bg-[#e5e7eb] rounded-2xl" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-serif text-[#111827] mb-2">Application not found</h2>
        <button onClick={() => navigate("/profile/applications")} className="text-sm text-[#0f4c3a] font-bold hover:underline">Back to Applications</button>
      </div>
    );
  }

  const unit = app.units || {};
  const property = unit.properties || {};
  const photos = (property.property_photos || []).sort((a, b) => a.display_order - b.display_order);
  const coverImage = photos.find(p => p.is_primary)?.storage_path || photos[0]?.storage_path;
  const rent = unit.unit_pricing_rules?.[0]?.monthly_rent_cents;
  const statusKey = app.status === "pending_approval" ? "under_review" : app.status;
  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.under_review;
  const StatusIcon = status.icon;
  const idx = STEP_KEYS.indexOf(statusKey);
  const isActive = ["pending_payment", "pending_profile", "pending_signature", "pending_approval", "under_review"].includes(app.status);

  const handleContinue = () => {
    const appState = {
      applicationId: app.id,
      propertyId: property.id,
      unitId: unit.id || app.unit_id,
      title: `${property.name}. ${unit.unit_type?.replace(/_/g, " ")}`,
      propertyName: property.name,
      unitNumber: unit.unit_number,
      unitType: unit.unit_type,
      city: property.city,
      checkIn: app.move_in_date,
      checkOut: app.move_out_date,
      monthlyTotal: rent ? Math.round(rent / 100) : 0,
    };
    if (app.status === "pending_payment") navigate("/booking/review", { state: appState });
    else if (app.status === "pending_profile") navigate("/application/details", { state: appState });
    else if (app.status === "pending_signature") navigate("/application/details", { state: appState });
  };

  return (
    <div className="space-y-5">
      <SEO title="Application Details" path={`/profile/applications/${id}`} />

      {/* Back */}
      <button onClick={() => navigate("/profile/applications")} className="flex items-center gap-2 text-[#4b5563] hover:text-[#111827] transition-colors group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Applications</span>
      </button>

      {/* Status Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-5 md:p-6 ${status.bg} border-transparent`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${app.status === "approved" ? "bg-[#22C55E]/20" : app.status === "rejected" ? "bg-[#EA4335]/10" : "bg-white/60"}`}>
            <StatusIcon size={20} className={status.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold uppercase tracking-widest ${status.color}`}>{status.label}</p>
            <p className="text-xs text-[#374151] mt-1 leading-relaxed">{status.desc}</p>
            {app.rejection_reason && (
              <p className="text-xs text-[#EA4335] mt-2 font-medium">Reason: {app.rejection_reason}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Property Card */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="flex gap-4 p-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#f2f2f2]">
            {coverImage && <OptimizedImage src={coverImage} alt={property.name} width={80} sizes={THUMBNAIL_SIZES} className="w-full h-full" imgClassName="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg text-[#111827] truncate">{property.name}</h3>
            <p className="text-xs text-[#6b7280] mt-0.5">
              {unit.unit_type?.replace(/_/g, " ")}{unit.unit_number ? ` · Unit ${unit.unit_number}` : ""}{property.city ? ` · ${property.city}` : ""}
            </p>
            {property.address_line1 && (
              <p className="text-[10px] text-[#9ca3af] flex items-center gap-1 mt-1">
                <MapPin size={10} /> {property.address_line1}
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-[#6b7280]">
                <Calendar size={11} className="text-[#9ca3af]" />
                {app.move_in_date ? (
                  <span className="font-medium text-[#111827]">
                    {new Date(app.move_in_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} → {new Date(app.move_out_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                ) : <span>Dates TBD</span>}
              </div>
              {rent && <span className="text-base font-bold text-[#111827]" style={{ fontVariantNumeric: "lining-nums" }}>€{Math.round(rent / 100)}/mo</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {isActive && idx >= 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-4">Progress</p>
          <div className="flex items-center">
            {STEP_ITEMS.map((step, i) => {
              const isComplete = i < idx;
              const isCurrent = i === idx;
              const Icon = step.icon;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isComplete ? "bg-[#22C55E]" : isCurrent ? "bg-[#0f4c3a]" : "bg-[#f2f2f2]"}`}>
                      {isComplete ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <Icon size={14} className={isCurrent ? "text-white" : "text-[#9ca3af]"} />
                      )}
                    </div>
                    <p className={`text-[8px] font-bold ${isCurrent ? "text-[#0f4c3a]" : isComplete ? "text-[#22C55E]" : "text-[#9ca3af]"}`}>{step.label}</p>
                  </div>
                  {i < STEP_ITEMS.length - 1 && (
                    <div className={`flex-1 h-[2px] -mt-4 mx-1 ${isComplete ? "bg-[#22C55E]" : "bg-[#e5e7eb]"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Application Details (if profile exists) */}
      {profile && (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <div className="p-5 border-b border-[#f2f2f2]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Submitted Information</p>
          </div>

          {/* Personal */}
          <DetailSection title="Personal Details" icon={User}>
            <DetailRow label="Full Name" value={`${profile.first_name || ""} ${profile.last_name || ""}`.trim()} />
            <DetailRow label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null} />
            <DetailRow label="Nationality" value={profile.nationality} />
            <DetailRow label="Email" value={profile.email} icon={profile.email_verified ? <ShieldCheck size={12} className="text-[#22C55E]" /> : null} />
            <DetailRow label="Phone" value={profile.phone} icon={profile.phone_verified ? <ShieldCheck size={12} className="text-[#22C55E]" /> : null} />
          </DetailSection>

          {/* Address */}
          {(profile.street || profile.city) && (
            <DetailSection title="Current Address" icon={MapPin}>
              <DetailRow label="Street" value={[profile.street, profile.apartment].filter(Boolean).join(", ")} />
              <DetailRow label="City" value={[profile.zip, profile.city, profile.district].filter(Boolean).join(", ")} />
              <DetailRow label="Country" value={profile.country} />
            </DetailSection>
          )}

          {/* Occupation */}
          {(profile.occupation_type || profile.employer || profile.university) && (
            <DetailSection title="Occupation" icon={Briefcase}>
              <DetailRow label="Type" value={profile.occupation_type?.replace(/_/g, " ")} />
              {profile.employer && <DetailRow label="Employer" value={profile.employer} />}
              {profile.job_title && <DetailRow label="Job Title" value={profile.job_title} />}
              {profile.university && <DetailRow label="University" value={profile.university} />}
              {profile.course && <DetailRow label="Course" value={profile.course} />}
              {profile.income && <DetailRow label="Monthly Income" value={`€${Number(profile.income).toLocaleString()}`} />}
            </DetailSection>
          )}

          {/* Emergency Contact */}
          {profile.emergency_name && (
            <DetailSection title="Emergency Contact" icon={Phone}>
              <DetailRow label="Name" value={profile.emergency_name} />
              <DetailRow label="Relation" value={profile.emergency_relation} />
              <DetailRow label="Phone" value={profile.emergency_phone} />
              {profile.emergency_email && <DetailRow label="Email" value={profile.emergency_email} />}
            </DetailSection>
          )}

          {/* Lifestyle */}
          {(app.has_pets !== null || app.smoking !== null || app.needs_parking !== null) && (
            <DetailSection title="Lifestyle" icon={Globe}>
              <DetailRow label="Pets" value={app.has_pets ? "Yes" : "No"} />
              <DetailRow label="Smoking" value={app.smoking ? "Yes" : "No"} />
              <DetailRow label="Parking" value={app.needs_parking ? "Yes" : "No"} />
              {app.move_reason && <DetailRow label="Reason for Move" value={app.move_reason} />}
              {app.special_requirements && <DetailRow label="Special Requirements" value={app.special_requirements} />}
            </DetailSection>
          )}
        </div>
      )}

      {/* Application Meta */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Application Info</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest">Applied</p>
            <p className="text-xs font-medium text-[#111827]">{new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest">Application ID</p>
            <p className="text-xs font-mono text-[#6b7280]">{app.id.slice(0, 8).toUpperCase()}</p>
          </div>
          {app.tenant_type && (
            <div>
              <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest">Applicant Type</p>
              <p className="text-xs font-medium text-[#111827] capitalize">{app.tenant_type}</p>
            </div>
          )}
          {app.occupants && (
            <div>
              <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest">Occupants</p>
              <p className="text-xs font-medium text-[#111827]">{app.occupants}</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA (for incomplete applications) */}
      {["pending_payment", "pending_profile", "pending_signature"].includes(app.status) && (
        <button onClick={handleContinue} className="w-full py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors">
          {app.status === "pending_payment" ? "Continue to Payment" :
           app.status === "pending_profile" ? "Complete Application" : "Sign Lease"}
        </button>
      )}
    </div>
  );
};

// ── Sub-components ──

const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="px-5 py-4 border-b border-[#f2f2f2] last:border-b-0">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-[#0f4c3a]" />
      <p className="text-xs font-bold text-[#111827]">{title}</p>
    </div>
    <div className="space-y-2 pl-6">{children}</div>
  </div>
);

const DetailRow = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-[10px] text-[#9ca3af] uppercase tracking-widest shrink-0">{label}</p>
      <p className="text-xs text-[#374151] text-right flex items-center gap-1">
        {value} {icon}
      </p>
    </div>
  );
};

export default ApplicationDetail;
