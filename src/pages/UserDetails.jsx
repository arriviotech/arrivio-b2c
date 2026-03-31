import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Clock, Check, PartyPopper, Bookmark, Loader2, Info, ArrowRight, CloudUpload } from "lucide-react";

import PersonalDetails from "../components/UserDetails/PersonalDetails";
import AddressDetails from "../components/UserDetails/AddressDetails";
import OccupationDetails from "../components/UserDetails/OccupationDetails";
import RequiredDocuments from "../components/UserDetails/RequiredDocuments";
import CameraModal from "../components/UserDetails/CameraModal";
import EmergencyContact from "../components/UserDetails/EmergencyContact";
import LifestyleDetails from "../components/UserDetails/LifestyleDetails";
import BookingStepper from "../components/booking/BookingStepper";
import { useAuth } from "../context/AuthContext";
import { calculateDuration } from "../utils/dateUtils";
import { supabase } from "../supabase/client";
import api from "../api/client";

const DOCUMENT_TYPE_MAP = {
  passport: 'passport',
  visa: 'residence_permit',
  govId: 'national_id',
  workDocument: 'employment_contract',
  admissionLetter: 'enrollment_letter',
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const UserDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const bookingData = state || JSON.parse(localStorage.getItem("current_application")) || {};

  // Save booking data to localStorage whenever we have state
  useEffect(() => {
    if (state?.applicationId) {
      localStorage.setItem("current_application", JSON.stringify(state));
    }
  }, [state]);

  // Extract name parts from auth user
  const authName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const authNameParts = authName.split(" ");
  const authFirstName = authNameParts[0] || "";
  const authLastName = authNameParts.slice(1).join(" ") || "";

  const [documents, setDocuments] = useState({
    passport: null, visa: null, govId: null, selfie: null, workDocument: null, admissionLetter: null, rentalRef: null
  });

  const [showCamera, setShowCamera] = useState(false);
  const [modal, setModal] = useState(null);

  const [formData, setFormData] = useState({
    firstName: authFirstName, lastName: authLastName,
    dob: "", email: user?.email || "", phone: user?.phone || "", occupants: "",
    currentAddress: "", apartment: "", city: "", cityOther: "", zipCode: "", country: "", district: "", nationality: "",
    occupation: "work", employer: "", jobTitle: "", university: "", course: "",
    employmentStatus: "", income: "", moveReason: "", referralSource: "", language: "",
    hasPets: "", smoking: "", needsParking: "", specialRequirements: "", additionalNotes: "",
    guarantorName: "", guarantorPhone: "",
    emergencyContactName: "", emergencyContactRelation: "", emergencyContactPhone: "", emergencyContactEmail: "",
  });

  const [countryCode, setCountryCode] = useState("+49");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved'
  const [showValidation, setShowValidation] = useState(false); // only show after first submit attempt
  const [verifiedFields, setVerifiedFields] = useState({ email: false, phone: false });

  const DRAFT_KEY = `draft_application_v2_${bookingData.title || 'generic'}`;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startDateObj = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
  const endDateObj = bookingData.checkOut ? new Date(bookingData.checkOut) : null;
  const duration = calculateDuration(bookingData.checkIn, bookingData.checkOut);
  const monthlyRent = parseFloat(bookingData.monthlyTotal) || 0;
  const holdingDeposit = Number(bookingData.holdingDeposit) || 150;
  const deposit = Number(bookingData.deposit) || 0;

  // Fetch profile from DB, then apply draft on top
  useEffect(() => {
    const loadData = async () => {
      let dbData = {};

      // 1. Fetch profile from DB first
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            const nameParts = (profile.full_name || "").split(" ");

            // Parse phone + country code from profile
            const CODES = ["+49", "+91", "+44", "+33", "+86", "+1"];
            let profilePhone = profile.phone || "";
            let profileCode = "+49";
            if (profilePhone && profilePhone.startsWith("+")) {
              const matched = CODES.find(code => profilePhone.startsWith(code));
              if (matched) {
                profileCode = matched;
                profilePhone = profilePhone.slice(matched.length).trim();
              }
            }

            // Profile data — these are the source of truth for personal info
            dbData = {
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              email: profile.email || "",
              phone: profilePhone,
              dob: profile.date_of_birth || "",
              nationality: profile.nationality || "",
            };

            // Set country code from profile
            if (profile.phone) setCountryCode(profileCode);

            setVerifiedFields({
              email: !!user?.email_confirmed_at || !!user?.user_metadata?.email_verified,
              phone: !!profile.phone_verified,
            });
          }
        } catch (e) { console.error("Failed to fetch profile", e); }

        // Find applicationId — from state, localStorage, or latest in DB
        let appId = bookingData.applicationId;
        if (!appId && user?.id) {
          const { data: latestApp } = await supabase
            .from('applications')
            .select('id')
            .eq('profile_id', user.id)
            .in('status', ['pending_profile', 'pending_signature'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (latestApp) appId = latestApp.id;
        }

        // Also fetch from application_profiles if exists
        if (appId) {
          try {
            const { data: appProfile } = await supabase
              .from('application_profiles')
              .select('*')
              .eq('application_id', appId)
              .maybeSingle();

            if (appProfile) {
              // Only fill non-personal fields from application_profiles
              // Personal fields come from profiles table (source of truth)
              dbData = {
                ...dbData,
                currentAddress: appProfile.street_address || dbData.currentAddress || "",
                apartment: appProfile.apartment || dbData.apartment || "",
                city: appProfile.city || dbData.city || "",
                zipCode: appProfile.zip_code || dbData.zipCode || "",
                district: appProfile.district || dbData.district || "",
                country: appProfile.country || dbData.country || "",
                occupation: appProfile.occupation_type || dbData.occupation || "work",
                employer: appProfile.employer || dbData.employer || "",
                jobTitle: appProfile.job_title || dbData.jobTitle || "",
                university: appProfile.university || dbData.university || "",
                course: appProfile.course || dbData.course || "",
                employmentStatus: appProfile.employment_status || dbData.employmentStatus || "",
                income: appProfile.monthly_income_cents ? String(appProfile.monthly_income_cents / 100) : dbData.income || "",
                guarantorName: appProfile.guarantor_name || dbData.guarantorName || "",
                guarantorPhone: appProfile.guarantor_phone || dbData.guarantorPhone || "",
                emergencyContactName: appProfile.emergency_contact_name || dbData.emergencyContactName || "",
                emergencyContactRelation: appProfile.emergency_contact_relation || dbData.emergencyContactRelation || "",
                emergencyContactPhone: appProfile.emergency_contact_phone || dbData.emergencyContactPhone || "",
                emergencyContactEmail: appProfile.emergency_contact_email || dbData.emergencyContactEmail || "",
              };
            }
          } catch (e) { console.error("Failed to fetch application profile", e); }

          // Fetch lifestyle fields from applications table
          try {
            const { data: appData } = await supabase
              .from('applications')
              .select('has_pets, smoking, needs_parking, special_requirements, additional_notes, preferred_language, move_reason, referral_source')
              .eq('id', appId)
              .maybeSingle();

            if (appData) {
              dbData = {
                ...dbData,
                hasPets: appData.has_pets || dbData.hasPets || "",
                smoking: appData.smoking || dbData.smoking || "",
                needsParking: appData.needs_parking || dbData.needsParking || "",
                specialRequirements: appData.special_requirements || dbData.specialRequirements || "",
                additionalNotes: appData.additional_notes || dbData.additionalNotes || "",
                language: appData.preferred_language || dbData.language || "",
                moveReason: appData.move_reason || dbData.moveReason || "",
                referralSource: appData.referral_source || dbData.referralSource || "",
              };
            }
          } catch (e) { console.error("Failed to fetch application data", e); }
        }
      }

      // 2. Apply DB data as base — profile for personal, app_profiles for rest
      setFormData(prev => ({
        ...prev,
        firstName: dbData.firstName || prev.firstName || "",
        lastName: dbData.lastName || prev.lastName || "",
        email: dbData.email || prev.email || "",
        phone: dbData.phone || prev.phone || "",
        dob: dbData.dob || prev.dob || "",
        nationality: dbData.nationality || prev.nationality || "",
        currentAddress: dbData.currentAddress || prev.currentAddress || "",
        apartment: dbData.apartment || prev.apartment || "",
        city: dbData.city || prev.city || "",
        zipCode: dbData.zipCode || prev.zipCode || "",
        district: dbData.district || prev.district || "",
        country: dbData.country || prev.country || "",
        occupation: dbData.occupation || prev.occupation || "work",
        employer: dbData.employer || prev.employer || "",
        jobTitle: dbData.jobTitle || prev.jobTitle || "",
        university: dbData.university || prev.university || "",
        course: dbData.course || prev.course || "",
        employmentStatus: dbData.employmentStatus || prev.employmentStatus || "",
        income: dbData.income || prev.income || "",
        guarantorName: dbData.guarantorName || prev.guarantorName || "",
        guarantorPhone: dbData.guarantorPhone || prev.guarantorPhone || "",
        emergencyContactName: dbData.emergencyContactName || prev.emergencyContactName || "",
        emergencyContactRelation: dbData.emergencyContactRelation || prev.emergencyContactRelation || "",
        emergencyContactPhone: dbData.emergencyContactPhone || prev.emergencyContactPhone || "",
        emergencyContactEmail: dbData.emergencyContactEmail || prev.emergencyContactEmail || "",
        hasPets: dbData.hasPets || prev.hasPets || "",
        smoking: dbData.smoking || prev.smoking || "",
        needsParking: dbData.needsParking || prev.needsParking || "",
        specialRequirements: dbData.specialRequirements || prev.specialRequirements || "",
        additionalNotes: dbData.additionalNotes || prev.additionalNotes || "",
        language: dbData.language || prev.language || "",
        moveReason: dbData.moveReason || prev.moveReason || "",
        referralSource: dbData.referralSource || prev.referralSource || "",
      }));

      // 3. Apply draft on top (only non-empty values, but DB phone/countryCode takes priority)
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          const draftData = parsed.formData || {};
          setFormData(prev => {
            const merged = { ...prev };
            Object.entries(draftData).forEach(([key, val]) => {
              // DB phone/dob/email take priority — only use draft if DB didn't provide
              if (key === 'phone' && dbData.phone) return;
              if (key === 'dob' && dbData.dob) return;
              if (key === 'email' && dbData.email) return;
              if (val) merged[key] = val;
            });
            return merged;
          });
          // Only use draft country code if DB didn't set one
          if (!dbData.phone) {
            setCountryCode(parsed.countryCode || "+49");
          }
        } catch (e) { console.error("Failed to load draft", e); }
      }

      setProfileLoaded(true);
    };

    loadData();
  }, [DRAFT_KEY, user?.id]);

  // Track last saved data to detect actual changes
  const lastSavedRef = React.useRef(null);

  // Debounced auto-save with animation — only when data actually changes
  useEffect(() => {
    if (!isSubmitted && bookingData.title && profileLoaded) {
      const currentData = JSON.stringify({ formData, countryCode });

      // Skip if data hasn't actually changed
      if (lastSavedRef.current === currentData) return;

      const timer = setTimeout(() => {
        setSaveStatus('saving');
        const draft = { formData, countryCode, lastUpdated: new Date().toISOString() };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        lastSavedRef.current = currentData;
        setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 2000);
        }, 600);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [formData, countryCode, isSubmitted, bookingData.title, DRAFT_KEY, profileLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAndLeave = (e) => {
    e.preventDefault();
    const draft = { formData, countryCode, lastUpdated: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setModal('saved');
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({ ...prev, [type]: e.target.files[0] }));
    }
  };

  const handleCameraConfirm = (dataUrl) => {
    setDocuments(prev => ({ ...prev, selfie: dataUrl }));
    setShowCamera(false);
  };

  const getValidationErrors = () => {
    const errors = [];

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.dob || !formData.phone || !formData.occupants) {
      errors.push({ id: 'personal', label: 'Personal Information' });
    }
    if (!formData.currentAddress || !formData.city || !formData.country) {
      errors.push({ id: 'address', label: 'Current Address' });
    }
    if (!formData.nationality || !formData.income || !formData.moveReason) {
      errors.push({ id: 'occupation', label: 'Occupation & Background' });
    }
    if (formData.occupation === 'work' && (!formData.employer || !formData.jobTitle)) {
      if (!errors.find(e => e.id === 'occupation')) errors.push({ id: 'occupation', label: 'Occupation & Background' });
    }
    if (formData.occupation === 'study' && (!formData.university || !formData.course)) {
      if (!errors.find(e => e.id === 'occupation')) errors.push({ id: 'occupation', label: 'Occupation & Background' });
    }
    if (formData.occupation === 'azubi' && (!formData.employer || !formData.jobTitle)) {
      if (!errors.find(e => e.id === 'occupation')) errors.push({ id: 'occupation', label: 'Occupation & Background' });
    }
    if (!documents.passport) {
      errors.push({ id: 'documents', label: 'Identity Documents' });
    }
    if (!formData.hasPets || !formData.smoking) {
      errors.push({ id: 'lifestyle', label: 'Lifestyle & Preferences' });
    }

    return errors;
  };

  // Live validation errors (only computed after first submit attempt)
  const validationErrors = showValidation ? getValidationErrors().map(e => e.id) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = getValidationErrors();
    if (errors.length > 0) {
      setShowValidation(true);
      const firstErrorSection = document.querySelector(`[data-section="${errors[0].id}"]`);
      if (firstErrorSection) {
        firstErrorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setShowValidation(false);
    setUploading(true);
    setUploadError(null);

    try {
      const appId = bookingData.applicationId;

      // Save application profile to DB
      const profileData = {
        application_id: appId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dob || null,
        email: formData.email,
        phone: formData.phone,
        phone_country_code: countryCode,
        nationality: formData.nationality,
        street_address: formData.currentAddress,
        apartment: formData.apartment,
        city: formData.city,
        zip_code: formData.zipCode,
        district: formData.district,
        country: formData.country,
        occupation_type: formData.occupation,
        employer: formData.employer,
        job_title: formData.jobTitle,
        university: formData.university,
        course: formData.course,
        employment_status: formData.employmentStatus,
        monthly_income_cents: formData.income ? Math.round(Number(formData.income) * 100) : null,
        guarantor_name: formData.guarantorName,
        guarantor_phone: formData.guarantorPhone,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_relation: formData.emergencyContactRelation,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_email: formData.emergencyContactEmail,
        email_verified: verifiedFields.email,
        phone_verified: verifiedFields.phone,
      };

      if (appId) {
        // Upsert application profile
        const { error: profileError } = await supabase
          .from('application_profiles')
          .upsert(profileData, { onConflict: 'application_id' });

        if (profileError) console.error('Profile save error:', profileError);

        // Update applications table with lifestyle fields
        const { error: appError } = await supabase
          .from('applications')
          .update({
            tenant_type: formData.occupation === 'work' ? 'professional' : formData.occupation,
            occupants: Number(formData.occupants) || 1,
            move_reason: formData.moveReason,
            referral_source: formData.referralSource,
            has_pets: formData.hasPets,
            smoking: formData.smoking,
            needs_parking: formData.needsParking,
            special_requirements: formData.specialRequirements,
            additional_notes: formData.additionalNotes,
            preferred_language: formData.language,
            status: 'pending_signature',
          })
          .eq('id', appId);

        if (appError) console.error('Application update error:', appError);

        // Update user profile too
        if (user?.id) {
          await supabase.from('profiles').update({
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: `${countryCode}${formData.phone}`,
            date_of_birth: formData.dob || null,
            nationality: formData.nationality,
          }).eq('id', user.id);
        }
      }

      // Clean up draft and show success
      setIsSubmitted(true);
      localStorage.removeItem(DRAFT_KEY);
      setModal('submitted');
      setUploading(false);
      return;
    } catch (e) {
      console.error('Submit error:', e);
      setUploadError('Failed to save your application. Please try again.');
      setUploading(false);
      return;
    }

  };

  if (!bookingData.title) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-8 text-center max-w-sm">
          <p className="text-sm text-[#4b5563] mb-4">No active application found.</p>
          <button onClick={() => navigate('/')} className="text-[#0f4c3a] font-semibold text-sm hover:underline">Go home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-24 sm:pt-28 pb-20">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#4b5563] hover:text-[#111827] transition-colors group mb-6"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>

        {/* Stepper */}
        <div className="flex justify-center mb-10">
          <div className="w-full max-w-lg">
            <BookingStepper currentStep={3} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ═══ LEFT — Form ═══ */}
          <div className="lg:col-span-7 space-y-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#111827]">Complete your application</h2>
                <p className="text-[12px] text-[#6b7280] mt-0.5">Fill in your details and upload required documents</p>
              </div>
              <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 ${
                saveStatus === 'saving' ? 'bg-[#D4A017]/10 text-[#D4A017]' :
                saveStatus === 'saved' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                'bg-[#0f4c3a]/5 text-[#6b7280]'
              }`}>
                {saveStatus === 'saving' ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : saveStatus === 'saved' ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <Save size={10} />
                )}
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Auto-save'}
              </span>
            </div>

            {/* 48h reminder */}
            <div className="bg-[#D4A017]/5 border border-[#D4A017]/15 rounded-xl px-4 py-3 flex gap-2.5 items-center">
              <Clock size={14} className="text-[#D4A017] shrink-0" />
              <p className="text-[11px] text-[#6b7280]">
                Complete within <span className="font-bold text-[#111827]">48 hours</span> to confirm your reservation.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              <div data-section="personal" className={`bg-white rounded-2xl border shadow-sm p-5 relative transition-colors ${
                validationErrors.includes('personal') ? 'border-[#EA4335]/40 bg-[#EA4335]/[0.01]' :
                !!(formData.firstName && formData.lastName && formData.email && formData.dob && formData.phone && formData.occupants) ? 'border-[#22C55E]/20' : 'border-[#0f4c3a]/5'
              }`}>
                {!!(formData.firstName && formData.lastName && formData.email && formData.dob && formData.phone && formData.occupants) && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <PersonalDetails
                  formData={formData}
                  handleChange={handleChange}
                  setFormData={setFormData}
                  countryCode={countryCode}
                  setCountryCode={setCountryCode}
                  verifiedFields={verifiedFields}
                  onFieldVerified={async (field) => {
                    setVerifiedFields(prev => ({ ...prev, [field]: true }));
                    // Update DB
                    if (field === 'phone' && user?.id) {
                      await supabase.from('profiles').update({ phone_verified: true }).eq('id', user.id);
                    }
                  }}
                />
              </div>

              <div data-section="address" className={`bg-white rounded-2xl border shadow-sm p-5 relative transition-colors ${
                validationErrors.includes('address') ? 'border-[#EA4335]/40 bg-[#EA4335]/[0.01]' :
                !!(formData.currentAddress && formData.city && formData.country) ? 'border-[#22C55E]/20' : 'border-[#0f4c3a]/5'
              }`}>
                {!!(formData.currentAddress && formData.city && formData.country) && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <AddressDetails
                  formData={formData}
                  handleChange={handleChange}
                />
              </div>

              <div data-section="occupation" className={`bg-white rounded-2xl border shadow-sm p-5 relative transition-colors ${
                validationErrors.includes('occupation') ? 'border-[#EA4335]/40 bg-[#EA4335]/[0.01]' :
                !!(formData.nationality && formData.income && (formData.employer || formData.university)) ? 'border-[#22C55E]/20' : 'border-[#0f4c3a]/5'
              }`}>
                {!!(formData.nationality && formData.income && (formData.employer || formData.university)) && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <OccupationDetails
                  formData={formData}
                  handleChange={handleChange}
                  documents={documents}
                  handleFileChange={handleFileChange}
                  monthlyRent={monthlyRent}
                />
              </div>

              <div data-section="documents" className={`bg-white rounded-2xl border shadow-sm p-5 relative transition-colors ${
                validationErrors.includes('documents') ? 'border-[#EA4335]/40 bg-[#EA4335]/[0.01]' :
                !!(documents.passport && documents.selfie) ? 'border-[#22C55E]/20' : 'border-[#0f4c3a]/5'
              }`}>
                {!!(documents.passport && documents.selfie) && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <RequiredDocuments
                  documents={documents}
                  handleFileChange={handleFileChange}
                  onStartCamera={() => setShowCamera(true)}
                  nationality={formData.nationality}
                />
              </div>

              <div data-section="lifestyle" className={`bg-white rounded-2xl border shadow-sm p-5 relative transition-colors ${
                validationErrors.includes('lifestyle') ? 'border-[#EA4335]/40 bg-[#EA4335]/[0.01]' :
                !!(formData.hasPets && formData.smoking) ? 'border-[#22C55E]/20' : 'border-[#0f4c3a]/5'
              }`}>
                {!!(formData.hasPets && formData.smoking) && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <LifestyleDetails
                  formData={formData}
                  handleChange={handleChange}
                />
              </div>

              <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5">
                <EmergencyContact
                  formData={formData}
                  handleChange={handleChange}
                />
              </div>

              {showValidation && validationErrors.length > 0 && (
                <div className="bg-[#EA4335]/10 border-2 border-[#EA4335]/30 rounded-xl p-4">
                  <p className="text-xs font-bold text-[#EA4335] mb-2">Please complete the following sections before submitting:</p>
                  <ul className="text-[11px] text-[#EA4335]/80 space-y-1">
                    {getValidationErrors().map((err) => (
                      <li key={err.id} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
                        {err.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {uploadError && (
                <div className="bg-[#EA4335]/5 border border-[#EA4335]/20 rounded-xl p-4">
                  <p className="text-xs text-[#EA4335] font-medium">{uploadError}</p>
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3.5 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                  ) : (
                    <>Submit application <ArrowRight size={14} /></>
                  )}
                </button>

                <p className="text-[10px] text-[#9ca3af] text-center">
                  Or <button type="button" onClick={handleSaveAndLeave} disabled={uploading} className="text-[#0f4c3a] font-semibold hover:underline underline-offset-2">save draft and continue later</button>
                </p>
              </div>

            </form>
          </div>

          {/* ═══ RIGHT — Sidebar ═══ */}
          {(() => {
            const sections = [
              { id: "personal", label: "Personal", done: !!(formData.firstName && formData.lastName && formData.email && formData.dob && formData.phone && formData.occupants) },
              { id: "address", label: "Address", done: !!(formData.currentAddress && formData.city && formData.country) },
              { id: "occupation", label: "Occupation", done: !!(formData.nationality && formData.income && (formData.employer || formData.university)) },
              { id: "documents", label: "Documents", done: !!(documents.passport && documents.selfie) },
              { id: "lifestyle", label: "Lifestyle", done: !!(formData.hasPets && formData.smoking) },
            ];
            const completedCount = sections.filter(s => s.done).length;
            const percentage = Math.round((completedCount / sections.length) * 100);

            return (
              <div className="lg:col-span-5 hidden lg:block">
                <div className="sticky top-24 space-y-4">

                  {/* Merged: Property + Booking + Progress */}
                  <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm overflow-hidden">
                    {/* Property image */}
                    <div className="relative h-28 overflow-hidden">
                      <img src={bookingData.image || "/placeholder-property.jpg"} alt={bookingData.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-sm font-serif text-white leading-tight">{bookingData.title}</p>
                        <p className="text-[9px] text-white/60 mt-0.5">
                          {bookingData.unitNumber ? `Unit ${bookingData.unitNumber}` : ''}{bookingData.city ? ` · ${bookingData.city}` : ''}
                        </p>
                      </div>
                      {/* Price badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
                        <span className="text-sm font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{monthlyRent.toLocaleString()}</span>
                        <span className="text-[8px] text-[#9ca3af]">/mo</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#0f4c3a]/5">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                          {startDateObj ? `${startDateObj.getDate()} ${MONTHS[startDateObj.getMonth()]} ${startDateObj.getFullYear()}` : bookingData.checkIn}
                        </span>
                        <span className="text-[#9ca3af]">→</span>
                        <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                          {endDateObj ? `${endDateObj.getDate()} ${MONTHS[endDateObj.getMonth()]} ${endDateObj.getFullYear()}` : bookingData.checkOut}
                        </span>
                      </div>
                      {duration && <span className="text-[8px] font-bold text-[#D4A017] bg-[#D4A017]/10 px-1.5 py-0.5 rounded-full">{duration}</span>}
                    </div>

                    {/* Compact booking summary */}
                    <div className="px-4 py-3 border-b border-[#0f4c3a]/5 space-y-1.5 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Holding deposit</span>
                        <span className="font-bold text-[#22C55E]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit} <span className="text-[8px] bg-[#22C55E]/10 px-1 py-0.5 rounded-full">Paid</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Security deposit</span>
                        <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{deposit.toLocaleString()} <span className="text-[8px] text-[#22C55E] bg-[#22C55E]/10 px-1 py-0.5 rounded-full">Refundable</span></span>
                      </div>
                    </div>

                    {/* Application progress with percentage */}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Your progress</p>
                        <span className={`text-xs font-bold ${percentage === 100 ? 'text-[#22C55E]' : 'text-[#D4A017]'}`}>{percentage}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-[#22C55E] rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>

                      {/* Section checklist with timeline */}
                      <div className="space-y-0">
                        {sections.map((item, i) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const formCards = document.querySelectorAll('[data-section]');
                              formCards[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="flex gap-2.5 w-full text-left group"
                          >
                            <div className="flex flex-col items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                item.done ? 'bg-[#22C55E]' : 'bg-[#e5e7eb] group-hover:bg-[#d1d5db]'
                              }`}>
                                {item.done && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                              {i < sections.length - 1 && <div className={`w-px flex-1 min-h-[16px] ${item.done ? 'bg-[#22C55E]/30' : 'bg-[#e5e7eb]'}`} />}
                            </div>
                            <div className="pb-3 -mt-0.5">
                              <span className={`text-xs transition-colors ${
                                item.done ? 'text-[#111827] font-semibold' : 'text-[#9ca3af] group-hover:text-[#4b5563]'
                              }`}>{item.label}</span>
                              {!item.done && <p className="text-[9px] text-[#d1d5db] group-hover:text-[#9ca3af]">Click to go</p>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Help */}
                  <div className="bg-[#f9f9f7] rounded-2xl border border-[#0f4c3a]/5 p-3 flex items-start gap-2">
                    <Info size={12} className="text-[#9ca3af] shrink-0 mt-0.5" />
                    <p className="text-[9px] text-[#6b7280] leading-relaxed">
                      Your progress is auto-saved. Need help? Contact our support team anytime.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Camera */}
      {showCamera && (
        <CameraModal onClose={() => setShowCamera(false)} onConfirm={handleCameraConfirm} />
      )}

      {/* Success/Save Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => { setModal(null); navigate('/profile'); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                modal === 'submitted' ? 'bg-[#22C55E]' : 'bg-[#D4A017]/10'
              }`}>
                {modal === 'submitted' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <Bookmark size={24} className="text-[#D4A017]" />
                )}
              </div>

              <h3 className="text-xl font-serif text-[#111827] mb-2">
                {modal === 'submitted' ? 'Application submitted!' : 'Draft saved!'}
              </h3>
              <p className="text-[12px] text-[#6b7280] leading-relaxed mb-6">
                {modal === 'submitted'
                  ? 'Great job! Your details have been saved. The next step is to review and sign your lease agreement.'
                  : 'Your progress has been saved. Come back anytime to continue.'}
              </p>

              {modal === 'submitted' ? (
                <div className="space-y-2.5">
                  <button
                    onClick={() => { setModal(null); navigate('/sign-lease', { state: bookingData }); }}
                    className="w-full py-3.5 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Sign Lease <ArrowRight size={14} />
                  </button>
                  <p className="text-[9px] text-[#9ca3af]">
                    Or <button onClick={() => { setModal(null); navigate('/profile'); }} className="text-[#0f4c3a] font-semibold hover:underline">complete later from your dashboard</button>
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => { setModal(null); navigate('/profile'); }}
                  className="w-full py-3.5 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors"
                >
                  Got it
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDetails;
