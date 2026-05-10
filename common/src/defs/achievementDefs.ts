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

import { DefinitionList } from "../utils/DefinitionList";

import type { Trail } from "../constants";

export interface AchievementDef {
    readonly type: "achievement";
    /**
     * The trail this achievement counts towards. Also doubles as the subtype.
     */
    trail: Trail;
    /**
     * The color of this achevement.
     */
    color: number;
}

const rawDefs = {} satisfies Record<string, AchievementDef>;

export type AchievementDefKey = keyof typeof rawDefs;

export const AchievementDefs = new DefinitionList<AchievementDefKey, AchievementDef>(rawDefs);
