import { Context } from "hono";
import { getConnInfo } from "hono/bun";

import { createHash } from "crypto";

import { config } from "../config";

/**
 * Token bucket limiter.
 */
export class TokenBucketLimiter<T = string> {
    /**
     * Token storage.
     */
    #buckets = new Map<T, { c: number; l: number }>();

    /**
     * Create a rate limiter.
     *
     * @param limit The maximum number of tokens in a given timeframe.
     * @param interval The interval at which tokens should restock.
     */
    constructor(
        private limit: number,
        private interval: number
    ) {}

    /**
     * Consume the token bucket. Additionally checks if the bucket is rate limited.
     *
     * @param key The unique identifier of the bucket.
     */
    consume(key: T): boolean {
        const bucket = this.#buckets.get(key);
        const now = Date.now();

        if (!bucket) {
            this.#buckets.set(key, {
                c: this.limit - 1,
                l: now
            });

            return true;
        }

        const refill = Math.floor((now - bucket.l) / this.interval);
        if (refill > 0) {
            bucket.c = Math.min(bucket.c + refill, this.limit);
            bucket.l = now;

            return true;
        }

        if (bucket.c < 1) {
            this.#buckets.set(key, bucket);
            return false;
        }

        --bucket.c;
        this.#buckets.set(key, bucket);

        return true;
    }
}

/**
 * Obtain the IP associated with a request.
 *
 * @param c The context of the request.
 */
export function getIP(c: Context): string | undefined {
    const ip = config.api.proxyHeader
        ? c.req.header(config.api.proxyHeader) // TODO: Fix failing on X-Forwarded-For.
        : getConnInfo(c).remote.address;

    /**
     * If statements perform better than nested ternary operators. We do no sanitation on the IP to make sure it is
     * legitimate. That is the responsibility of the server host.
     */
    if (!ip) return undefined;
    if (ip.includes("::ffff:")) return ip.split("::ffff:")[1];
    return ip;
}

/**
 * Hash an IP address.
 *
 * @param ip The IP address.
 */
export function hashIp(ip: string): string {
    return createHash("sha256")
        .update(config.secrets.TORN_IP_SECRET + ip)
        .digest("hex");
}

export function createPgEnum<T extends Record<string, any>>(tsEnum: T): [T[keyof T], ...Array<T[keyof T]>] {
    return Object.values(tsEnum).map(x => `${x}`) as any;
}
