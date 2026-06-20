/*
 * boom2d (https://github.com/leia-uwu/boom2d)
 * Copyright (C) 2026 leia-uwu
 * Copyright (C) 2026 DamienVesper [AGPL-3.0]
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { assert } from "./util.ts";

import type { GameBitStream } from "../net.ts";

export class DefinitionList<T extends string, K extends object> {
    private readonly _typeToId = {} as unknown as Record<T, number>;
    private readonly _idToType: Record<number, T> = {};

    private _nextId = 0;
    private readonly _maxId: number;
    readonly bits: number;
    readonly bytes: number;

    constructor(public defs: Record<T, K>) {
        // Type 0 is reserved for sending optional types to the stream.
        this._addType("" as T);

        const keys = Object.keys(defs) as T[];

        this._maxId = keys.length + 1;
        this.bits = Math.ceil(Math.log2(this._maxId));
        this.bytes = Math.ceil(this.bits / 8);

        for (let i = 0; i < keys.length; i++) this._addType(keys[i]);
    }

    private _addType(type: T): void {
        this._idToType[this._nextId] = type;
        this._typeToId[type] = this._nextId;
        this._nextId++;
    }

    typeToId(type: T): number {
        const id = this._typeToId[type];
        assert(type !== undefined, `Invalid type: ${type.toString()}`);

        return id;
    }

    idToType(id: number): T {
        const type = this._idToType[id];
        assert(type !== undefined, `Invalid id ${id}, max: ${this._maxId}`);

        return type;
    }

    /**
     * Get a definition from a type.
     * @param type The type to use.
     */
    typeToDef(type: T): K {
        const def = this.defs[type];
        assert(def !== undefined, `Invalid type: ${type.toString()}`);
        return def;
    }

    /**
     * Write a definition to a stream.
     * @param stream The stream to write to.
     * @param type The type associated with the definition.
     */
    write(stream: GameBitStream, type: T): void {
        stream.writeBits(this.typeToId(type), this.bits);
    }

    /**
     * Read a definition from a stream.
     * @param stream The stream to read from.
     */
    read(stream: GameBitStream): T {
        return this.idToType(stream.readBits(this.bits));
    }

    [Symbol.iterator](): ArrayIterator<T> {
        return (Object.keys(this.defs) as T[])[Symbol.iterator]();
    }
}
