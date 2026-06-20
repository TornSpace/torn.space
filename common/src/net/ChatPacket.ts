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

import { GameConstants, PacketType } from "../constants.ts";
import { AbstractPacket, GameBitStream } from "../net.ts";

export class ChatPacket implements AbstractPacket {
    readonly type = PacketType.Chat;

    message = "";

    serialize(stream: GameBitStream): void {
        stream.writeASCIIString(this.message, GameConstants.maxChatLength);
    }

    deserialize(stream: GameBitStream): void {
        this.message = stream.readASCIIString(GameConstants.maxChatLength);
    }
}
