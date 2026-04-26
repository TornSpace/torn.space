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

export type Vector = Record<"x" | "y", number>;

export const Vec2 = {
    /**
     * Set vector `a` to be equivalent to vector `b`.
     *
     * @param a The target vector.
     * @param b The source vector.
     */
    set(a: Vector, b: Vector): void {
        a.x = b.x;
        a.y = b.y;
    }
};
