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

import type { Vec2 } from "./v2.ts";

/**
 * Common functions and utilities.
 */
export const util = {
    daysToMs(days: number): number {
        const dayInMs = 24 * 60 * 60 * 1000;
        return days * dayInMs;
    },

    /**
     * @link https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
     */
    // oxlint-disable-next-line typescript/explicit-function-return-type
    isObject(item: unknown) {
        return item && (typeof item === "undefined" ? "undefined" : typeof item) === "object" && !Array.isArray(item);
    },

    /**
     * @param target The object to merge all other objects into.
     * @param sources The objects to be merged.
     * @link https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
     */
    mergeDeep(target: any, ...sources: any[]): any {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.mergeDeep(target, ...sources);
    },

    /**
     * Convert a sector to string representation.
     * @param sector The sector vector.
     */
    sectorToString(sector: Vec2): string {
        return `${String.fromCharCode(65 + sector.x)}${sector.y + 1}`;
    }
};

/**
 * Used in custom assert function.
 * @author leia-uwu
 * @link https://github.com/survev/survev/blob/master/shared/utils/util.ts
 */
export class AssertionError extends Error {
    name = "AssertionError";
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);

        // @ts-ignore this was v8 / nodejs specific but firefox now also supports it
        // what it does is remove the `assert` call from the stack trace
        // typescript types for it only exist on @types/node so cant use ts-expect-error without
        // it failing on the server
        Error.captureStackTrace?.(this, assert);
    }
}

/**
 * Custom assert function to avoid bundling Node.js polyfill with the client.
 * @author leia-uwu
 * @link https://github.com/survev/survev/blob/master/shared/utils/util.ts
 */
export function assert(value: unknown, message?: string | Error): asserts value {
    if (!value) {
        const error = message instanceof Error ? message : new AssertionError(message ?? "Assertion failed");
        throw error;
    }
}

// oxfmt-ignore
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
