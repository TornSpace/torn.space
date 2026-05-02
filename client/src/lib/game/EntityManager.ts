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
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { GameConstants, type ValidEntityType } from "@/common/constants";
import { assert } from "@/common/utils/util";

export class EntityManager {
    /**
     * Array of entities.
     *
     * Used to optimize iterations over all entities, as doing so over {@link entityMap}
     * would be inefficient (as it would iterate over null entries).
     */
    entities: ClientEntity[] = [];
    /**
     * Array of entities (or null values).
     * The index of the entity matches the entity's ID.
     */
    entityMap: Array<ClientEntity | null> = new Array(GameConstants.maxEntityId).fill(null);

    constructor(
        readonly app: App,
        readonly typePoolMap: Record<ValidEntityType, EntityPool>
    ) {}

    getById<T extends ClientEntity<ValidEntityType>>(id: number): T | undefined {
        return (this.entityMap[id] as T) ?? undefined;
    }

    createEntity<T extends ValidEntityType>(type: T, id: number, data: Required<EntitiesNetData[T]>): ClientEntity<T> {
        assert(!this.getById(id), `Entity tried to allocate an occupied spot: ${id}.`);

        const entity = this.typePoolMap[type].allocEntity(this.app, id);

        entity.__poolIdx = this.entities.length;

        this.entities[entity.__poolIdx] = entity;
        this.entityMap[id] = entity;

        entity.updateFromData(data, true);

        return entity as ClientEntity<T>;
    }

    updateFullEntity(id: number, data: Required<EntitiesNetData[ValidEntityType]>): void {
        const entity = this.getById(id);
        if (!entity) {
            console.error(`Tried to fully update invalid entity ID "${id}", data:`, JSON.stringify(data, null, 2));
            return;
        }

        entity.updateFromData(data, false);
    }

    updatePartialEntity(id: number, data: EntitiesNetData[ValidEntityType]): void {
        const entity = this.getById(id);
        if (!entity) {
            console.error(`Tried to partially update invalid entity ID "${id}", data:`, JSON.stringify(data, null, 2));
            return;
        }

        entity.updateFromData(data, false);
    }

    deleteEntity(id: number): void {
        const entity = this.getById(id);
        if (!entity) {
            console.error(`Tried to destroy invalid entity ID "${id}".`);
            return;
        }

        // Obtain the last entity and move it to the empty spot in the array.
        // This way, there are no empty entries in the middle of the array (optimizes iteration).
        const lastEntity = this.entities.pop()!;
        if (entity !== lastEntity) {
            this.entities[entity.__poolIdx] = lastEntity;
            lastEntity.__poolIdx = entity.__poolIdx;
        }

        this.typePoolMap[entity.__type].freeEntity(entity);
        this.entityMap[id] = null;
    }

    clear(): void {
        for (const pool of Object.values(this.typePoolMap)) pool.clear();

        this.entities.length = 0;
        this.entityMap.fill(null);
    }

    update(dt: number): void {
        for (const entity of this.entities) {
            if (entity.active) entity.update(dt);
        }
    }
}

export class EntityPool<T extends ClientEntity = ClientEntity> {
    private pool: T[] = [];

    activeCount = 0;

    constructor(public entityCtor: new (app: App) => T) {}

    get allocatedCount(): number {
        return this.pool.length;
    }

    allocEntity(app: App, id: number): T {
        let entity = this.pool.find(t => !t.active);
        if (!entity) {
            entity = new this.entityCtor(app);
            this.pool.push(entity);
        }

        entity.active = true;
        entity.id = id;

        entity.init();

        this.activeCount++;

        return entity;
    }

    freeEntity(entity: ClientEntity): void {
        entity.free();
        entity.active = false;

        this.activeCount--;

        // Clean up any inactive entities.
        if (this.pool.length > 128 && this.activeCount < this.pool.length / 2) {
            const activeEntities: T[] = [];
            for (const entity of this.pool) {
                if (entity.active) activeEntities.push(entity);
                else entity.destroy();
            }

            this.pool = activeEntities;
        }
    }

    clear(): void {
        for (const entity of this.pool) entity.destroy();

        this.pool.length = 0;
        this.activeCount = 0;
    }
}
