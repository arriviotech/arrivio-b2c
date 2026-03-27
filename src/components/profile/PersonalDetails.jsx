import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // ✅ Import createPortal
import { User, Mail, Phone, Save, Calendar, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast'; // ✅ Import toast
import ProfileRow from './ProfileRow';

const PersonalDetails = ({
    name,
    email,
    username,
    setUsername,
    usernameError,
    phone,
    setPhone,
    countryCode,
    setCountryCode,
    dateOfBirth,
    setDateOfBirth,
    nationality,
    setNationality,
    language,
    setLanguage,
    created_at,
    handleSave,
    saving,
    onCancel
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [hasShownNotice, setHasShownNotice] = useState(false);

    const onSaveWrapper = async () => {
        await handleSave();
        setIsEditing(false);
        setHasShownNotice(false); // Reset for next time
    };

    const onCancelWrapper = () => {
        setIsEditing(false);
        setHasShownNotice(false);
        if (onCancel) onCancel();
    };

    const handleUsernameFocus = () => {
        if (!hasShownNotice) {
            setShowNoticeModal(true);
            setHasShownNotice(true);
        }
    };

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border border-[#0f4c3a]/5 overflow-hidden">
                <div className="bg-[#f7f7f7] px-8 py-5 border-b border-[#0f4c3a]/5 flex items-center justify-center relative">
                    <h2 className="font-serif text-lg text-[#111827]">Personal Details</h2>
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        {isEditing ? (
                            <button
                                onClick={onCancelWrapper}
                                className="p-2 hover:bg-[#0f4c3a]/5 rounded-full transition-colors text-[#4b5563] hover:text-[#111827]"
                            >
                                <X size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#0f4c3a]/5 rounded-full transition-colors text-[#6b7280] hover:text-[#111827]"
                            >
                                <Edit2 size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Edit</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 pt-6">
                    {name && (
                        <ProfileRow icon={<User size={18} />} label="Full Name" value={name} />
                    )}
                    <ProfileRow icon={<Mail size={18} />} label="Email Address" value={email} />

                    {/* USERNAME & PHONE EDITABLE SECTION */}
                    {!isEditing ? (
                        <>
                            {/* USERNAME ROW */}
                            {username ? (
                                <ProfileRow icon={<User size={18} />} label="Username" value={username} />
                            ) : (
                                <div className="flex items-center gap-5 px-5 py-5 hover:bg-[#f7f7f7] rounded-2xl transition-colors group border border-dashed border-red-300 bg-red-50/50 mt-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                                    <div className="w-10 h-10 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center text-red-500 shrink-0 transition-all">
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1">Username</p>
                                        <p className="text-base font-medium text-red-600 truncate">Add Username</p>
                                    </div>
                                </div>
                            )}

                            {/* PHONE ROW */}
                            {phone ? (
                                <ProfileRow icon={<Phone size={18} />} label="Phone Number" value={`${countryCode} ${phone}`} />
                            ) : (
                                <div className="flex items-center gap-5 px-5 py-5 hover:bg-[#f7f7f7] rounded-2xl transition-colors group border border-dashed border-red-300 bg-red-50/50 mt-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                                    <div className="w-10 h-10 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center text-red-500 shrink-0 transition-all">
                                        <Phone size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1">Phone Number</p>
                                        <p className="text-base font-medium text-red-600 truncate">Add Phone Number</p>
                                    </div>
                                </div>
                            )}

                            {/* DATE OF BIRTH ROW */}
                            {dateOfBirth ? (
                                <ProfileRow icon={<Calendar size={18} />} label="Date of Birth" value={new Date(dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
                            ) : (
                                <div className="flex items-center gap-5 px-5 py-5 hover:bg-[#f7f7f7] rounded-2xl transition-colors group border border-dashed border-amber-300 bg-amber-50/50 mt-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                                    <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-500 shrink-0 transition-all">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">Date of Birth</p>
                                        <p className="text-base font-medium text-amber-600 truncate">Add Date of Birth</p>
                                    </div>
                                </div>
                            )}

                            {/* NATIONALITY ROW */}
                            {nationality ? (
                                <ProfileRow icon={<span className="text-lg">🌍</span>} label="Nationality" value={nationality} />
                            ) : (
                                <div className="flex items-center gap-5 px-5 py-5 hover:bg-[#f7f7f7] rounded-2xl transition-colors group border border-dashed border-amber-300 bg-amber-50/50 mt-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                                    <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-500 shrink-0 transition-all">
                                        <span className="text-lg">🌍</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">Nationality</p>
                                        <p className="text-base font-medium text-amber-600 truncate">Add Nationality</p>
                                    </div>
                                </div>
                            )}

                            {/* LANGUAGE ROW */}
                            <ProfileRow icon={<span className="text-lg">🗣</span>} label="Preferred Language" value={language === 'en' ? 'English' : language === 'de' ? 'Deutsch' : language} />
                        </>
                    ) : (
                        <div className="flex flex-col gap-4 px-5 py-6 bg-[#f7f7f7] rounded-2xl border border-[#0f4c3a]/5 mt-2 transition-all animate-in fade-in slide-in-from-top-2">

                            {/* EDIT HEADER */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#111827] shrink-0 custom-shadow">
                                    <Edit2 size={14} />
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold">
                                    Edit Details
                                </p>
                            </div>

                            {/* EDIT FORM GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* PREFERRED NAME INPUT */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-[#4b5563] ml-1">Username</label>
                                    <input
                                        type="text"
                                        value={username || ""}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        className="text-sm font-bold border border-[#0f4c3a]/10 focus:ring-[#0f4c3a]/10 bg-white rounded-xl px-4 py-3 focus:ring-2 outline-none w-full hover:bg-[#f0f0f0] transition-colors placeholder:font-normal"
                                    />
                                </div>

                                {/* PHONE INPUT */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-[#4b5563] ml-1">Phone Number</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="text-sm font-bold border border-[#0f4c3a]/10 bg-white rounded-xl px-3 py-3 focus:ring-2 focus:ring-[#0f4c3a]/10 outline-none cursor-pointer hover:bg-[#f0f0f0] transition-colors w-24"
                                        >
                                            <option value="+49">🇩🇪 +49</option>
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+61">🇦🇺 +61</option>
                                            <option value="+971">🇦🇪 +971</option>
                                            <option value="+65">🇸🇬 +65</option>
                                        </select>

                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value.replace(/\D/g, ""))
                                            }
                                            placeholder="123 456 7890"
                                            className="flex-1 text-sm font-bold border border-[#0f4c3a]/10 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0f4c3a]/10 outline-none w-full hover:bg-[#f0f0f0] transition-colors placeholder:font-normal"
                                        />
                                    </div>
                                </div>

                                {/* DATE OF BIRTH */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-[#4b5563] ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={dateOfBirth || ""}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="text-sm font-bold border border-[#0f4c3a]/10 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0f4c3a]/10 outline-none w-full hover:bg-[#f0f0f0] transition-colors"
                                    />
                                </div>

                                {/* NATIONALITY */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-[#4b5563] ml-1">Nationality</label>
                                    <input
                                        type="text"
                                        value={nationality || ""}
                                        onChange={(e) => setNationality(e.target.value)}
                                        placeholder="e.g. Indian, German"
                                        className="text-sm font-bold border border-[#0f4c3a]/10 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0f4c3a]/10 outline-none w-full hover:bg-[#f0f0f0] transition-colors placeholder:font-normal"
                                    />
                                </div>

                                {/* PREFERRED LANGUAGE */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-[#4b5563] ml-1">Preferred Language</label>
                                    <select
                                        value={language || "en"}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="text-sm font-bold border border-[#0f4c3a]/10 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0f4c3a]/10 outline-none cursor-pointer hover:bg-[#f0f0f0] transition-colors w-full"
                                    >
                                        <option value="en">English</option>
                                        <option value="de">Deutsch</option>
                                    </select>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={onCancelWrapper}
                                    disabled={saving}
                                    className="flex-1 text-[10px] font-bold uppercase tracking-widest bg-white border border-[#0f4c3a]/10 text-[#111827] px-4 py-3 rounded-xl hover:bg-[#f0f0f0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onSaveWrapper}
                                    disabled={saving || usernameError}
                                    className="flex-1 text-[10px] font-bold uppercase tracking-widest bg-[#0f4c3a] text-[#f2f2f2] px-4 py-3 rounded-xl hover:bg-[#0a3a2b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#0f4c3a]/20"
                                >
                                    {saving ? <span className="animate-pulse">Saving...</span> : <><Save size={14} /> Save Changes</>}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-2">
                        <ProfileRow
                            icon={<Calendar size={18} />}
                            label="Member Since"
                            value={new Date(created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        />
                    </div>
                </div>
            </div>

            {/* NOTICE MODAL - PORTAL */}
            {showNoticeModal && createPortal(
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-200 relative z-[100000]">
                        <div className="w-12 h-12 bg-[#0f4c3a]/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#111827]">
                            <User size={24} />
                        </div>
                        <h3 className="font-serif text-xl text-[#111827] mb-2">Username Change</h3>
                        <p className="text-sm text-[#374151] mb-6 leading-relaxed">
                            You can change your username only <strong>twice</strong> in <strong>14 days</strong>.
                            <br />
                            You can revert to your old username during this period.
                        </p>
                        <button
                            onClick={() => setShowNoticeModal(false)}
                            className="w-full py-3 bg-[#0f4c3a] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#0a3a2b] transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default PersonalDetails;


