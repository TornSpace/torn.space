/*
 * torn.space
 * Copyright (C) 2026 DamienVesper
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import en from "$lib/l10n/en";

import type { Translation } from "$lib/l10n/translations";

export const Locales = {
    en: "English"
};

export class Localization {
    readonly acceptedLocales: Locale[] = Object.keys(Locales) as Locale[];

    readonly translations: Record<Locale, Translation> = {
        en
    };

    private locale: Locale = $state(this.detectLocale());
    translation: Translation = $derived(this.translations[this.locale]);

    detectLocale(): Locale {
        let detectedLocale = navigator.language.toLowerCase();
        const languageWildcards = ["en"];

        for (let i = 0; i < languageWildcards.length; i++) {
            if (detectedLocale.includes(languageWildcards[i])) {
                detectedLocale = languageWildcards[i];
                break;
            }
        }

        for (let i = 0; i < this.acceptedLocales.length; i++) {
            if (detectedLocale.includes(this.acceptedLocales[i])) {
                return this.acceptedLocales[i];
            }
        }

        return "en";
    }

    setLocale(locale: Locale): void {
        const newLocale = this.acceptedLocales.includes(locale) ? locale : "en";
        this.locale = newLocale;
    }

    getLocale(): Locale {
        return this.locale;
    }
}

export type Locale = keyof typeof Locales;
