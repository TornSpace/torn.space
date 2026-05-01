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

import { filters, sound, type IMediaInstance } from "@pixi/sound";

import type { App } from "./App.svelte";

import { math } from "@/common/utils/math";
import { v2, type Vec2 } from "@/common/utils/v2";

interface SoundOpts {
    position?: Vec2;
    falloff: number;
    maxRange: number;
    loop: boolean;
    dynamic: boolean;
    onEnd?: () => void;
}

export class GameSound {
    readonly manager: AudioManager;

    position?: Vec2;
    falloff: number;
    maxRange: number;
    onEnd?: () => void;

    readonly dynamic: boolean;

    instance?: IMediaInstance;
    ended = false;

    stereoFilter = new filters.StereoFilter(0);

    constructor(
        public name: string,
        manager: AudioManager,
        options: SoundOpts
    ) {
        this.manager = manager;

        this.position = options.position;
        this.falloff = options.falloff;
        this.maxRange = options.maxRange;
        this.dynamic = options.dynamic;
        this.onEnd = options.onEnd;

        if (!sound.exists(name)) {
            console.warn(`Unknown sound: ${name}`);
            return;
        }

        const resource = sound.play(name, {
            loaded: (_err, _sound, instance) => {
                if (instance) this.init(instance);
            },
            filters: [this.stereoFilter],
            loop: options.loop,
            volume: this.manager.volume
        });

        if (!(resource instanceof Promise)) this.init(resource);
    }

    init(instance: IMediaInstance): void {
        this.instance = instance;

        instance.on("end", () => {
            this.onEnd?.();
            this.ended = true;
        });

        instance.on("stop", () => {
            this.ended = true;
        });

        this.update();
    }

    update(): void {
        if (this.instance && this.position) {
            const dv = v2.sub(this.manager.position, this.position);
            const t = math.clamp(Math.abs(v2.length(dv) / this.maxRange), 0, 1);

            this.instance.volume = (1 - t) ** (1 + this.falloff * 2) * this.manager.volume;
            this.stereoFilter.pan = math.clamp((dv.x / this.maxRange) * -1, -1, 1);
        }
    }

    stop(): void {
        this.instance?.stop();
        this.ended = true;
    }
}

export class AudioManager {
    /**
     * List of dynamic sounds that need to be updated as the camera position changes.
     */
    sounds: GameSound[] = [];

    volume = 1;
    position = v2.create(0, 0);

    constructor(readonly app: App) {}

    /**
     * Load all sounds.
     */
    init(): void {
        const sounds: Record<string, { default: string }> = import.meta.glob("/src/lib/audio/**/*.mp3", {
            eager: true
        });

        const soundsToLoad: Record<string, string> = {};

        for (const file in sounds) {
            const path = file.split("/");
            const name = path[path.length - 1];

            soundsToLoad[name] = sounds[file].default;
        }

        sound.add(soundsToLoad);
    }

    play(name: string, options: Partial<SoundOpts>): GameSound {
        const sound = new GameSound(name, this, { falloff: 1, maxRange: 256, dynamic: false, loop: false, ...options });

        if (sound.dynamic) this.sounds.push(sound);
        return sound;
    }

    update(): void {
        if (this.app.player) this.position = this.app.player.position;

        for (let i = 0; i < this.sounds.length; i++) {
            const sound = this.sounds[i];
            if (sound.ended) {
                this.sounds.splice(i, 1);
                continue;
            }

            sound.update();
        }
    }
}
