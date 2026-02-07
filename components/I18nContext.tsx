'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en.json';
import fr from '../translations/fr.json';

type Translations = typeof fr;

interface I18nContextType {
    locale: string;
    setLocale: (locale: string) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<string, any> = { en, fr };

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState('fr');

    useEffect(() => {
        const savedLocale = localStorage.getItem('locale');
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'fr')) {
            setLocaleState(savedLocale);
        }
    }, []);

    const setLocale = (newLocale: string) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: string) => {
        const keys = key.split('.');
        let result = translations[locale];
        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                return key;
            }
        }
        return result;
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
