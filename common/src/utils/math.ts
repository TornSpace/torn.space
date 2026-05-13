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

import type { Vec2 } from "./v2";

export const math = {
    /**
     * {@link Math.min()} for two arguments.
     * @param a The first number,
     * @param b The second number,
     * @returns The minimum of the two numbers.
     */
    min(a: number, b: number): number {
        return a < b ? a : b;
    },

    /**
     * {@link Math.max()} for two arguments.
     * @param a The first number,
     * @param b The second number,
     * @returns The maximum of the two numbers.
     */
    max(a: number, b: number): number {
        return a > b ? a : b;
    },

    /**
     * Clamp a number to the specified bounds.
     * @param a The number to clamp.
     * @param min The lower bound.
     * @param max The upper bound.
     */
    clamp(a: number, min: number, max: number): number {
        return a > max ? max : a < min ? min : a;
    },

    /**
     * Linearly interpolate from `a` to `b` by a factor `t`.
     * @param t The interpolation factor.
     * @param a The start vector.
     * @param b The end vector.
     */
    lerp(a: number, b: number, t: number): number {
        return a * (1.0 - t) + b * t;
    },

    /**
     * Unsigned modulo.
     * @param a The number to mod.
     * @param m The number to mod by.
     */
    mod(a: number, m: number): number {
        return ((a % m) + m) % m;
    },

    /**
     * Remap a number from one range to another.
     * @param v The value to remap.
     * @param a The initial range minimum value.
     * @param b The initial range maximum value.
     * @param x The targeted range minimum value.
     * @param y The targeted range maximum value.
     */
    remap(v: number, a: number, b: number, x: number, y: number): number {
        const t = math.clamp((v - a) / (b - a), 0.0, 1.0);
        return math.lerp(x, y, t);
    },

    /**
     * Convert an angle from degrees to radians.
     * @param deg The angle, in degrees.
     * @returns The angle in radians.
     */
    degToRad(deg: number): number {
        return (deg / 180) * Math.PI;
    },

    /**
     * Convert an angle from radians to degrees.
     * @param deg The angle, in radians.
     * @returns The angle in degrees.
     */
    radToDeg(rad: number): number {
        return (rad / Math.PI) * 180;
    },

    signedAreaTri(a: Vec2, b: Vec2, c: Vec2): number {
        return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
    }
};
