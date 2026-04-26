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

import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";

import { app } from "../../app";
import { config } from "../../config";
import { CachingGuard, ProxyCheckGuard, Validator } from "../../utils/middleware";
import { hashIp } from "../../utils/utils";

const checkSchema = z.object({
    ip: z.union([z.ipv4(), z.ipv6()])
});

/**
 * Todo: bearer auth for game servers.
 */
const Router = new Hono()
    .use(async (c, next) => ProxyCheckGuard(c, next, app))
    .use(async (c, next) => CachingGuard(c, next, app));

Router.on("GET", "/check", bearerAuth({ token: config.secrets.TORN_API_KEY }));

Router.get("/check", Validator("query", checkSchema), async c => {
    const { ip } = c.req.valid("query");

    const decodedIp = decodeURIComponent(ip); // TODO: Check if this is actually needed.
    const encodedIp = hashIp(decodedIp);

    const cachedRes = app.proxyCheckCache.get(encodedIp);
    if (cachedRes !== undefined && cachedRes.expiresAt > Date.now()) return c.json({ flagged: cachedRes.flagged });

    try {
        const res = await app.proxyCheckAPI.checkIP(decodedIp);
        if (res.status === "ok") {
            const flagged = res[decodedIp].proxy === "yes" || res[decodedIp].vpn === "yes";
            app.proxyCheckCache.set(encodedIp, {
                flagged,
                expiresAt: Date.now() + 864e5 // 1 day.
            });

            return c.json({ flagged });
        } else if (res.status === "warning") app.logger.warn("ProxyCheckAPI", res);
        else app.logger.error("ProxyCheckAPI", res);
    } catch (err) {
        app.logger.error("ProxyCheckAPI", err);
    }

    /**
     * By default, allow IPs if ProxyCheck API encounters some error.
     */
    return c.json({ flagged: false });
});

export default Router;
