import { Injectable, effect, signal } from '@angular/core';
import { Locale, TRANSLATIONS, TranslationKey } from '../i18n/translations';

const STORAGE_KEY = 'fisch-locale';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly locale = signal<Locale>(this.readStored());

  constructor() {
    effect(() => {
      const locale = this.locale();
      document.documentElement.lang = locale === 'th' ? 'th' : 'en';
      localStorage.setItem(STORAGE_KEY, locale);
    });
  }

  t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text: string = TRANSLATIONS[this.locale()][key];
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
  }

  dateLocale(): string {
    return this.locale() === 'th' ? 'th-TH' : 'en-US';
  }

  private readStored(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'th') {
      return stored;
    }
    return 'th';
  }
}
