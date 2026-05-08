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

import type { EntityPool, ServerEntity } from "../entities/Entity";
import type { Player } from "../entities/Player";
import type { Base } from "../entities/universe/Base";
import type { Loot } from "../entities/universe/Loot";
import type { Game } from "./Game";
import type { DebugPacket } from "@/common/net/DebugPacket";

import { EntityType, GameConstants } from "@/common/constants";
import { assert } from "@/common/utils/util";

export class EntityManager {
    entities: ServerEntity[] = [];
    entityMap: Array<ServerEntity | null> = new Array(GameConstants.maxEntityId).fill(null);

    dirtyPart = new Uint8Array(GameConstants.maxEntityId);
    dirtyFull = new Uint8Array(GameConstants.maxEntityId);

    deletedEntities: ServerEntity[] = [];

    nextId = 1;
    freeIds: number[] = [];

    typeToPool: {
        // [EntityType.Beam]: EntityPool<Beam>;
        // [EntityType.Blast]: EntityPool<Blast>;
        // [EntityType.Bullet]: EntityPool<Bullet>;
        // [EntityType.Missile]: EntityPool<Missile>;
        // [EntityType.Asteroid]: EntityPool<Asteroid>;
        [EntityType.Base]: EntityPool<Base>;
        [EntityType.Loot]: EntityPool<Loot>;
        // [EntityType.Planet]: EntityPool<Planet>;
        // [EntityType.Turret]: EntityPool<Turret>;
        // [EntityType.Vortex]: EntityPool<Vortex>;
        [EntityType.Player]: EntityPool<Player>;
    };

    counts: DebugPacket["entityCounts"] = [];

    constructor(
        readonly game: Game,
        pools: EntityManager["typeToPool"]
    ) {
        this.typeToPool = pools;
    }

    getById(id: number): ServerEntity | undefined {
        return this.entityMap[id] ?? undefined;
    }

    allocId(): number {
        let id = 1;

        if (this.nextId <= GameConstants.maxEntityId) id = this.nextId++;
        else {
            if (this.freeIds.length > 0) id = this.freeIds.shift()!;
            else assert(false, "Ran out of entity IDs");
        }

        return id;
    }

    freeId(id: number): void {
        this.freeIds.push(id);
    }

    register(entity: ServerEntity): void {
        const id = this.allocId();

        entity.id = id;
        entity.__poolIdx = this.entities.length;
        entity.registered = true;

        this.entities[entity.__poolIdx] = entity;
        this.entityMap[id] = entity;

        this.dirtyPart[id] = 1;
        this.dirtyFull[id] = 1;

        this.updateCounts();
    }

    unregister(entity: ServerEntity): void {
        assert(entity.id > 0);

        const lastEntity = this.entities.pop()!;
        if (entity !== lastEntity) {
            this.entities[entity.__poolIdx] = lastEntity;
            lastEntity.__poolIdx = entity.__poolIdx;
        }

        this.entityMap[entity.id] = null;
        this.freeId(entity.id);

        this.dirtyPart[entity.id] = 0;
        this.dirtyFull[entity.id] = 0;

        entity.id = 0;
        entity.registered = false;

        // @ts-expect-error We don't use this type anymore, doesn't matter.
        entity.__type = EntityType.Invalid;

        this.updateCounts();
    }

    updateCounts(): void {
        this.counts = Object.entries(this.typeToPool).map(([type, pool]) => ({
            type: parseInt(type),
            active: pool.activeCount,
            allocated: pool.pool.length
        }));
    }

    update(dt: number): void {
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity.active) entity.update(dt);
        }
    }

    serializeEntities(): void {
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];

            if (this.dirtyFull[entity.id]) entity.serializeFull();
            else if (this.dirtyPart[entity.id]) entity.serializePartial();
        }
    }

    flush(): void {
        for (let i = 0; i < this.entities.length; i++) this.unregister(this.entities[i]);
        this.deletedEntities.length = 0;

        this.dirtyFull.fill(0);
        this.dirtyPart.fill(0);
    }
}
