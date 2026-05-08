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

import { EntityType, GameConstants, PacketType, type LeaderboardEntry, type ValidEntityType } from "../constants";
import { LootDefs, type LootDefKey } from "../defs/lootDefs";
import { WeaponDefs, type WeaponDefKey } from "../defs/weaponDefs";
import { AbstractPacket, GameBitStream } from "../net";
import { v2, type Vec2 } from "../utils/v2";

/**
 * Entity net data.
 *
 * Partial data should be used for data that changes often,
 * while full data should be used for data that rarely changes.
 */
export interface EntitiesNetData {
    [EntityType.Loot]: {
        direction: Vec2;

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

    serializePartial: (stream: GameBitStream, data: Omit<EntitiesNetData[T], "full">) => void;
    serializeFull: (stream: GameBitStream, data: Required<EntitiesNetData[T]>["full"]) => void;

    deserializePartial: (stream: GameBitStream) => Omit<EntitiesNetData[T], "full">;
    deserializeFull: (stream: GameBitStream) => Required<EntitiesNetData[T]>["full"];
}

export const EntitySerializations: { [K in ValidEntityType]: EntitySerialization<K> } = {
    [EntityType.Loot]: {
        partialSize: 16,
        fullSize: 10,
        serializePartial(stream, data) {
            stream.writeUnit(data.direction, 16);
        },
        serializeFull(stream, data) {
            stream.writePosition(data.position);
            LootDefs.write(stream, data.type);
        },
        deserializePartial(stream) {
            return {
                direction: stream.readUnit(16)
            };
        },
        deserializeFull(stream) {
            return {
                position: stream.readPosition(),
                type: LootDefs.read(stream)
            };
        }
    },
    [EntityType.Player]: {
        partialSize: 8,
        fullSize: 1,
        serializePartial(stream, data): void {
            stream.writePosition(data.position);
            stream.writeUnit(data.direction, 16);
        },
        serializeFull(stream, data): void {
            stream.writeBoolean(data.dead);
        },
        deserializePartial(stream) {
            return {
                position: stream.readPosition(),
                direction: stream.readUnit(16)
            };
        },
        deserializeFull(stream) {
            return {
                dead: stream.readBoolean()
            };
        }
    }
};

enum UpdateFlags {
    DeletedEntities = 1 << 0,
    FullEntities = 1 << 1,
    PartialEntities = 1 << 2,
    NewPlayers = 1 << 3,
    DeletedPlayers = 1 << 4,
    CameraPosition = 1 << 5,
    PlayerData = 1 << 6,
    Leaderboard = 1 << 7
}

export class UpdatePacket implements AbstractPacket {
    readonly type = PacketType.Update;

    deletedEntities: number[] = [];
    partialEntities: Entity[] = [];
    fullEntities: Array<Entity & { data: Required<EntitiesNetData[Entity["__type"]]> }> = [];

    newPlayers: Array<{
        name: string;
        id: number;
    }> = [];

    deletedPlayers: number[] = [];

    playerDataDirty = {
        hp: false,
        weapons: false,
        ammo: false
    };

    cameraPositionDirty = false;
    cameraPosition = v2.new(0, 0);

    playerData = {
        hp: 0,
        weapons: [] as Array<WeaponDefKey>,
        ammo: [] as number[]
    };

    leaderboardDirty = false;
    leaderboard: LeaderboardEntry[] = [];

    updateSequence = 0;

    // Server-side cached entity serializations.
    serverPartialEntities: Array<{ partialStream: GameBitStream }> = [];
    serverFullEntities: Array<{ partialStream: GameBitStream; fullStream: GameBitStream }> = [];

    serialize(stream: GameBitStream): void {
        let flags = 0;

        // Save the stream index for writing flags.
        const flagsIdx = stream.index;
        stream.writeUint16(flags);

        if (this.deletedEntities.length) {
            stream.writeArray(this.deletedEntities, 16, id => {
                stream.writeUint16(id);
            });

            flags |= UpdateFlags.DeletedEntities;
        }

        if (this.serverFullEntities.length) {
            stream.writeArray(this.serverFullEntities, 16, entity => {
                stream.writeBytes(entity.partialStream, 0, entity.partialStream.byteIndex);
                stream.writeBytes(entity.fullStream, 0, entity.fullStream.byteIndex);
            });

            flags |= UpdateFlags.FullEntities;
        }

        if (this.serverPartialEntities.length) {
            stream.writeArray(this.serverPartialEntities, 16, entity => {
                stream.writeBytes(entity.partialStream, 0, entity.partialStream.byteIndex);
            });

            flags |= UpdateFlags.PartialEntities;
        }

        if (this.newPlayers.length) {
            stream.writeArray(this.newPlayers, 8, player => {
                stream.writeUint16(player.id);
                stream.writeASCIIString(player.name, GameConstants.player.maxNameLength);
            });

            flags |= UpdateFlags.NewPlayers;
        }

        if (this.deletedPlayers.length) {
            stream.writeArray(this.deletedPlayers, 8, id => {
                stream.writeUint16(id);
            });

            flags |= UpdateFlags.DeletedPlayers;
        }

        if (this.cameraPositionDirty) {
            stream.writePosition(this.cameraPosition);
            flags |= UpdateFlags.CameraPosition;
        }

        if (Object.values(this.playerDataDirty).includes(true)) {
            serializeActivePlayerData(stream, this.playerData, this.playerDataDirty);
            flags |= UpdateFlags.PlayerData;
        }

        if (this.leaderboardDirty) {
            stream.writeArray(this.leaderboard, 8, entry => {
                stream.writeUint16(entry.playerId);
                stream.writeUint16(entry.xp);
                stream.writeUint8(entry.rank);
            });

            flags |= UpdateFlags.Leaderboard;
        }

        stream.writeUint8(this.updateSequence);

        // Write flags and restore stream index.
        const idx = stream.index;
        stream.index = flagsIdx;

        stream.writeUint16(flags);
        stream.index = idx;
    }

    deserialize(stream: GameBitStream): void {
        const flags = stream.readUint16();

        if (flags & UpdateFlags.DeletedEntities) stream.readArray(this.deletedEntities, 16, () => stream.readUint16());

        if (flags & UpdateFlags.FullEntities) {
            stream.readArray(this.fullEntities, 16, () => {
                const id = stream.readUint16();
                const entityType = stream.readUint8() as ValidEntityType;

                const partialData = EntitySerializations[entityType].deserializePartial(stream);
                stream.readAlignToNextByte();

                const data = {
                    ...partialData,
                    full: EntitySerializations[entityType].deserializeFull(stream)
                };

                stream.readAlignToNextByte();

                return {
                    id,
                    __type: entityType,
                    data
                };
            });
        }

        if (flags & UpdateFlags.PartialEntities) {
            stream.readArray(this.partialEntities, 16, () => {
                const id = stream.readUint16();
                const entityType = stream.readUint8() as ValidEntityType;
                const data = EntitySerializations[entityType].deserializePartial(stream);

                stream.readAlignToNextByte();

                return {
                    id,
                    __type: entityType,
                    data
                };
            });
        }

        if (flags & UpdateFlags.NewPlayers) {
            stream.readArray(this.newPlayers, 8, () => ({
                id: stream.readUint16(),
                name: stream.readASCIIString(GameConstants.player.maxNameLength)
            }));
        }

        if (flags & UpdateFlags.DeletedPlayers) stream.readArray(this.deletedPlayers, 8, () => stream.readUint16());

        if (flags & UpdateFlags.CameraPosition) {
            this.cameraPositionDirty = true;
            this.cameraPosition = stream.readPosition();
        }

        if (flags & UpdateFlags.PlayerData) deserializePlayerData(stream, this.playerData, this.playerDataDirty);

        if (flags & UpdateFlags.Leaderboard) {
            this.leaderboardDirty = true;
            stream.readArray(this.leaderboard, 8, () => ({
                playerId: stream.readUint16(),
                xp: stream.readUint32(),
                rank: stream.readUint8()
            }));
        }

        this.updateSequence = stream.readUint8();
    }
}

function serializeActivePlayerData(
    stream: GameBitStream,
    data: UpdatePacket["playerData"],
    dirty: UpdatePacket["playerDataDirty"]
): void {
    stream.writeBoolean(dirty.hp);
    if (dirty.hp) stream.writeUint8(data.hp);

    stream.writeBoolean(dirty.weapons);
    if (dirty.weapons) {
        for (let i = 0; i < data.weapons.length; i++) {
            const def = data.weapons[i];
            WeaponDefs.write(stream, def);
        }
    }

    stream.writeBoolean(dirty.ammo);
    if (dirty.ammo) {
        for (let i = 0; i < data.ammo.length; i++) {
            const amt = data.ammo[i];
            stream.writeInt8(amt);
        }
    }

    stream.writeAlignToNextByte();
}

function deserializePlayerData(
    stream: GameBitStream,
    data: UpdatePacket["playerData"],
    dirty: UpdatePacket["playerDataDirty"]
): void {
    if (stream.readBoolean()) {
        dirty.hp = true;
        data.hp = stream.readUint8();
    }

    stream.writeBoolean(dirty.weapons);
    if (dirty.weapons) {
        for (let i = 0; i < GameConstants.player.weaponSlots; i++) {
            data.weapons[i] = WeaponDefs.read(stream);
        }
    }

    stream.writeBoolean(dirty.ammo);
    if (dirty.ammo) {
        for (let i = 0; i < GameConstants.player.weaponSlots; i++) {
            data.ammo[i] = stream.readInt8();
        }
    }

    stream.readAlignToNextByte();
}

interface Entity {
    __type: ValidEntityType;
    id: number;
    data: EntitiesNetData[Entity["__type"]];
}
