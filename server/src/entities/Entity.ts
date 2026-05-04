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

import type { Game } from "../modules/Game";
import type { ValidEntityType } from "@/common/constants";
import type { Hitbox } from "@/common/utils/hitbox";

import { GameBitStream } from "@/common/net";
import { EntitySerializations, type EntitiesNetData } from "@/common/net/UpdatePacket";
import { v2, type Vec2 } from "@/common/utils/v2";

export abstract class ServerEntity<T extends ValidEntityType = ValidEntityType> {
    abstract readonly __type: T;
    __gridCells: Vec2[] = [];

    declare id: number;
    declare __poolIdx: number;

    active = false;
    registered = false;

    partialStream!: GameBitStream;
    fullStream!: GameBitStream;

    _position: Vec2;
    sector: Vec2;

    abstract hitbox: Hitbox;

    constructor(readonly game: Game) {
        this._position = v2.new(0, 0);
        this.sector = v2.new(0, 0);
    }

    /**
     * Get the position of an entity.
     *
     * Note: This method may be overridden for specific entities.
     */
    get position(): Vec2 {
        return this._position;
    }

    /**
     * Set the position of an entity.
     * @param pos The position to set.
     *
     * Note: This method may be overridden for specific entities.
     */
    set position(pos: Vec2) {
        this._position = pos;
    }

    abstract update(dt: number): void;

    initCache(): void {
        // We allocate 3 extra bytes for the entity ID (Uint16) and entity type (Uint8).
        this.partialStream = GameBitStream.alloc(EntitySerializations[this.__type].partialSize + 3);
        this.fullStream = GameBitStream.alloc(EntitySerializations[this.__type].fullSize);
    }

    serializePartial(): void {
        this.partialStream.index = 0;

        this.partialStream.writeUint16(this.id);
        this.partialStream.writeUint8(this.__type);

        EntitySerializations[this.__type].serializePartial(
            this.partialStream,
            this.data as EntitiesNetData[typeof this.__type]
        );

        this.partialStream.writeAlignToNextByte();
    }

    serializeFull(): void {
        this.serializePartial();

        this.fullStream.index = 0;

        EntitySerializations[this.__type].serializeFull(this.fullStream, this.data.full);

        this.fullStream.writeAlignToNextByte();
    }

    setPartialDirty(): void {
        this.game.entityManager.dirtyPart[this.id] = 1;
    }

    setFullDirty(): void {
        this.game.entityManager.dirtyFull[this.id] = 1;
    }

    destroy(): void {
        if (!this.active) {
            this.game.logger.warn("Game", "Tried to destroy entity twice!");
            return;
        }

        this.game.entityManager.typeToPool[this.__type].freeEntity(this);
        this.game.grid.removeEntity(this);
        this.game.entityManager.deletedEntities.push(this);
    }

    abstract get data(): Required<EntitiesNetData[T]>;
}

export abstract class EntityPool<T extends ServerEntity> {
    abstract type: T["__type"];

    pool: T[] = [];
    activeCount = 0;

    constructor(
        public game: Game,
        public entityCtor: new (game: Game) => T
    ) {}

    allocEntity(...params: Parameters<T["init"]>): T {
        let entity: T | undefined = undefined;
        for (let i = 0; i < this.pool.length; i++) {
            const e = this.pool[i];
            if (!e.active && !e.registered) {
                entity = e;
                break;
            }
        }

        if (!entity) {
            entity = new this.entityCtor(this.game) as T;
            entity.initCache();

            this.pool.push(entity);
        }

        this.activeCount++;
        entity.active = true;

        (entity.init as (...p: typeof params) => void)(...params);

        // @ts-expect-error Typically readonly, but need to assign in this context.
        entity.__type = this.type;

        this.game.entityManager.register(entity);
        entity.serializeFull();

        this.game.grid.addEntity(entity);

        return entity;
    }

    freeEntity(entity: T): void {
        entity.active = false;
        this.activeCount--;

        // Clean up any inactive entities.
        if (this.pool.length > 128 && this.activeCount < this.pool.length / 2) {
            const activeEntities: T[] = [];
            for (let i = 0; i < this.pool.length; i++) {
                const entity = this.pool[i];

                if (entity.active) activeEntities.push(entity);
                else entity.destroy();
            }

            this.pool = activeEntities;
        }
    }
}
