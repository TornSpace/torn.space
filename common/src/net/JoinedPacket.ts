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

import { GameConstants, PacketType } from "../constants";
import { GameBitStream, Packet } from "../net";

export class JoinedPacket implements Packet {
    type = PacketType.Joined;

    protocol = 0;
    name = "";

    serialize(stream: GameBitStream): void {
        // Protocol should remain fixed in order and size to avoid breaking older clients.
        stream.writeUint32(this.protocol);

        // Everything else.
        stream.writeASCIIString(this.name, GameConstants.player.maxNameLength);
    }

    deserialize(stream: GameBitStream): void {
        // Same as above.
        this.protocol = stream.readUint32();

        this.name = stream.readASCIIString(GameConstants.player.maxNameLength);
    }
}
