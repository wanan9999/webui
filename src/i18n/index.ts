/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import zh from './zh.json';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: navigator.language?.split('-')[0] || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLocale(locale: string) {
  const lang = locale.split('_')[0].split('-')[0];
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
  const isRtl = RTL_LANGUAGES.includes(lang);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
}

export function getIntlLocale(): string {
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  return lang === 'zh' ? 'zh-CN' : lang;
}

export default i18n;
