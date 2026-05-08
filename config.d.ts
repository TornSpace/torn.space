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

interface ServerConfig {
    /**
     * The network interface(s) to bind to. `0.0.0.0` binds to all interfaces.
     * @default "0.0.0.0"
     */
    host: string;
    /**
     * The port to run the server on.
     */
    port: number;
    /**
     * A custom header in which the IP is determined from. When not specified, uses the request IP.
     *
     * You should only use `X-Forwarded-For` if you know what you are doing. Remember, custom headers can be
     * {@link https://owasp.org/www-community/pages/attacks/ip_spoofing_via_http_headers|spoofed} easily.
     */
    proxyHeader?: string;
    /**
     * SSL file paths. Not recommended, use a proxy like {@link https://nginx.org/|NGINX} instead.
     */
    ssl?: {
        key: string;
        cert: string;
    };
}

export interface Config {
    /**
     * API server configuration.
     */
    api: ServerConfig;
    /**
     * Game server configuration.
     */
    gameServer: ServerConfig & { apiUrl: string };
    /**
     * Vite dev server configuration.
     */
    vite: {
        /**
         * The network interface(s) to bind to. `0.0.0.0` binds to all interfaces.
         * @default "127.0.0.1"
         */
        host: string;
        /**
         * The port to run the dev server on.
         * @default 3000
         */
        port: number;
    };

    /**
     * Game & API server logging configurations
     */
    logging: {
        /**
         * Whether to log the current timestamp. Useful to disable if a timestamp is already prepended to logs (i.e.
         * `journalctl`).
         */
        timestamp: boolean;
        /**
         * Whether to log informative messages.
         * @default true
         */
        info: boolean;
        /**
         * Whether to log `debug` information. Default enabled on development, disabled otherwise.
         */
        debug: boolean;
        /**
         * Whether to log warnings.
         * @default true
         */
        warn: boolean;
        /**
         * Whether to log errors. In production, these are sent to the server / client webhooks if available.
         * @default true
         */
        error: boolean;
        /**
         * Webhook to log client errors.
         */
        clientWebhook?: string;
        /**
         * Webhook to log API + gameserver errors.
         */
        serverWebhook?: string;
    };
    /**
     * PostgreSQL database for account storage.
     */
    database: {
        /**
         * Whether to enable database support. Disabling this will cause all database-related API routes to return a `503`.
         * @default false
         */
        enabled: boolean;
        /**
         * @default "127.0.0.1"
         */
        host: string;
        /**
         * @default "torn"
         */
        user: string;
        /**
         * @default "torn"
         */
        password: string;
        /**
         * @default "torn"
         */
        database: string;
        /**
         * @default 5432
         */
        port: number;
    };
    /**
     * API keys
     */
    secrets: {
        /**
         * API key used to communicate from API to game servers.
         */
        TORN_API_KEY: string;
        /**
         * API key used to communicate from game servers to API.
         */
        TORN_GS_KEY: string;
        /**
         * Used to encode IPs before inserting them into the database.
         */
        TORN_IP_SECRET: string;
        /**
         * Discord bot token for moderation and leaderboard roles.
         */
        DISCORD_BOT_TOKEN?: string;
        /**
         * Enables {@link https://proxycheck.io|proxycheck.io} for VPN / proxy blacklist.
         */
        PROXYCHECK_KEY?: string;
    };
    /**
     * Caching expensive requests.
     */
    caching: {
        /**
         * Enables using Redis for caching.
         * @default false
         */
        enabled: boolean;
        /**
         * Connection string.
         * @default "127.0.0.1:6379"
         */
        connectionString: string;
        /**
         * Prefix to use when setting and retrieving keys.
         * @default "TORN"
         */
        prefix: string;
    };
    /**
     * Enables IP ratelimiting. Enabled by default on production, disabled otherwise.
     */
    rateLimitsEnabled: boolean;
    /**
     * Game tick rate.
     * @default 120
     */
    tps: number;
    /**
     * Update packet rate.
     * @default 60
     */
    ups: number;
    /**
     * Allow the game server to send client debug information.
     * @default false
     */
    allowDebugging: boolean;
}

export type PartialConfig = DeepPartial<ConfigType>;
