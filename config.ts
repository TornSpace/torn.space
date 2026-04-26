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

import { parse, stringify } from "hjson";

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { util } from "./common/src/utils/util";

import type { Config, PartialConfig } from "./config.d";

const CONFIG_FILENAME = "config.hjson";

export function getConfig(isProd: boolean, dir: string): Config {
    const config: Config = {
        api: {
            host: "0.0.0.0",
            port: 8080
        },
        gameServer: {
            host: "0.0.0.0",
            port: 8081,
            apiUrl: "127.0.0.1:8080"
        },
        vite: {
            host: "127.0.0.1",
            port: 3000
        },
        tps: 120,
        ups: 60,
        logging: {
            info: true,
            debug: !isProd,
            warn: true,
            error: true,
            timestamp: true
        },
        database: {
            enabled: true,
            host: "127.0.0.1",
            user: "torn",
            password: "torn",
            database: "torn",
            port: 5432
        },
        secrets: {
            TORN_API_KEY: "",
            TORN_EMAIL_SECRET: "",
            TORN_IP_SECRET: ""
        },
        caching: {
            enabled: false,
            connectionString: "127.0.0.1:6379",
            prefix: "TORN"
        },
        rateLimitsEnabled: isProd
    };

    const configPath = join(import.meta.dirname, dir, CONFIG_FILENAME);

    let localConfig: PartialConfig = {};

    if (existsSync(configPath)) {
        console.log(`Sourcing config ${configPath}...`);
        const configText = readFileSync(configPath, "utf-8");
        localConfig = parse(configText);
    } else {
        console.log("Config file doesn't exist, creating...");
        localConfig = {
            secrets: {
                TORN_API_KEY: randomBytes(64).toString("base64"),
                TORN_EMAIL_SECRET: randomBytes(32).toString("base64"),
                TORN_IP_SECRET: randomBytes(32).toString("base64")
            }
        };

        writeFileSync(configPath, stringify(localConfig, { bracesSameLine: true }));
    }

    util.mergeDeep(config, localConfig);

    if (!config.gameServer.apiUrl) config.gameServer.apiUrl = `http://${config.api.host}:${config.api.port}`;

    return config;
}

export function saveConfig(dir: string, config: PartialConfig): void {
    try {
        const configPath = join(import.meta.dirname, dir, CONFIG_FILENAME);
        const configText = readFileSync(configPath, "utf-8");
        const localConfig = parse(configText);

        const finalConfig = util.mergeDeep({}, localConfig, config);

        writeFileSync(configPath, stringify(finalConfig, { bracesSameLine: true }));
        console.log("Saved config file.");
    } catch (err) {
        console.error("Failed to save config:", err);
    }
}
