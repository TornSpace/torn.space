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

import { math } from "./math.ts";
import { v2, type Vec2 } from "./v2.ts";

export type IntersectionResponse = { normal: Vec2; pen: number } | null;
export type LineIntersection = { point: Vec2; normal: Vec2 } | null;

export const collision = {
    /**
     * Check whether two circles collide.
     * @param a The center of the first circle.
     * @param ar The radius of the first circle.
     * @param b The center of the second circle.
     * @param br The radius of the second circle.
     */
    checkCircleCircle(a: Vec2, ar: number, b: Vec2, br: number): boolean {
        return (ar + br) * (ar + br) >= v2.distanceSq(a, b);
    },

    // TODO: Redo everything onward.

    /**
     * Check whether a rectangle and a circle collide.
     * @param min The minimum bounds of the rectangle.
     * @param max The maximum bounds of the rectangle.
     * @param pos The center of the circle.
     * @param rad The radius of the circle.
     */
    checkRectCircle(min: Vec2, max: Vec2, pos: Vec2, rad: number): boolean {
        const cpt = {
            x: math.clamp(pos.x, min.x, max.x),
            y: math.clamp(pos.y, min.y, max.y)
        };

        return (
            v2.distanceSq(pos, cpt) < rad * rad ||
            (pos.x >= min.x && pos.x <= max.x && pos.y >= min.y && pos.y <= max.y)
        );
    },

    /**
     * Check whether two rectangles collide.
     * @param aMin The min vector of the first rectangle.
     * @param aMax The max vector of the first rectangle.
     * @param bMin The min vector of the second rectangle.
     * @param bMax The max vector of the second rectangle.
     */
    checkRectRect(aMin: Vec2, aMax: Vec2, bMin: Vec2, bMax: Vec2): boolean {
        return bMin.x < aMax.x && bMin.y < aMax.y && aMin.x < bMax.x && aMin.y < bMax.y;
    },

    /**
     * Checks if a line intersects another line.
     * @param a0 An endpoint of the first line.
     * @param a1 The other endpoint of the first line.
     * @param b0 An endpoint of the second line.
     * @param b1 The other endpoint of the second line.
     */
    lineIntersectsLine(a0: Vec2, a1: Vec2, b0: Vec2, b1: Vec2): Vec2 | null {
        const x1 = math.signedAreaTri(a0, a1, b1);
        const x2 = math.signedAreaTri(a0, a1, b0);

        if (x1 !== 0 && x2 !== 0 && x1 * x2 < 0) {
            const x3 = math.signedAreaTri(b0, b1, a0);
            const x4 = x3 + x2 - x1;

            if (x3 * x4 < 0) {
                const t = x3 / (x3 - x4);
                return v2.add(a0, v2.mult(v2.sub(a1, a0), t));
            }
        }

        return null;
    },

    /**
     * Checks if a line intersects a circle
     * @param s0 The start of the line
     * @param s1 The end of the line
     * @param pos The position of the circle
     * @param rad The radius of the circle
     * @returns An intersection response with the intersection position and normal Vectors, returns null if they don't intersect
     */
    lineIntersectsCircle(s0: Vec2, s1: Vec2, pos: Vec2, rad: number): LineIntersection {
        let d = v2.sub(s1, s0);

        const len = math.max(v2.length(d), 0.000001);
        d = v2.div(d, len);

        const m = v2.sub(s0, pos);
        const b = v2.dot(m, d);
        const c = v2.dot(m, m) - rad * rad;

        if (c > 0 && b > 0.0) return null;

        const discSq = b * b - c;
        if (discSq < 0) return null;

        const disc = Math.sqrt(discSq);
        let t = -b - disc;

        if (t < 0) t = -b + disc;
        if (t <= len) {
            const point = v2.add(s0, v2.mult(d, t));
            return {
                point,
                normal: v2.normalize(v2.sub(point, pos))
            };
        }

        return null;
    },

    /**
     * Checks if a line intersects a rectangle
     * @param s0 The start of the line
     * @param s1 The end of the line
     * @param min The min Vector of the rectangle
     * @param max The max Vector of the rectangle
     * @returns An intersection response with the intersection position and normal Vectors, returns null if they don't intersect
     */
    lineIntersectsRect(s0: Vec2, s1: Vec2, min: Vec2, max: Vec2): LineIntersection {
        let tmin = 0;
        let tmax = Number.MAX_VALUE;

        const eps = 0.00001;
        const r = s0;

        let d = v2.sub(s1, s0);
        const dist = v2.length(d);

        d = dist > eps ? v2.div(d, dist) : v2.new(1, 0);

        let absDx = Math.abs(d.x);
        let absDy = Math.abs(d.y);

        if (absDx < eps) {
            d.x = eps * 2;
            absDx = d.x;
        }

        if (absDy < eps) {
            d.y = eps * 2;
            absDy = d.y;
        }

        if (absDx > eps) {
            const tx1 = (min.x - r.x) / d.x;
            const tx2 = (max.x - r.x) / d.x;

            tmin = math.max(tmin, math.min(tx1, tx2));
            tmax = math.min(tmax, math.max(tx1, tx2));

            if (tmin > tmax) return null;
        }

        if (absDy > eps) {
            const ty1 = (min.y - r.y) / d.y;
            const ty2 = (max.y - r.y) / d.y;

            tmin = math.max(tmin, math.min(ty1, ty2));
            tmax = math.min(tmax, math.max(ty1, ty2));

            if (tmin > tmax) return null;
        }

        if (tmin > dist) return null;

        // Hit.
        const point = v2.add(s0, v2.mult(d, tmin));

        // Intersection normal.
        const c = v2.add(min, v2.mult(v2.sub(max, min), 0.5));
        const p0 = v2.sub(point, c);
        const d0 = v2.mult(v2.sub(min, max), 0.5);

        const x = (p0.x / Math.abs(d0.x)) * 1.001;
        const y = (p0.y / Math.abs(d0.y)) * 1.001;

        const normal = v2.normalizeSafe(
            {
                x: x < 0 ? Math.ceil(x) : Math.floor(x),
                y: y < 0 ? Math.ceil(y) : Math.floor(y)
            },
            v2.new(1, 0)
        );

        return {
            point,
            normal
        };
    },

    /**
     * Checks if circle intersects another circle
     * @param pos0 The position of the first circle
     * @param rad0 The radius of the first circle
     * @param pos1 The position of the second circle
     * @param rad1 The radius of the second circle
     * @returns An intersection response with the intersection normal and penetration returns null if they don't intersect
     */
    circleCircleIntersection(pos0: Vec2, rad0: number, pos1: Vec2, rad1: number): IntersectionResponse {
        const r = rad0 + rad1;
        const toP1 = v2.sub(pos1, pos0);

        const distSqr = v2.lengthSq(toP1);
        if (distSqr < r * r) {
            const dist = Math.sqrt(distSqr);
            return {
                normal: dist > 0.00001 ? v2.div(toP1, dist) : v2.new(1.0, 0.0),
                pen: r - dist
            };
        }

        return null;
    },

    /**
     * Checks if circle intersects a rectangle
     * @param min The min Vector of the rectangle
     * @param max The max Vector of the rectangle
     * @param pos The position of the circle
     * @param radius The radius of the circle
     * @returns An intersection response with the intersection normal and penetration returns null if they don't intersect
     */
    rectCircleIntersection(min: Vec2, max: Vec2, pos: Vec2, radius: number): IntersectionResponse {
        if (pos.x >= min.x && pos.x <= max.x && pos.y >= min.y && pos.y <= max.y) {
            const e = v2.mult(v2.sub(max, min), 0.5);
            const c = v2.add(min, e);
            const p = v2.sub(pos, c);

            const xp = Math.abs(p.x) - e.x - radius;
            const yp = Math.abs(p.y) - e.y - radius;

            if (xp > yp) {
                return {
                    normal: v2.new(p.x > 0.0 ? 1.0 : -1.0, 0.0),
                    pen: -xp
                };
            }

            return {
                normal: v2.new(0.0, p.y > 0.0 ? 1.0 : -1.0),
                pen: -yp
            };
        }

        const cpt = v2.new(math.clamp(pos.x, min.x, max.x), math.clamp(pos.y, min.y, max.y));
        const dir = v2.sub(pos, cpt);

        const dstSqr = v2.lengthSq(dir);
        if (dstSqr < radius * radius) {
            const dst = Math.sqrt(dstSqr);
            return {
                normal: dst > 0.0001 ? v2.div(dir, dst) : v2.new(1.0, 0.0),
                pen: radius - dst
            };
        }

        return null;
    },

    /**
     * Checks if a rectangle intersects a rectangle
     * @param min The min Vector of the first rectangle
     * @param max The max vector of the first rectangle
     * @param min2 The min Vector of the second rectangle
     * @param max2 The max vector of the second rectangle
     * @returns An intersection response with the intersection normal and penetration, returns null if they don't intersect
     */
    rectRectIntersection(min0: Vec2, max0: Vec2, min1: Vec2, max1: Vec2): IntersectionResponse {
        const e0 = v2.mult(v2.sub(max0, min0), 0.5);
        const c0 = v2.add(min0, e0);
        const e1 = v2.mult(v2.sub(max1, min1), 0.5);
        const c1 = v2.add(min1, e1);

        const n = v2.sub(c1, c0);
        const xo = e0.x + e1.x - Math.abs(n.x);

        if (xo > 0.0) {
            const yo = e0.y + e1.y - Math.abs(n.y);
            if (yo > 0.0) {
                if (xo > yo) {
                    return {
                        normal: n.x < 0.0 ? v2.new(-1.0, 0.0) : v2.new(1.0, 0.0),
                        pen: xo
                    };
                }

                return {
                    normal: n.y < 0.0 ? v2.new(0.0, -1.0) : v2.new(0.0, 1.0),
                    pen: yo
                };
            }
        }

        return null;
    }
};
