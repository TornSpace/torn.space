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

import type { App } from "./App.svelte";
import type { ClientEntity } from "./entities/ClientEntity";

import { GameConstants, type ValidEntityType } from "@/common/constants";

export class EntityManager {
    entities: Array<ClientEntity> = [];
    idToEntity: Array<ClientEntity | null> = new Array(GameConstants.maxEntityId).fill(null);

    constructor(readonly app: App) {}

    getById<T extends ClientEntity<ValidEntityType>>(id: number): T | undefined {
        return (this.idToEntity[id] as T) ?? undefined;
    }

    update(dt: number): void {
        for (const entity of this.entities) {
            if (entity.active) entity.update(dt);
        }
    }
}
