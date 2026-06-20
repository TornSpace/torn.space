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

import { RedisClient, SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { Hono } from "hono";
import ProxyCheck from "proxycheck-ts";

import { config } from "./config.ts";
import { Punishment } from "./models/Punishment.ts";
import { User } from "./models/User.ts";

import type { Guild } from "./models/Guild.ts";
import type { PgTable } from "drizzle-orm/pg-core";

import { Logger } from "@/common/utils/Logger.ts";

interface DrizzleSchema extends Record<string, PgTable> {
    guild: typeof Guild;
    punishment: typeof Punishment;
    user: typeof User;
}

interface ProxyCheckCacheEntry {
    flagged: boolean;
    expiresAt: number;
}

/**
 * Exposes other classes to the rest of the project.
 */
export class App extends Hono {
    logger: Logger;

    /**
     * @todo Add type guards to check if the individual modules are enabled, and then assert the type.
     * For now, temporary NNA. This, however, is not the best DX.
     */
    db!: ReturnType<typeof drizzle<DrizzleSchema>>;
    redis!: RedisClient;
    proxyCheckAPI!: ProxyCheck;

    /**
     * Hot (memory) caches for various tools.
     */
    proxyCheckCache = new Map<string, ProxyCheckCacheEntry>();
    serverCache = new Map<string, { players: number; expiresAt: number }>();

    constructor() {
        super();

        this.logger = new Logger(config.logging);

        // Instantiate the PostgreSQL database.
        if (config.database.enabled) {
            const client = new SQL(
                `postgresql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`,
                {
                    onconnect: (): void => {
                        this.logger.info("PostgreSQL", "Connected to database.");
                    },
                    onclose: (err): void => {
                        this.logger.error("PostgreSQL", err ? (err.stack ?? err.message) : "No stacktrace provided.");
                    }
                }
            );

            this.db = drizzle<DrizzleSchema>({ client });
        }

        // Instantiate the redis connection.
        if (config.caching.enabled) {
            this.redis = new RedisClient(config.caching.connectionString);

            this.redis.onconnect = (): void => {
                this.logger.info("Redis", "Connected to caching database.");
            };

            this.redis.onclose = (err): void => {
                this.logger.error("Redis", err);
            };

            /**
             * Might move these to other function to make it look prettier. But not currently sure.
             */
            void this.redis.connect().then(this.loadProxyCache);
            setInterval(this.updateProxyCache, 36e5);
        }

        // Instantiate the ProxyCheck API.
        if (config.secrets.PROXYCHECK_KEY) {
            this.proxyCheckAPI = new ProxyCheck({ api_key: config.secrets.PROXYCHECK_KEY });
        }

        /**
         * Generic error handling. This is not a "solution" for handling errors. Please appropriately handle errors when
         * you can. This just exists to gracefully return a response to the request initiator.
         */
        this.onError((err, c) => {
            this.logger.error("Hono", err.stack ?? err);
            return c.text("Internal Server Error", 500);
        });
    }

    /**
     * Get the value of a cache key.
     * @param key The key, absent of any prefix.
     */
    getCacheKey(key: string): Promise<string | null> {
        return this.redis.get(`${config.caching.prefix}/${key}`);
    }

    /**
     * Set the value of a cache key.
     * @param key The key, absent of any prefix.
     */
    setCacheKey(key: string, value: string): Promise<"OK"> {
        return this.redis.set(`${config.caching.prefix}/${key}`, value);
    }

    /**
     * Load cold proxy cache.
     */
    async loadProxyCache(): Promise<void> {
        const proxyCheckCache = await this.getCacheKey("proxyCheckCache");
        if (proxyCheckCache) {
            try {
                for (const [key, value] of Object.entries(
                    JSON.parse(proxyCheckCache) as Record<string, ProxyCheckCacheEntry>
                )) {
                    this.proxyCheckCache.set(key, value);
                }
            } catch (err) {
                this.logger.error("Redis", err);
            }
        }
    }

    /**
     * Update cold proxy cache.
     */
    async updateProxyCache(): Promise<void> {
        try {
            const proxyCheckCache = Object.fromEntries(this.proxyCheckCache);
            await this.setCacheKey("proxyCheckCache", JSON.stringify(proxyCheckCache));
        } catch (err) {
            this.logger.error("Redis", err);
        }
    }
}

export const app = new App();
