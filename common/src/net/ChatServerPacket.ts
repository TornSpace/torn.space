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

export class ChatServerPacket implements Packet {
    type = PacketType.Chat;

    playerId = 0;
    message = "";

    serialize(stream: GameBitStream): void {
        stream.writeUint8(this.playerId);
        stream.writeASCIIString(this.message, GameConstants.maxChatLength);
    }

    deserialize(stream: GameBitStream): void {
        this.playerId = stream.readUint8();
        this.message = stream.readASCIIString(GameConstants.maxChatLength);
    }
}
