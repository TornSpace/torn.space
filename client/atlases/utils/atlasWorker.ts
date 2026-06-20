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

import { AtlasBuilder } from "./AtlasBuilder.ts";
import { ImageManager } from "./ImageManager.ts";

import { Logger } from "../../../common/src/utils/Logger.ts";

import type { Atlas } from "./AtlasManager.ts";
import type { SpritesheetData } from "pixi.js";

const logger = new Logger({
    timestamp: false,
    info: false,
    debug: false,
    warn: false,
    error: true
});

const cache = new ImageManager(logger);
await cache.loadFromDisk();

process.on("message", async (msg: MainToWorkerMsg) => {
    const res: WorkerToMainMsg = [];

    for (const atlas of msg) {
        const builder = new AtlasBuilder(atlas.name, cache, logger);
        await builder.build();

        res.push({
            name: atlas.name,
            hash: atlas.hash,
            data: builder.atlases
        });
    }

    process.send!(res);
});

export type Atlases = { name: Atlas; hash: string };

export type MainToWorkerMsg = Atlases[];

export type WorkerToMainMsg = Array<
    Atlases & {
        data: Array<{
            data: SpritesheetData;
            buffer: Buffer;
        }>;
    }
>;
