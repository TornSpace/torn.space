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

import { Sprite } from "pixi.js";

import { ClientEntity } from "./ClientEntity";

import { EntityPool } from "../modules/EntityManager";

import type { App } from "../App.svelte";
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { EntityType, GameConstants, Team } from "@/common/constants";
import { CircleHitbox } from "@/common/utils/hitbox";
import { v2 } from "@/common/utils/v2";

export class Base extends ClientEntity {
    readonly __type = EntityType.Base;

    team!: Team;

    direction = v2.new(0, 0);

    sprite = new Sprite({ anchor: 0.5 });

    readonly hitbox = new CircleHitbox(GameConstants.base.radius);

    constructor(readonly app: App) {
        super(app);

        this.container.addChild(this.sprite);
    }

    override init(): void {
        this.container.visible = true;
    }

    override updateFromData(data: EntitiesNetData[EntityType.Base], isNew: boolean): void {
        super.updateFromData(data, isNew);

        this.direction = data.direction;

        if (data.full) {
            this.position = data.full.position;
            this.team = data.full.team;

            // const def = LootDefs.typeToDef(this.type);
            // sprite from def
        }
    }

    override update(dt: number): void {
        super.update(dt);
    }

    override free(): void {
        this.container.visible = false;
    }

    override destroy(): void {
        this.container.destroy({ children: true });
    }
}

export class BaseManager extends EntityPool<Base> {
    constructor() {
        super(Base);
    }
}
