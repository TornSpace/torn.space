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

export interface LootDef {
    readonly type: "loot";
    /**
     * The specific type of loot.
     */
    subtype: "ammo" | "life" | "money" | "package";
    /**
     * The loot image.
     */
    image: string;
}

const rawDefs = {
    ammo: {
        type: "loot",
        subtype: "ammo",
        image: "ammo.img"
    },
    life: {
        type: "loot",
        subtype: "life",
        image: "life.img"
    },
    money: {
        type: "loot",
        subtype: "money",
        image: "money.img"
    },
    package: {
        type: "loot",
        subtype: "package",
        image: "package.img"
    }
} satisfies Record<string, LootDef>;

export type LootDefKey = keyof typeof rawDefs;

export const LootDefs = new DefinitionList<LootDefKey, LootDef>(rawDefs);
