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

import { EntityType, PacketType, type ValidEntityType } from "../constants";
import { AbstractPacket, GameBitStream } from "../net";

import type { LootDefKey } from "../defs/lootDefs";
import type { Vec2 } from "../utils/v2";

/**
 * Entity net data.
 *
 * Partial data should be used for data that changes often,
 * while full data should be used for data that rarely changes.
 */
export interface EntitiesNetData {
    [EntityType.Loot]: {
        full?: {
            position: Vec2;
            type: LootDefKey;
        };
    };

    [EntityType.Player]: {
        position: Vec2;
        direction: Vec2;

        full?: {
            dead: boolean;
        };
    };
}

interface EntitySerialization<T extends ValidEntityType> {
    // The number of bytes to allocate for the entity serialization cache.
    partialSize: number;
    fullSize: number;

    serializePartial: (stream: GameBitStream, data: EntitiesNetData[T]) => void;
    serializeFull: (stream: GameBitStream, data: Required<EntitiesNetData[T]>["full"]) => void;

    deserializePartial: (stream: GameBitStream) => EntitiesNetData[T];
    deserializeFull: (stream: GameBitStream) => Required<EntitiesNetData[T]>["full"];
}

export const EntitySerializations: { [K in ValidEntityType]: EntitySerialization<K> } = {
    [EntityType.Loot]: {},
    [EntityType.Player]: {}
};

enum UpdateFlags {
    DeletedEntities = 1 << 0,
    FullEntities = 1 << 1,
    PartialEntities = 1 << 2
}

export class UpdatePacket implements AbstractPacket {
    readonly type = PacketType.Update;

    deletedEntities: number[] = [];

    updateSequence = 0;

    serialize(stream: GameBitStream): void {
        let flags = 0;

        const flagsIdx = stream.index;
        stream.writeUint16(flags);

        stream.writeUint8(this.updateSequence);
    }
    deserialize(stream: GameBitStream): void {
        this.updateSequence = stream.readUint8();
    }
}
