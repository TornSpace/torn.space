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

import type { Locale } from "./Localization.svelte";

import { util } from "@/common/utils/util.ts";

const defaultConfig = {
    language: "en" as Locale,

    // Settings checkboxes.
    muteAudio: false,
    muteMusic: false,

    // SVC.
    version: 1
};

export class ConfigManager {
    loaded = false;
    localStorageAvailable = true;

    config = $state({} as ConfigType);

    onModifiedListeners: Array<(key?: string) => void> = [];

    async load(): Promise<void> {
        const onLoaded = (configStr: string): void => {
            let data = {};
            try {
                data = JSON.parse(configStr);
            } catch (err) {
                console.warn("Failed to load config:", err);
            }

            this.config = util.mergeDeep({}, defaultConfig, data);

            this.checkUpgradeConfig();
            this.onModified();

            this.loaded = true;
        };

        let storedConfig = "{}";
        try {
            storedConfig = localStorage.getItem("torn_config")!;
        } catch (err) {
            this.localStorageAvailable = false;
            console.warn(err);
        }

        onLoaded(storedConfig);
    }

    store(): void {
        const strData = JSON.stringify(this.config);
        if (this.localStorageAvailable) {
            // In browsers like Safari, localStorage setItem is disabled in private browsing mode.
            // This try / catch addresses such a situation.
            try {
                localStorage.setItem("torn_config", strData);
            } catch (err) {
                console.warn("Failed writing config. Options will not be persistent.");
                console.warn(err);
            }
        }
    }

    set<T extends ConfigKey>(key: T, value: ConfigType[T]): void {
        // Sanity check.
        if (!key) return;

        // This is incorrect typing on so many levels.
        // Need to update the method signature.
        const path = key.split(".");

        let el: unknown = this.config;
        while (path.length > 1) el = (el as ConfigType)[path.shift() as T];

        (el as Record<string, unknown>)[path.shift()!] = value;

        this.store();
        this.onModified(key);
    }

    get<T extends ConfigKey>(key: T): ConfigType[T] | undefined {
        if (!key) return undefined;

        // The method signature is also incorrect for this.
        const path = key.split(".");

        let el: unknown = this.config;
        for (let i = 0; i < path.length; i++) el = (el as ConfigType)[path[i] as T];

        return el as ConfigType[T] | undefined;
    }

    addModifiedListener(e: (key?: string) => void): void {
        this.onModifiedListeners.push(e);
    }

    onModified(key?: string): void {
        for (let i = 0; i < this.onModifiedListeners.length; i++) this.onModifiedListeners[i](key);
    }

    checkUpgradeConfig(): void {
        // TODO: Implement this.
    }
}

export type ConfigType = typeof defaultConfig;
export type ConfigKey = keyof ConfigType;
