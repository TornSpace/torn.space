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

import { zValidator } from "@hono/zod-validator";
import { ZodType } from "zod";

import { getIP, TokenBucketLimiter } from "./utils";

import { App } from "../app";

import type { Context } from "hono";
import type { Next, ValidationTargets } from "hono/types";

/**
 * Guarantees that the PostgreSQL database connection exists.
 * @param c The context of the request.
 * @param next The request callback.
 * @param app The primary Hono application.
 */
export async function CachingGuard(c: Context, next: Next, app: App): Promise<void> {
    if (app.redis !== undefined) {
        c.text("The caching module is not enabled.", 503);
        return;
    }

    await next();
}

/**
 * Guarantees that the PostgreSQL database connection exists.
 * @param c The context of the request.
 * @param next The request callback.
 * @param app The primary Hono application.
 */
export async function DatabaseGuard(c: Context, next: Next, app: App): Promise<void> {
    if (app.db === undefined) {
        c.text("The database module is not enabled.", 503);
        return;
    }

    await next();
}

/**
 * Guarantees that the PostgreSQL database connection exists.
 * @param c The context of the request.
 * @param next The request callback.
 * @param app The primary Hono application.
 */
export async function ProxyCheckGuard(c: Context, next: Next, app: App): Promise<void> {
    if (app.proxyCheckAPI === undefined) {
        c.text("The anti-VPN module is not enabled.", 503);
        return;
    }

    await next();
}

/**
 * Rate limiter middleware.
 * @param limit The maximum number of requests in a given timeframe.
 * @param interval The timeframe (in milliseconds).
 */
export function RateLimiter(limit: number, interval: number): (c: Context, next: Next) => Promise<void> {
    const rateLimiter = new TokenBucketLimiter(limit, limit / interval);
    return async function (c: Context, next: Next) {
        const ip = getIP(c);

        if (!ip) {
            c.text("Bad Request", 400); // Could also return a 50x here. Will need to revisit this in the future.
            return;
        }

        if (!rateLimiter.consume(ip)) {
            c.text("Too Many Requests", 429);
            return;
        }

        await next();
    };
}

/**
 * Validate a request for a given schema.
 * @param type The target type.
 * @param schema The Zod schema.
 */
// oxlint-disable-next-line typescript/explicit-function-return-type
export function Validator<Schema extends ZodType, Target extends keyof ValidationTargets>(
    type: Target,
    schema: Schema
) {
    return zValidator(type, schema, (res, c) => {
        if (!res.success) {
            c.text("Bad Request", 400);
        }
    });
}
