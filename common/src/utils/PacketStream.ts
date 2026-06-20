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

import { GameBitStream, PacketRegister, type Packet } from "../net.ts";
import { ChatPacket } from "../net/ChatPacket.ts";
import { ChatServerPacket } from "../net/ChatServerPacket.ts";
import { DeathPacket } from "../net/DeathPacket.ts";
import { DebugPacket } from "../net/DebugPacket.ts";
import { DebugTogglePacket } from "../net/DebugTogglePacket.ts";
import { DisconnectPacket } from "../net/DisconnectPacket.ts";
import { InputPacket } from "../net/InputPacket.ts";
import { JoinedPacket } from "../net/JoinedPacket.ts";
import { JoinPacket } from "../net/JoinPacket.ts";
import { KillPacket } from "../net/KillPacket.ts";
import { RespawnPacket } from "../net/RespawnPacket.ts";
import { UpdatePacket } from "../net/UpdatePacket.ts";

const ClientToServerPackets = new PacketRegister();
const ServerToClientPackets = new PacketRegister();

ClientToServerPackets.register(JoinPacket, DisconnectPacket, DebugTogglePacket, ChatPacket, InputPacket, RespawnPacket);

ServerToClientPackets.register(
    // AnnouncementPacket,
    ChatServerPacket,
    DeathPacket,
    DebugPacket,
    JoinedPacket,
    KillPacket,
    // RaidPacket,
    UpdatePacket
);

export class PacketStream {
    stream: GameBitStream;
    buffer: ArrayBuffer;

    constructor(source: ArrayBuffer) {
        this.stream = new GameBitStream(source);
        this.buffer = source;
    }

    static alloc(size: number): PacketStream {
        return new PacketStream(new ArrayBuffer(size));
    }

    getBuffer(): ArrayBuffer {
        return this.buffer.slice(0, this.stream.byteIndex);
    }

    serializeServerPacket(packet: Packet): void {
        ServerToClientPackets.serializePacket(this.stream, packet);
    }

    deserializeServerPacket(): Packet | undefined {
        return ServerToClientPackets.deserializePacket(this.stream);
    }

    serializeClientPacket(packet: Packet): void {
        ClientToServerPackets.serializePacket(this.stream, packet);
    }

    deserializeClientPacket(): Packet | undefined {
        return ClientToServerPackets.deserializePacket(this.stream);
    }
}
