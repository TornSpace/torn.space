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

import { BitStream as BaseBitStream } from "../utils/BitStream";
import { assert } from "../utils/util";

export abstract class AbstractMsg {
    abstract serialize(s: BitStream): void;
    abstract deserialize(s: BitStream): void;
}

export class BitStream extends BaseBitStream {
    readString(len?: number): string {
        return this.readASCIIString(len);
    }

    writeString(str: string, len?: number): void {
        this.writeASCIIString(str, len);
    }

    readFloat(min: number, max: number, bits: number): number {
        assert(bits > 0 && bits < 31);

        const range = (1 << bits) - 1;
        const x = this.readBits(bits);
        const t = x / range;
        const v = min + t * (max - min);

        return v;
    }
}

export interface Msg {
    serialize: (s: BitStream) => void;
}
