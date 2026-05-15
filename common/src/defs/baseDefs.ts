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
     * The aura image to underlay the world image.
     * @default ""
     */
    auraImg: string;
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
    /**
     * Scale of the world image.
     * @default 1
     */
    worldImgScale: number;
    /**
     * Scale of the aura image.
     * @default 1
     */
    auraImgScale: number;
    /**
     * The text offset.
     */
    textOffset: number;
}

const rawDefs = {
    [`${Team.Human}`]: {
        type: "base",
        team: Team.Human,
        auraImg: "underlayBlue.img",
        worldImg: "humanBase.img",
        mapImg: "humanMapBase.img",
        auraImgScale: 4,
        worldImgScale: 1.5,
        textOffset: 1.25
    },
    [`${Team.Alien}`]: {
        type: "base",
        team: Team.Alien,
        auraImg: "underlayRed.img",
        worldImg: "alienBase.img",
        mapImg: "alienMapBase.img",
        auraImgScale: 4,
        worldImgScale: 1.25,
        textOffset: 1.5
    },
    [`${Team.Cyborg}`]: {
        type: "base",
        team: Team.Cyborg,
        auraImg: "underlayGreen.img",
        worldImg: "cyborgBase.img",
        mapImg: "cyborgMapBase.img",
        auraImgScale: 4,
        worldImgScale: 0.775,
        textOffset: 1.5
    }
} satisfies Record<string, BaseDef>;

export type BaseDefKey = keyof typeof rawDefs;

export const BaseDefs = new DefinitionList<BaseDefKey, BaseDef>(rawDefs);
