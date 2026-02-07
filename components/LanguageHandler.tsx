'use client';

import { useEffect } from 'react';
import { useI18n } from './I18nContext';

export default function LanguageHandler() {
    const { locale } = useI18n();

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    return null;
}
