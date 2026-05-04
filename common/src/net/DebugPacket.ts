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

import { EntityType, PacketType } from "../constants";
import { AbstractPacket, GameBitStream } from "../net";

export enum DebugFlags {
    TPS = 1 << 0,
    Objects = 1 << 1
}

export class DebugPacket implements AbstractPacket {
    readonly type = PacketType.Debug;

    flags = 0;

    tpsAvg = 0;
    tpsMin = 0;
    tpsMax = 0;

    msptAvg = 0;

    entityCounts: Array<{
        type: EntityType;
        active: number;
        allocated: number;
    }> = [];

    serialize(stream: GameBitStream): void {
        stream.writeUint8(this.flags);

        if (this.flags & DebugFlags.TPS) {
            stream.writeUint8(this.tpsAvg);
            stream.writeUint8(this.tpsMin);
            stream.writeUint8(this.tpsMax);
        }

        if (this.flags & DebugFlags.Objects) {
            stream.writeArray(this.entityCounts, 8, count => {
                stream.writeUint8(count.type);
                stream.writeUint16(count.active);
                stream.writeUint16(count.allocated);
            });
        }
    }

    deserialize(stream: GameBitStream): void {
        this.flags = stream.readUint8();

        if (this.flags & DebugFlags.TPS) {
            this.tpsAvg = stream.readUint8();
            this.tpsMin = stream.readUint8();
            this.tpsMax = stream.readUint8();

            this.msptAvg = stream.readFloat(0, 100, 16);
        }

        if (this.flags & DebugFlags.Objects) {
            stream.readArray(this.entityCounts, 8, () => ({
                type: stream.readUint8(),
                active: stream.readUint16(),
                allocated: stream.readUint16()
            }));
        }
    }
}
