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

import { EntityPool } from "../EntityManager";

import type { App } from "../App.svelte";
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { EntityType, Team } from "@/common/constants";

export class Loot extends ClientEntity {
    readonly __type = EntityType.Loot;

    // type = "" as LootDefKey;

    sprite = new Sprite({ anchor: 0.5 });

    // readonly hitbox = new CircleHitbox(0);

    constructor(readonly app: App) {
        super(app);

        this.container.addChild(this.sprite);
    }

    override init(): void {
        this.container.visible = true;
    }

    override updateFromData(data: EntitiesNetData[EntityType.Loot], isNew: boolean): void {
        super.updateFromData(data, isNew);
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

export class LootManager extends EntityPool<Loot> {
    playerData = new Map<number, PlayerData>();

    constructor() {
        super(Loot);
    }

    getPlayerData(id: number): PlayerData {
        const data = this.playerData.get(id)!;
        return data;
    }

    override clear(): void {
        super.clear();

        this.playerData.clear();
    }
}

interface PlayerData {
    name: string;
    team: Team;
}
