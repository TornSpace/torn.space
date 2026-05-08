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
import type { LootDefKey } from "@/common/defs/lootDefs";
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { EntityType, GameConstants } from "@/common/constants";
import { CircleHitbox } from "@/common/utils/hitbox";
import { v2, type Vec2 } from "@/common/utils/v2";

export class Loot extends AbstractServerEntity {
    readonly __type = EntityType.Loot;
    readonly hitbox = new CircleHitbox(GameConstants.lootRadius);

    type!: LootDefKey;
    direction!: Vec2;

    init(type: LootDefKey, position: Vec2): void {
        this.type = type;
        this.position = position;

        this.hitbox.position = this.position;
    }

    update(dt: number): void {
        this.direction = v2.rotate(this.direction, dt);
    }

    get data(): Required<EntitiesNetData[EntityType.Loot]> {
        return {
            direction: this.direction,
            full: {
                position: this.position,
                type: this.type
            }
        };
    }
}

export class LootManager extends EntityPool<Loot> {
    override readonly type = EntityType.Loot;
    constructor(game: Game) {
        super(game, Loot);
    }
}
