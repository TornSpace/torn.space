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

import { Assets, Container, Sprite, Text, Texture } from "pixi.js";

import { ClientEntity } from "./ClientEntity";

import { Camera } from "../modules/Camera";
import { EntityPool } from "../modules/EntityManager";

import type { App } from "../App.svelte";
import type { GameSound } from "../modules/AudioManager";
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { EntityType, Team } from "@/common/constants";
import { ShipDefs, type ShipDefKey } from "@/common/defs/shipDefs";
import { CircleHitbox } from "@/common/utils/hitbox";
import { v2 } from "@/common/utils/v2";

export class Player extends ClientEntity {
    readonly __type = EntityType.Player;

    readonly hitbox = new CircleHitbox(0);

    hp = 0;
    dead = false;
    team = Team.Human;
    ship: ShipDefKey = "r0";
    activeWeapon = 0;

    images = {
        ship: new Sprite({ position: v2.new(0, 0), anchor: 0.5 }),
        boost: new Sprite({ position: v2.new(0, 0), anchor: 0.5 }),
        trail: new Sprite({ position: v2.new(0, 0), anchor: 0.5 })
    };

    staticContainer = new Container({
        visible: false,
        zIndex: 3
    });

    nameText = new Text({
        style: {
            align: "center",
            // fill: "blue",
            fontFamily: "ShareTech",
            fontSize: 12
        }
    });

    direction = v2.new(0, 0);
    prevDirection = v2.new(0, 0);

    shotSound?: GameSound;

    constructor(readonly app: App) {
        super(app);

        const images = Object.values(this.images);

        this.container.addChild(...images);

        this.nameText.anchor.set(0.5);

        this.container.zIndex = 2;
    }

    override init(): void {
        this.container.visible = true;

        this.app.camera.addObject(this.staticContainer);

        this.staticContainer.addChild(this.nameText);
    }

    override updateFromData(data: EntitiesNetData[EntityType.Player], isNew: boolean): void {
        super.updateFromData(data, isNew);

        this.prevPosition = isNew ? data.position : v2.clone(this.position);
        this.position = data.position;
        this.hitbox.position = this.position;

        this.prevDirection = v2.clone(this.direction);
        this.direction = data.direction;

        if (data.full) {
            this.team = data.full.team;
            this.container.visible = this.nameText.visible = !this.dead;

            const def = ShipDefs.typeToDef(this.ship);
            this.images.ship.texture = Assets.get<Texture>(
                this.team === Team.Human ? def.humanImg : this.team === Team.Alien ? def.alienImg : def.cyborgImg
            );
        }
    }

    override update(dt: number): void {
        super.update(dt);

        const pos = Camera.vecToScreen(v2.lerp(this.prevPosition, this.position, this.interpFactor));
        this.container.position = pos;
        this.staticContainer.position = pos;

        const direction = v2.lerp(this.prevDirection, this.direction, this.interpFactor);
        this.container.rotation = Math.atan2(direction.y, direction.x);
    }

    override free(): void {
        this.container.visible = false;
        this.staticContainer.visible = false;
    }

    override destroy(): void {
        this.container.destroy({ children: true });
        this.staticContainer.destroy({ children: true });
    }
}

export class PlayerManager extends EntityPool<Player> {
    playerData = new Map<number, PlayerData>();

    constructor() {
        super(Player);
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
