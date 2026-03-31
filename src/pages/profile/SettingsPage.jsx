import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Bell, Globe, Shield, Lock, Trash2, Mail, Smartphone, Calendar,
  CreditCard, Users, Megaphone, ChevronRight, AlertCircle, Loader2,
  Eye, EyeOff, Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { supabase } from "../../supabase/client";
import toast from "react-hot-toast";
import SEO from "../../components/common/SEO";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, languages, currentLanguage } = useLanguage();

  // Notification preferences
  const [notifs, setNotifs] = useState({
    email_applications: true,
    email_payments: true,
    email_community: false,
    email_marketing: false,
    push_applications: true,
    push_payments: true,
    push_community: true,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    show_profile_community: true,
    share_analytics: true,
  });

  // Password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Saving indicator
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState(null);

  // Connected accounts
  const providers = user?.app_metadata?.providers || [];
  const hasGoogle = providers.includes("google");
  const hasEmail = providers.includes("email");

  const handleToggle = async (section, key) => {
    if (section === "notifs") {
      setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    }
    setSavedKey(key);
    setSaving(true);
    // In production: save to DB
    setTimeout(() => {
      setSaving(false);
      setTimeout(() => setSavedKey(null), 1500);
    }, 400);
  };

  const handleLanguageChange = (code) => {
    setLanguage(code);
    toast.success(code === "DE" ? "Sprache auf Deutsch geändert" : "Language changed to English");
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      toast.success("Password updated");
      setPasswords({ current: "", new: "", confirm: "" });
      setShowPasswordSection(false);
    } catch (e) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      // Mark profile as deleted (actual deletion handled by admin/backend)
      await supabase.from("profiles").update({ status: "deleted" }).eq("id", user.id);
      toast.success("Account deletion requested. You will be signed out.");
      await signOut();
    } catch (e) {
      toast.error("Something went wrong. Please contact support.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-5">
      <SEO title="Settings" path="/profile/settings-page" />
      <h2 className="text-xl font-serif text-[#111827]">Settings</h2>

      {/* ── NOTIFICATIONS ── */}
      <SettingsCard title="Notifications" icon={Bell} description="Choose how you want to be notified">
        <div className="space-y-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2 mt-1">Email Notifications</p>
          <ToggleRow
            icon={CreditCard}
            label="Application updates"
            desc="Status changes, approvals, rejections"
            value={notifs.email_applications}
            savedKey={savedKey}
            thisKey="email_applications"
            onChange={() => handleToggle("notifs", "email_applications")}
          />
          <ToggleRow
            icon={CreditCard}
            label="Payment reminders"
            desc="Rent due dates, payment confirmations"
            value={notifs.email_payments}
            savedKey={savedKey}
            thisKey="email_payments"
            onChange={() => handleToggle("notifs", "email_payments")}
          />
          <ToggleRow
            icon={Users}
            label="Community updates"
            desc="Events, neighbour activity, club invites"
            value={notifs.email_community}
            savedKey={savedKey}
            thisKey="email_community"
            onChange={() => handleToggle("notifs", "email_community")}
          />
          <ToggleRow
            icon={Megaphone}
            label="Marketing & promotions"
            desc="New properties, discounts, Arrivio news"
            value={notifs.email_marketing}
            savedKey={savedKey}
            thisKey="email_marketing"
            onChange={() => handleToggle("notifs", "email_marketing")}
          />

          <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2 mt-5">Push Notifications</p>
          <ToggleRow
            icon={Smartphone}
            label="Application alerts"
            desc="Instant updates on your applications"
            value={notifs.push_applications}
            savedKey={savedKey}
            thisKey="push_applications"
            onChange={() => handleToggle("notifs", "push_applications")}
          />
          <ToggleRow
            icon={Smartphone}
            label="Payment alerts"
            desc="Reminders before rent is due"
            value={notifs.push_payments}
            savedKey={savedKey}
            thisKey="push_payments"
            onChange={() => handleToggle("notifs", "push_payments")}
          />
          <ToggleRow
            icon={Smartphone}
            label="Community alerts"
            desc="New events and messages"
            value={notifs.push_community}
            savedKey={savedKey}
            thisKey="push_community"
            onChange={() => handleToggle("notifs", "push_community")}
          />
        </div>
      </SettingsCard>

      {/* ── LANGUAGE ── */}
      <SettingsCard title="Language" icon={Globe} description="Choose your preferred language">
        <div className="flex gap-3">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all flex-1 ${
                language === lang.code
                  ? "border-[#0f4c3a] bg-[#0f4c3a]/5"
                  : "border-[#e5e7eb] hover:border-[#0f4c3a]/30 hover:bg-[#f7f7f7]"
              }`}
            >
              <img src={lang.flag} alt={lang.code} className="w-7 h-7 rounded-full object-cover shadow-sm" />
              <div className="text-left">
                <p className={`text-sm font-medium ${language === lang.code ? "text-[#0f4c3a] font-bold" : "text-[#374151]"}`}>{lang.label}</p>
                <p className="text-[9px] text-[#9ca3af]">{lang.code === "EN" ? "English" : "German"}</p>
              </div>
              {language === lang.code && (
                <Check size={16} className="text-[#0f4c3a] ml-auto" />
              )}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* ── PRIVACY ── */}
      <SettingsCard title="Privacy" icon={Shield} description="Control your data and visibility">
        <div className="space-y-1">
          <ToggleRow
            icon={Users}
            label="Community visibility"
            desc="Show your profile to neighbours in your building"
            value={privacy.show_profile_community}
            savedKey={savedKey}
            thisKey="show_profile_community"
            onChange={() => handleToggle("privacy", "show_profile_community")}
          />
          <ToggleRow
            icon={Shield}
            label="Usage analytics"
            desc="Help us improve by sharing anonymous usage data"
            value={privacy.share_analytics}
            savedKey={savedKey}
            thisKey="share_analytics"
            onChange={() => handleToggle("privacy", "share_analytics")}
          />
        </div>
      </SettingsCard>

      {/* ── SECURITY ── */}
      <SettingsCard title="Security" icon={Lock} description="Manage your password and sign-in methods">
        {/* Connected Accounts */}
        <div className="space-y-3 mb-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Connected Accounts</p>
          <div className="space-y-2">
            {hasGoogle && (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f7f7f7] rounded-xl">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#374151]">Google</p>
                  <p className="text-[10px] text-[#9ca3af]">{user.email}</p>
                </div>
                <span className="text-[9px] font-bold text-[#22C55E] uppercase tracking-widest">Connected</span>
              </div>
            )}
            {hasEmail && (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f7f7f7] rounded-xl">
                <Mail size={18} className="text-[#6b7280]" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#374151]">Email & Password</p>
                  <p className="text-[10px] text-[#9ca3af]">{user.email}</p>
                </div>
                <span className="text-[9px] font-bold text-[#22C55E] uppercase tracking-widest">Active</span>
              </div>
            )}
            {!hasGoogle && !hasEmail && (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f7f7f7] rounded-xl">
                <Mail size={18} className="text-[#6b7280]" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#374151]">{user.email}</p>
                </div>
                <span className="text-[9px] font-bold text-[#22C55E] uppercase tracking-widest">Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Password</p>
          {!showPasswordSection ? (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="flex items-center justify-between w-full px-4 py-3 bg-[#f7f7f7] rounded-xl hover:bg-[#f0f0f0] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Lock size={15} className="text-[#9ca3af]" />
                <span className="text-xs font-medium text-[#374151]">Change password</span>
              </div>
              <ChevronRight size={14} className="text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors" />
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
              <PasswordInput
                label="New password"
                value={passwords.new}
                onChange={(v) => setPasswords(p => ({ ...p, new: v }))}
                show={showPasswords.new}
                onToggle={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
              />
              <PasswordInput
                label="Confirm password"
                value={passwords.confirm}
                onChange={(v) => setPasswords(p => ({ ...p, confirm: v }))}
                show={showPasswords.confirm}
                onToggle={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
              />
              {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                <p className="text-[10px] text-[#EA4335]">Passwords don't match</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowPasswordSection(false); setPasswords({ current: "", new: "", confirm: "" }); }}
                  className="px-4 py-2.5 bg-[#f2f2f2] text-[#4b5563] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#e5e5e5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword || !passwords.new || passwords.new !== passwords.confirm}
                  className="px-6 py-2.5 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {changingPassword ? <><Loader2 size={12} className="animate-spin" /> Updating...</> : "Update Password"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </SettingsCard>

      {/* ── DANGER ZONE ── */}
      <div className="bg-white rounded-2xl border border-[#EA4335]/15 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EA4335]/10">
          <div className="flex items-center gap-2">
            <Trash2 size={15} className="text-[#EA4335]" />
            <h3 className="text-sm font-bold text-[#EA4335]">Danger Zone</h3>
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs text-[#6b7280] mb-4">
            Once you delete your account, all your data will be permanently removed. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 border border-[#EA4335]/30 text-[#EA4335] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#EA4335]/5 transition-colors"
          >
            Delete my account
          </button>
        </div>
      </div>

      {/* ── DELETE ACCOUNT MODAL ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-[#EA4335]/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-[#EA4335]" />
              </div>
              <h3 className="text-lg font-serif text-[#111827] text-center mb-2">Delete your account?</h3>
              <p className="text-[12px] text-[#6b7280] text-center mb-4">
                This will permanently delete your profile, applications, bookings, and all associated data. This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1.5 block">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA4335]/30 focus:border-[#EA4335]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-[#f2f2f2] text-[#4b5563] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#e5e5e5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirm !== "DELETE"}
                  className="flex-1 py-2.5 bg-[#EA4335] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#d63a2e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <><Loader2 size={12} className="animate-spin" /> Deleting...</> : "Delete Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Sub-components ──

const SettingsCard = ({ title, icon: Icon, description, children }) => (
  <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
    <div className="px-5 py-4 border-b border-[#f2f2f2]">
      <div className="flex items-center gap-2 mb-0.5">
        <Icon size={15} className="text-[#0f4c3a]" />
        <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
      </div>
      {description && <p className="text-[10px] text-[#9ca3af] ml-[23px]">{description}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const ToggleRow = ({ icon: Icon, label, desc, value, onChange, savedKey, thisKey }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#f7f7f7] last:border-b-0">
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <Icon size={15} className="text-[#9ca3af] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#374151]">{label}</p>
        <p className="text-[10px] text-[#9ca3af] leading-relaxed">{desc}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0 ml-3">
      {savedKey === thisKey && (
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[8px] font-bold text-[#22C55E] uppercase tracking-widest">
          Saved
        </motion.span>
      )}
      <button
        onClick={onChange}
        className={`relative w-10 h-[22px] rounded-full transition-colors ${value ? "bg-[#0f4c3a]" : "bg-[#d1d5db]"}`}
      >
        <motion.div
          layout
          className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
          style={{ left: value ? "calc(100% - 20px)" : "2px" }}
        />
      </button>
    </div>
  </div>
);

const PasswordInput = ({ label, value, onChange, show, onToggle }) => (
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1.5 block">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-sm text-[#111827] pr-10 focus:outline-none focus:ring-2 focus:ring-[#0f4c3a]/20 focus:border-[#0f4c3a]"
      />
      <button onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

export default SettingsPage;
