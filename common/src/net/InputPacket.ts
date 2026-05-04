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
// import { WeaponDefs, type WeaponDefKey } from "../defs/weaponDefs";
import { AbstractPacket, GameBitStream } from "../net";

export class InputPacket implements AbstractPacket {
    readonly type = PacketType.Input;

    moveFwd = false;
    moveBwd = false;
    turnLeft = false;
    turnRight = false;
    jukeLeft = false;
    jukeRight = false;
    drift = false;

    attack = false;
    shield = false;
    cslot = false;

    queuedSlot = 0;

    inputSequence = 0;

    /**
     * TODO: Try to dynamically define this.
     */
    static readonly significantFields = [
        "moveFwd",
        "moveBwd",
        "turnLeft",
        "turnRight",
        "jukeLeft",
        "jukeRight",
        "drift",
        "attack",
        "shield",
        "cslot",
        "queuedSlot"
    ] as const;

    serialize(stream: GameBitStream): void {
        stream.writeBoolean(this.moveFwd);
        stream.writeBoolean(this.moveBwd);
        stream.writeBoolean(this.turnLeft);
        stream.writeBoolean(this.turnRight);
        stream.writeBoolean(this.jukeLeft);
        stream.writeBoolean(this.jukeRight);
        stream.writeBoolean(this.drift);

        stream.writeBoolean(this.attack);
        stream.writeBoolean(this.shield);
        stream.writeBoolean(this.cslot);

        stream.writeUint8(this.queuedSlot);

        stream.writeUint8(this.inputSequence);
    }

    deserialize(stream: GameBitStream): void {
        this.moveFwd = stream.readBoolean();
        this.moveBwd = stream.readBoolean();
        this.turnLeft = stream.readBoolean();
        this.turnRight = stream.readBoolean();
        this.jukeLeft = stream.readBoolean();
        this.jukeRight = stream.readBoolean();
        this.drift = stream.readBoolean();

        this.attack = stream.readBoolean();
        this.shield = stream.readBoolean();
        this.cslot = stream.readBoolean();

        this.queuedSlot = stream.readUint8();

        this.inputSequence = stream.readUint8();
    }

    /**
     * Compares two input packets to determine if they need to be resent.
     * @param prev The previous input packet.
     */
    compare(prev: InputPacket): boolean {
        for (let i = 0; i < InputPacket.significantFields.length; i++) {
            const key = InputPacket.significantFields[i];
            if (this[key] !== prev[key]) return true;
        }

        return false;
    }
}
