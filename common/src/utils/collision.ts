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

import { v2, type Vec2 } from "./v2";

export const collision = {
    /**
     * Check if two circles intersect.
     * @param a The center of the first circle.
     * @param b The center of the second circle.
     * @param ar The radius of the first circle.
     * @param br The radius of the second circle.
     */
    circleCircle(a: Vec2, b: Vec2, ar: number, br: number): boolean {
        return (ar + br) * (ar + br) >= v2.distanceSq(a, b);
    }
};
