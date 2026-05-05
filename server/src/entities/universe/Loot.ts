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

import { EntityPool, ServerEntity } from "../Entity";

import type { Game } from "../../modules/Game";
import type { LootDefKey } from "@/common/defs/lootDefs";
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { EntityType } from "@/common/constants";
import { CircleHitbox } from "@/common/utils/hitbox";

export class Loot extends ServerEntity {
    readonly __type = EntityType.Loot;
    readonly hitbox = new CircleHitbox(0);

    type!: LootDefKey;

    update(dt: number): void {}

    get data(): Required<EntitiesNetData[EntityType.Loot]> {
        return {
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
