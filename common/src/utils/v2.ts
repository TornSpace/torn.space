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

import { math } from "./math";

export type Vec2 = Record<"x" | "y", number>;

export const v2 = {
    /**
     * Create a new `Vec2`.
     * @param x The x component.
     * @param y The y component. If unspecified, defaults to the x component.
     */
    new(x: number, y?: number): Vec2 {
        return { x, y: y ?? x };
    },

    /**
     * Clone an existing `Vec2`.
     * @param a The vector to clone.
     */
    clone(a: Vec2): Vec2 {
        return v2.new(a.x, a.y);
    },

    /**
     * Set vector `a` to be equivalent to vector `b`.
     * @param a The target vector.
     * @param b The source vector.
     */
    set(a: Vec2, b: Vec2): void {
        a.x = b.x;
        a.y = b.y;
    },

    /**
     * Adds two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    add(a: Vec2, b: Vec2): Vec2 {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        };
    },

    /**
     * Subtracts vector `b` from `a`.
     * @param a The vector to subtract from.
     * @param b The vector to subtract.
     */
    sub(a: Vec2, b: Vec2): Vec2 {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        };
    },

    /**
     * Multiply vector `a` by a scalar `s`.
     * @param a The vector to multiply.
     * @param s The scalar to multiply by.
     */
    mult(a: Vec2, s: number): Vec2 {
        return {
            x: a.x * s,
            y: a.y * s
        };
    },

    /**
     * Divide vector `a` by a scalar `s`.
     * @param a The vector to divide.
     * @param s The scalar to divide by.
     */
    div(a: Vec2, s: number): Vec2 {
        return {
            x: a.x / s,
            y: a.y / s
        };
    },

    /**
     * Give the inverse of vector `a`.
     * @param a The vector to invert.
     */
    inv(a: Vec2): Vec2 {
        return {
            x: -a.x,
            y: -a.y
        };
    },

    /**
     * Compute the length of a vector.
     * @param a The vector to use.
     */
    length(a: Vec2): number {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    },

    /**
     * Compute the squared length of a vector.
     * @param a The vector to use.
     */
    lengthSq(a: Vec2): number {
        return a.x * a.x + a.y * a.y;
    },

    /**
     * Resize a vector such that its length is equivalent to 1. This is achieved by dividing each component by the
     * magnitude of the original vector.
     * @param a The vector to normalize.
     */
    normalize(a: Vec2): Vec2 {
        const eps = 0.000001;
        const len = v2.length(a);

        return {
            x: len > eps ? a.x / len : a.x,
            y: len > eps ? a.y / len : a.y
        };
    },

    /**
     * Resize a vector such that its length is equivalent to 1. This is achieved by dividing each component by the
     * magnitude of the original vector.
     *
     * The advantage this method has over the previous {@link v2.normalize|normalize} function is that it avoids dividing
     * by numbers close to 0. This ensures that you do not end up with `Infinity` as a result.
     * @param a The vector to normalize.
     * @param v The fallback vector.
     */
    normalizeSafe(a: Vec2, v = { x: 1.0, y: 0.0 }): Vec2 {
        const eps = 0.000001;
        const len = v2.length(a);
        return {
            x: len > eps ? a.x / len : v.x,
            y: len > eps ? a.y / len : v.y
        };
    },

    /**
     * Compute the distance between two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    distance(a: Vec2, b: Vec2): number {
        const delta = v2.sub(a, b);
        return v2.length(delta);
    },

    /**
     * Compute the distance squared between two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    distanceSq(a: Vec2, b: Vec2): number {
        const delta = v2.sub(a, b);
        return v2.lengthSq(delta);
    },

    /**
     * Compute the {@link https://en.wikipedia.org/wiki/Taxicab_geometry|Manhattan distance} between two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    manhattanDistance(a: Vec2, b: Vec2): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    },

    /**
     * Find the midpoint between two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    midpoint(a: Vec2, b: Vec2): Vec2 {
        return {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2
        };
    },

    /**
     * Find the dot product of two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    dot(a: Vec2, b: Vec2): number {
        return a.x * b.x + a.y * b.y;
    },

    /**
     * Find a vector orthogonal to the specified vector.
     * @param a The source vector.
     * @param negator Which component to negate. Defaults to the x-component.
     */
    ortho(a: Vec2, method: 0 | 1 = 0): Vec2 {
        return method === 1 ? { x: a.y, y: -a.x } : { x: -a.y, y: a.x };
    },

    /**
     * Find a vector orthogonal to the specified vector.
     * @param a The vector to project.
     * @param b The vector to project onto.
     */
    project(a: Vec2, b: Vec2): Vec2 {
        return v2.mult(b, v2.dot(a, b) / v2.lengthSq(b));
    },

    /**
     * Rotate a vector by an angle.
     * @param a The vector to rotate.
     * @param theta The angle, in radians.
     */
    rotate(a: Vec2, theta: number): Vec2 {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        return {
            x: a.x * cosTheta - a.y * sinTheta,
            y: a.x * sinTheta + a.y * cosTheta
        };
    },

    /**
     * Multiply the components of two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    mulComp(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x * b.x, y: a.y * b.y };
    },

    /**
     * Divide the components of vector `a` by the components of vector `b`.
     * @param a The first vector.
     * @param b The second vector.
     */
    divComp(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x / b.x, y: a.y / b.y };
    },

    /**
     * Obtain the minimum components of two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    minComp(a: Vec2, b: Vec2): Vec2 {
        return { x: math.min(a.x, b.x), y: math.min(a.y, b.y) };
    },

    /**
     * Obtain the maximum components of two vectors.
     * @param a The first vector.
     * @param b The second vector.
     */
    maxComp(a: Vec2, b: Vec2): Vec2 {
        return { x: math.max(a.x, b.x), y: math.max(a.y, b.y) };
    },

    /**
     * Linearly interpolate from vector `a` to vector `b` by a factor `t`.
     * @param a The start vector.
     * @param b The end vector.
     * @param t The interpolation factor.
     */
    lerp(a: Vec2, b: Vec2, t: number): Vec2 {
        return v2.add(v2.mult(a, 1.0 - t), v2.mult(b, t));
    },

    /**
     * Check if two vectors are equal to each other, within a certain sensitivity.
     * @param a The first vector.
     * @param b The second vector.
     * @param epsilon The accuracy by which to accept slight differences as "basically equal".
     */
    eq(a: Vec2, b: Vec2, epsilon = 0.0001): boolean {
        return Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon;
    },

    /**
     * Convert a vector to an angle in degrees.
     * @param v The vector to convert.
     * @returns An angle between `[0, 360]`.
     */
    toDegree(v: Vec2): number {
        return (v2.toRad(v) * 180) / Math.PI;
    },

    /**
     * Convert a vector to an angle in radians.
     * @param v The vector to convert.
     * @returns An angle between `[0, 2 * Math.PI]`.
     */
    toRad(v: Vec2): number {
        let angle = Math.atan2(v.y, v.x);

        if (angle < 0) angle += 2 * Math.PI;
        return angle;
    }
};
