import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Detect initial language from localStorage or default to English
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

    return (
        <LanguageContext.Provider value={{ language, setLanguage, languages, currentLanguage }}>
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
