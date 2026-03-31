import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "../i18n/en.json";
import de from "../i18n/de.json";

const translations = { EN: en, DE: de };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("preferred_language") || "EN";
    });

    useEffect(() => {
        localStorage.setItem("preferred_language", language);
    }, [language]);

    const languages = [
        { code: "EN", label: "English", flag: "https://flagcdn.com/w80/gb.png" },
        { code: "DE", label: "Deutsch", flag: "https://flagcdn.com/w80/de.png" },
    ];

    const currentLanguage = languages.find(l => l.code === language) || languages[0];

    // t("nav.signIn") → "Sign In" or "Anmelden"
    // t("search.showingUnits", { count: 5, total: 20 }) → "Showing 5 of 20 units"
    const t = useCallback((key, vars) => {
        const dict = translations[language] || translations.EN;
        const parts = key.split(".");
        let val = dict;
        for (const part of parts) {
            val = val?.[part];
        }
        if (val == null) {
            // Fallback to English
            val = parts.reduce((obj, k) => obj?.[k], translations.EN);
        }
        if (typeof val !== "string") return key;
        if (vars) {
            return val.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
        }
        return val;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, languages, currentLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
