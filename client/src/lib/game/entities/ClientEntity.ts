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
import type { EntitiesNetData } from "@/common/net/UpdatePacket";
import type { Hitbox } from "@/common/utils/hitbox";

import { math } from "@/common/utils/math";
import { v2 } from "@/common/utils/v2";

export abstract class ClientEntity<T extends ValidEntityType = ValidEntityType> {
    abstract __type: T;

    declare id: number;
    declare __poolIdx: number;

    container = new Container();

    interpTicker = 0;
    interpFactor = 0;

    position = v2.new(0, 0);
    prevPosition = v2.new(0, 0);

    /**
     * While this is not definitely assigned in the constructor, it is expected
     * that it is defined during all operations that are invoked upon it.
     */
    data!: Required<EntitiesNetData[T]>;
    active = false;

    abstract hitbox: Hitbox;

    constructor(readonly app: App) {
        this.app.camera.addObject(this.container);
    }

    updateFromData(data: EntitiesNetData[T], _isNew: boolean): void {
        this.interpTicker = 0;

        if (data.full) {
            this.data = data as unknown as Required<EntitiesNetData[T]>;
        } else {
            const full = this.data.full;
            this.data = { ...data, full } as unknown as Required<EntitiesNetData[T]>;
        }
    }

    abstract init(): void;
    abstract free(): void;
    abstract destroy(): void;

    update(dt: number): void {
        this.interpTicker += dt;
        this.interpFactor = math.clamp(this.interpTicker / this.app.serverDt, 0, 1);
    }
}
