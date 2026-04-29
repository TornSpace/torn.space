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

import { sound } from "@pixi/sound";

import { v2, type Vec2 } from "@/common/utils/v2";

interface SoundOpts {
    position?: Vec2;
    falloff: number;
    maxRange: number;
    loop: boolean;
    dynamic: boolean;
    onComplete?: () => void;
}

export class GameSound {}

export class AudioManager {
    sounds: GameSound[] = [];

    volume = 1;
    position = v2.create(0, 0);

    play(name: string, options: SoundOpts): void {}
}
