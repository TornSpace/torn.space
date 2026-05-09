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

import { Team } from "../constants";
import { DefinitionList } from "../utils/DefinitionList";

export interface BaseDef {
    readonly type: "base";
    /**
     * The team the base belongs to.
     */
    team: Team;
    /**
     * The world sprite of the base.
     * @default ""
     */
    worldImg: string;
    /**
     * The map sprite of the base.
     * @default ""
     */
    mapImg: string;
}

const rawDefs = {
    [`${Team.Human}`]: {
        type: "base",
        team: Team.Human,
        worldImg: "humanBase.img",
        mapImg: "humanMapBase.img"
    },
    [`${Team.Alien}`]: {
        type: "base",
        team: Team.Alien,
        worldImg: "alienBase.img",
        mapImg: "alienMapBase.img"
    },
    [`${Team.Cyborg}`]: {
        type: "base",
        team: Team.Cyborg,
        worldImg: "cyborgBase.img",
        mapImg: "cyborgMapBase.img"
    }
} satisfies Record<string, BaseDef>;

export type BaseDefKey = keyof typeof rawDefs;

export const BaseDefs = new DefinitionList<BaseDefKey, BaseDef>(rawDefs);
