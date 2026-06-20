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

import { Assets, Container, Sprite, Text } from "pixi.js";

import { ClientEntity } from "./ClientEntity.ts";

import { Camera } from "../modules/Camera.svelte";
import { EntityPool } from "../modules/EntityManager.svelte";

import type { App } from "../App.svelte";
import type { EntitiesNetData } from "@/common/net/UpdatePacket.ts";

import { EntityType, GameConstants, Team } from "@/common/constants.ts";
import { BaseDefs } from "@/common/defs/baseDefs.ts";
import { CircleHitbox } from "@/common/utils/hitbox.ts";
import { math } from "@/common/utils/math.ts";
import { v2 } from "@/common/utils/v2.ts";

export class Base extends ClientEntity {
    readonly __type = EntityType.Base;

    team!: Team;

    direction = v2.new(0, 0);
    prevDirection = v2.new(0, 0);

    staticContainer = new Container({
        visible: false,
        zIndex: 3
    });

    baseSprite = new Sprite({ position: v2.new(0, 0), anchor: 0.5 });
    auraSprite = new Sprite({ position: v2.new(0, 0), anchor: 0.5 });
    dockText = new Text({
        style: {
            align: "center",
            fill: "lime",
            fontFamily: "ShareTech",
            fontSize: 15
        }
    });

    readonly hitbox = new CircleHitbox(GameConstants.base.radius);

    constructor(readonly app: App) {
        super(app);

        this.container.addChild(this.auraSprite);
        this.container.addChild(this.baseSprite);

        this.dockText.anchor.set(0.5);
    }

    override init(): void {
        this.container.visible = true;
        this.staticContainer.visible = this.app.guestMode;

        this.app.camera.addObject(this.staticContainer);

        this.dockText.text = this.app.localization.translation.messages.dockWorldMessage;
        this.dockText.resolution = 4;

        this.staticContainer.addChild(this.dockText);
    }

    override updateFromData(data: EntitiesNetData[EntityType.Base], isNew: boolean): void {
        super.updateFromData(data, isNew);

        this.prevDirection = v2.clone(this.direction);
        this.direction = data.direction;

        if (data.full) {
            this.position = data.full.position;
            this.hitbox.position = data.full.position;

            this.team = data.full.team;

            const def = BaseDefs.typeToDef(`${this.team}`);

            this.auraSprite.texture = Assets.get(def.auraImg);
            this.auraSprite.scale.set(def.auraImgScale);

            this.baseSprite.texture = Assets.get(def.worldImg);
            this.baseSprite.scale.set(def.worldImgScale);

            this.container.position = Camera.vecToScreen(this.position);
            this.staticContainer.position = Camera.vecToScreen(v2.sub(this.position, v2.new(0, def.textOffset)));
        }
    }

    override update(dt: number): void {
        super.update(dt);

        this.dockText.scale.set(1 + 0.15 * math.sinLow(this.app.ticker * 3));

        const direction = v2.lerp(this.prevDirection, this.direction, this.interpFactor);
        this.container.rotation = Math.atan2(direction.y, direction.x);
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
