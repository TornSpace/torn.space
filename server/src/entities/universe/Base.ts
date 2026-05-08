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

import { AbstractServerEntity, EntityPool } from "../Entity";

import type { Game } from "../../modules/Game";
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { EntityType, GameConstants, Team } from "@/common/constants";
import { CircleHitbox } from "@/common/utils/hitbox";
import { v2, type Vec2 } from "@/common/utils/v2";

export class Base extends AbstractServerEntity {
    readonly __type = EntityType.Base;
    readonly hitbox = new CircleHitbox(GameConstants.base.radius);

    team!: Team;
    direction!: Vec2;

    // turret!: Turret;

    init(team: Team, sector: Vec2): void {
        this.team = team;
        this.sector = sector;
        this.position = v2.new(GameConstants.sectorWidth / 2, GameConstants.sectorWidth / 2);

        this.hitbox.position = this.position;
    }

    update(dt: number): void {
        this.direction = v2.rotate(this.direction, dt);
    }

    get data(): Required<EntitiesNetData[EntityType.Base]> {
        return {
            direction: this.direction,
            full: {
                position: this.position,
                team: this.team
            }
        };
    }
}

export class BaseManager extends EntityPool<Base> {
    override readonly type = EntityType.Base;
    constructor(game: Game) {
        super(game, Base);
    }
}
