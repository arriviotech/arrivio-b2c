import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/client';
import PersonalDetails from '../../components/profile/PersonalDetails';
import { toast } from 'react-hot-toast';

const EditProfile = () => {
    const { user } = useAuth();

    const [phone, setPhone] = useState("");
    const [preferredName, setPreferredName] = useState("");
    const [countryCode, setCountryCode] = useState("+49");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [nationality, setNationality] = useState("");
    const [language, setLanguage] = useState("en");
    const [saving, setSaving] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const fetchUserData = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("profiles")
            .select("phone, preferred_name, date_of_birth, nationality, language")
            .eq("id", user.id)
            .maybeSingle();

        if (error) { setLoadingProfile(false); return; }
        if (!data) { setLoadingProfile(false); return; }

        if (data?.preferred_name) setPreferredName(data.preferred_name);
        if (data?.date_of_birth) setDateOfBirth(data.date_of_birth);
        if (data?.nationality) setNationality(data.nationality);
        if (data?.language) setLanguage(data.language);
        if (data?.phone) {
            const knownCodes = ["+971", "+49", "+91", "+44", "+61", "+65", "+1"];
            const code = knownCodes.find((c) => data.phone.startsWith(c));
            if (code) {
                setCountryCode(code);
                setPhone(data.phone.slice(code.length));
            } else {
                setCountryCode("+49");
                setPhone(data.phone.replace(/^\+\d{1,3}/, ""));
            }
        }
        setLoadingProfile(false);
    }, [user]);

    useEffect(() => { fetchUserData(); }, [fetchUserData]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        const fullPhone = phone ? `${countryCode}${phone}` : "";
        const { error } = await supabase
            .from("profiles")
            .update({
                phone: fullPhone || null,
                preferred_name: preferredName || null,
                date_of_birth: dateOfBirth || null,
                nationality: nationality || null,
                language: language,
            })
            .eq("id", user.id);

        setSaving(false);
        if (error) {
            toast.error(error.message || "Failed to update profile");
        } else {
            toast.success("Profile updated!");
            await fetchUserData();
        }
    };

    if (!user) return null;

    if (loadingProfile) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#0f4c3a]/20 border-t-[#0f4c3a] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-serif text-[#111827] mb-6">Personal Details</h2>
            <PersonalDetails
                name={user.user_metadata?.full_name}
                email={user.email}
                username={preferredName}
                setUsername={setPreferredName}
                usernameError=""
                phone={phone}
                setPhone={setPhone}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                dateOfBirth={dateOfBirth}
                setDateOfBirth={setDateOfBirth}
                nationality={nationality}
                setNationality={setNationality}
                language={language}
                setLanguage={setLanguage}
                created_at={user.created_at}
                handleSave={handleSave}
                saving={saving}
            />
        </div>
    );
};

export default EditProfile;
