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

import { DefinitionList } from "../utils/DefinitionList.ts";

import type { Vec2 } from "../utils/v2.ts";

export interface AsteroidDef {
    readonly type: "asteroid";
    /**
     * The specific type of asteroid.
     */
    subtype: string;
    /**
     * The animation image.
     */
    image: string;
    /**
     * The hotspot sector for this asteroid.
     * Asteroid spawn rate will decrease linearly the further away from this sector they are.
     */
    hotspot: Vec2;
}

const rawDefs = {
    iron: {
        type: "asteroid",
        subtype: "iron",
        image: "iron",
        hotspot: {
            x: 0,
            y: 0
        }
    },
    silver: {
        type: "asteroid",
        subtype: "silver",
        image: "silver",
        hotspot: {
            x: 0,
            y: 0
        }
    },
    copper: {
        type: "asteroid",
        subtype: "copper",
        image: "copper",
        hotspot: {
            x: 0,
            y: 0
        }
    },
    platinum: {
        type: "asteroid",
        subtype: "platinum",
        image: "platinum",
        hotspot: {
            x: 0,
            y: 0
        }
    }
} satisfies Record<string, AsteroidDef>;

export type AsteroidDefKey = keyof typeof rawDefs;

export const AsteroidDefs = new DefinitionList<AsteroidDefKey, AsteroidDef>(rawDefs);
