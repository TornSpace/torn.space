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

import { expect, test } from "bun:test";

import { GameBitStream } from "../src/net.ts";

function equalAbs(a: number, b: number): boolean {
    return Math.abs(a - b) < 0.001;
}

test("Clamped Floats", () => {
    const stream = GameBitStream.alloc(100);

    stream.writeFloat(69.1, 0, 100, 16);
    stream.writeFloat(-1.1, -10, 10, 16);

    stream.index = 0;
    expect(equalAbs(stream.readFloat(0, 100, 16), 69.1)).toBe(true);
    expect(equalAbs(stream.readFloat(-10, 10, 16), -1.1)).toBe(true);
});

test("Arrays", () => {
    const stream = GameBitStream.alloc(100);

    const arr = ["bleh", "meow", ":3"];

    stream.writeArray(arr, 8, item => {
        stream.writeASCIIString(item);
    });

    stream.index = 0;

    const newArr: string[] = [];
    stream.readArray(newArr, 8, () => stream.readASCIIString());

    expect(newArr).toEqual(arr);
});
