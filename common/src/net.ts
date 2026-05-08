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

import { GameConstants, type PacketType } from "./constants";
import { BitStream } from "./lib/BitStream";
import { math } from "./utils/math";
import { assert } from "./utils/util";

import type { ChatPacket } from "./net/ChatPacket";
import type { ChatServerPacket } from "./net/ChatServerPacket";
import type { DebugPacket } from "./net/DebugPacket";
import type { DebugTogglePacket } from "./net/DebugTogglePacket";
import type { DisconnectPacket } from "./net/DisconnectPacket";
import type { InputPacket } from "./net/InputPacket";
import type { JoinedPacket } from "./net/JoinedPacket";
import type { JoinPacket } from "./net/JoinPacket";
import type { RespawnPacket } from "./net/RespawnPacket";
import type { UpdatePacket } from "./net/UpdatePacket";
import type { Vec2 } from "./utils/v2";

export class GameBitStream extends BitStream {
    static epsilon = 1.0001;

    static alloc(size: number): GameBitStream {
        return new GameBitStream(new ArrayBuffer(size));
    }

    /**
     * Read a floating-point value from the bitstream.
     * @param min The minimum number.
     * @param max The maximum number.
     * @param bits The number of bits to read.
     */
    readFloat(min: number, max: number, bits: number): number {
        assert(bits > 0 && bits <= 31, `Bit count "${bits}" out of range, expected (0, 31].`);

        const range = (1 << bits) - 1;
        const x = this.readBits(bits);
        const t = x / range;
        const v = min + t * (max - min);

        return v;
    }

    /**
     * Write a floating-point value to the bitstream.
     * @param value The number to write.
     * @param min The minimum number.
     * @param max The maximum number.
     * @param bits The number of bits to write.
     */
    writeFloat(value: number, min: number, max: number, bits: number): void {
        assert(bits > 0 && bits <= 31, `Bit count "${bits}" out of range, expected (0, 31].`);
        assert(value < max && value > min, `Value "${bits}" out of range, expected (${min}, ${max}).`);

        const range = (1 << bits) - 1;
        const clamped = math.clamp(value, min, max);

        this.writeBits(((clamped - min) / (max - min)) * range + 0.5, bits);
    }

    /**
     * Read an array from the bitstream.
     * @param target The target array.
     * @param bits The amount of bits to read for the array size.
     * @param serializeFn The function with which to de-serialize each array item.
     */
    readArray<T>(target: T[], bits: number, deserializeFn: () => T): void {
        assert(bits > 0 && bits <= 31, `Bit count "${bits}" out of range, expected (0, 31].`);

        const size = this.readBits(bits);
        for (let i = 0; i < size; i++) target.push(deserializeFn());
    }

    /**
     * Write an array to the bitstream.
     * @param source An array containing the items to serialize.
     * @param bits The number of bits to write for the array size.
     * @param serializeFn The function to serialize each array item.
     */
    writeArray<T>(source: T[], bits: number, serializeFn: (item: T) => void): void {
        assert(bits > 0 && bits <= 31, `Bit count "${bits}" out of range, expected (0, 31].`);
        this.writeBits(source.length, bits);

        const maxSize = 1 << bits;
        for (let i = 0; i < source.length; i++) {
            if (i > maxSize) {
                console.warn(`writeArray: array overflow: max length: ${maxSize}, length: ${source.length}`);
                break;
            }

            serializeFn(source[i]);
        }
    }

    /**
     * Read a position Vector from the bitstream.
     * @param minX The minimum X position.
     * @param minY The minimum Y position.
     * @param maxX The maximum X position.
     * @param maxY The maximum Y position.
     * @param bits The number of bits to read.
     */
    readVec2(minX: number, minY: number, maxX: number, maxY: number, bits: number): Vec2 {
        return {
            x: this.readFloat(minX, maxX, bits),
            y: this.readFloat(minY, maxY, bits)
        };
    }

    /**
     * Write a `Vec2` to the bitstream.
     * @param vector The `Vec2`.
     * @param minX The minimum X position.
     * @param minY The minimum Y position.
     * @param maxX The maximum X position.
     * @param maxY The maximum Y position.
     * @param bits The number of bits to write.
     */
    writeVec2(vector: Vec2, minX: number, minY: number, maxX: number, maxY: number, bits: number): void {
        this.writeFloat(vector.x, minX, maxX, bits);
        this.writeFloat(vector.y, minY, maxY, bits);
    }

    /**
     * Read a position vector from stream with the game default max and minimum X and Y.
     */
    readPosition(): Vec2 {
        return this.readVec2(0, 0, GameConstants.maxPosition, GameConstants.maxPosition, 16);
    }

    /**
     * Write a position vector to the stream with the game default max and minimum X and Y.
     * @param vector The vector to write.
     */
    writePosition(vector: Vec2): void {
        this.writeVec2(vector, 0, 0, GameConstants.maxPosition, GameConstants.maxPosition, 16);
    }

    /**
     * Read an unit vector from the stream.
     * @param bits The number of bits to read.
     */
    readUnit(bits: number): Vec2 {
        return this.readVec2(
            -GameBitStream.epsilon,
            -GameBitStream.epsilon,
            GameBitStream.epsilon,
            GameBitStream.epsilon,
            bits
        );
    }

    /**
     * Write an unit vector to the stream
     * @param vector The Vector to write.
     * @param bits The number of bits to write.
     */
    writeUnit(vector: Vec2, bits: number): void {
        this.writeVec2(
            vector,
            -GameBitStream.epsilon,
            -GameBitStream.epsilon,
            GameBitStream.epsilon,
            GameBitStream.epsilon,
            bits
        );
    }

    /**
     * Copy bytes from a source stream to this stream.
     * Note: Both streams' indices (post-offset) must be byte-aligned!
     * @param src The source bit stream to copy.
     * @param offset The offset to start copying bytes from.
     * @param length The amount of bytes to copy.
     */
    writeBytes(src: GameBitStream, offset: number, length: number): void {
        assert(this.index % 8 === 0, "WriteBytes: stream must be byte aligned.");

        const data = new Uint8Array(src.view.view.buffer, offset, length);

        this.view.view.set(data, this.index / 8);
        this.index += length * 8;
    }

    /**
     * Read a byte alignment from the bitstream.
     */
    readAlignToNextByte(): void {
        const offset = 8 - (this.index & 7);
        if (offset < 8) this.readBits(offset);
    }

    /**
     * Writes a byte alignment to the bitstream.
     * This is to ensure the stream index is a multiple of 8.
     */
    writeAlignToNextByte(): void {
        const offset = 8 - (this.index & 7);
        if (offset < 8) this.writeBits(0, offset);
    }
}

export class PacketRegister {
    private _nextTypeId = 0;
    readonly typeToId: Record<string, number> = {};
    readonly idToCtor: Array<new () => Packet> = [];

    register(...packets: Array<new () => Packet>): void {
        for (let i = 0; i < packets.length; i++) {
            const packet = packets[i];
            if (this.typeToId[packet.name]) {
                console.warn(`Trying to register ${packet.name} multiple times`);
                continue;
            }

            const id = this._nextTypeId++;
            this.typeToId[packet.name] = id;
            this.idToCtor[id] = packet;
        }
    }

    serializePacket(stream: GameBitStream, packet: Packet): void {
        const type = this.typeToId[packet.constructor.name];
        assert(type !== undefined, `Unknown packet type: ${packet.constructor.name}, did you forget to register it?`);

        stream.writeUint8(type);
        packet.serialize(stream);
        stream.writeAlignToNextByte();
    }

    deserializePacket(stream: GameBitStream): Packet | undefined {
        if (stream.length - stream.byteIndex * 8 >= 1) {
            try {
                const id = stream.readUint8();
                const packet = new this.idToCtor[id]();

                packet.deserialize(stream);
                stream.readAlignToNextByte();

                return packet;
            } catch (e) {
                console.error("Failed deserializing packet: ", e);
                return undefined;
            }
        }
        return undefined;
    }
}

export abstract class AbstractPacket {
    abstract readonly type: PacketType;

    abstract serialize(s: GameBitStream): void;
    abstract deserialize(s: GameBitStream): void;
}

export type Packet =
    | ChatPacket
    | ChatServerPacket
    | DebugPacket
    | DebugTogglePacket
    | DisconnectPacket
    | InputPacket
    | JoinedPacket
    | JoinPacket
    | RespawnPacket
    | UpdatePacket;
