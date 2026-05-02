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

import { Container } from "pixi.js";

import type { App } from "../App.svelte";
import type { ValidEntityType } from "@/common/constants";

export abstract class ClientEntity<T extends ValidEntityType = ValidEntityType> {
    abstract __type: T;

    container = new Container();

    constructor(readonly app: App) {
        this.app.camera.addObject(this.container);
    }

    updateFromData(data: EntitiesNetData)
}

export class EntityPool<T extends ClientEntity = ClientEntity> {
    private pool: T[] = [];

    constructor () {}

    allocEntity (): void {}

    freeEntity (entity: ClientEntity): void {
        entity.free();
        entity.active = false;

    }

    clear (): void {
        for (const entity of this.pool) entity.destroy();

        this.pool.length = 0;
        this.activeCount = 0;
    }
}
