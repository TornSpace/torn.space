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

import { PacketType } from "../constants";
import { AbstractPacket, GameBitStream } from "../net";

export class DeathPacket implements AbstractPacket {
    readonly type = PacketType.Death;

    lives = 0;

    serialize(stream: GameBitStream): void {
        stream.writeUint8(this.lives);
    }

    deserialize(stream: GameBitStream): void {
        this.lives = stream.readUint8();
    }
}
