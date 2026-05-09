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

import { join, relative } from "node:path";

import { AtlasManager, type Atlas } from "./utils/AtlasManager";

import type { Plugin, ViteDevServer } from "vite";

export function atlasPlugin(): Plugin[] {
    const manager = new AtlasManager();
    return [
        {
            name: "atlas:build",
            apply: "build",
            async buildStart() {
                await manager.buildChangedAtlases();

                // Reset cached.
                manager.atlasesJSON = {};

                // Create new cache.
                for (const atlas of Object.keys(manager.atlasCache) as Atlas[]) {
                    const data = await manager.getAtlas(atlas);
                    const hash = manager.atlasCache[atlas];

                    for (const sheet of data) {
                        const path = join(manager.getAtlasFolderPath(atlas, hash), sheet.meta.image!);
                        const data = await Bun.file(path).text();

                        const newHash = AtlasManager.hasher.update(data).digest("hex").substring(0, 8);
                        const fileName = `assets/${sheet.meta.image!.replace(".png", `-${newHash}.png`)}`;

                        this.emitFile({
                            type: "asset",
                            fileName,
                            source: data
                        });

                        sheet.meta.image = fileName;
                    }

                    (manager.atlasesJSON[atlas] ??= []).push(...data);
                }
            },
            load(id, _options) {
                load(manager.atlasesJSON, id, manager.buildPromise);
            },
            resolveId(source, _importer, _options) {
                resolveId(source, manager.buildPromise);
            }
        },
        {
            name: "atlas:serve",
            apply: "serve",
            async configureServer(server) {
                server.watcher.on("add", function (path, _stats) {
                    watchCb(manager, server, path);
                });

                server.watcher.on("change", function (path, _stats) {
                    watchCb(manager, server, path);
                });

                manager.buildPromise = devBuild(manager, server);
                await manager.buildPromise;
            },
            load(id, _options) {
                load(manager.atlasesJSON, id, manager.buildPromise);
            },
            resolveId(source, _importer, _options) {
                resolveId(source, manager.buildPromise);
            }
        }
    ];
}

async function devBuild(manager: AtlasManager, server: ViteDevServer): Promise<void> {
    await manager.buildChangedAtlases();

    // Reset cached.
    manager.atlasesJSON = {};

    // Create new cache.
    for (const atlas of Object.keys(manager.atlasCache) as Atlas[]) {
        const data = await manager.getAtlas(atlas);
        const hash = manager.atlasCache[atlas];

        for (const sheet of data) {
            sheet.meta.image = relative(
                import.meta.dirname,
                join(manager.getAtlasFolderPath(atlas, hash), sheet.meta.image!)
            ).replace(/\\/g, "/"); // windows moment
        }

        (manager.atlasesJSON[atlas] ??= []).push(...data);
    }

    const module = server.moduleGraph.getModuleById("atlases");
    if (module !== undefined) void server.reloadModule(module);
}

async function load(
    atlases: AtlasManager["atlasesJSON"],
    id: string,
    buildPromise: Promise<void> | undefined
): Promise<string | void> {
    if (!id.startsWith("atlases-")) return;
    if (buildPromise) await buildPromise;

    return `export default JSON.parse("${JSON.stringify(atlases)}");`;
}

async function resolveId(source: string, buildPromise: Promise<void> | undefined): Promise<string | void> {
    if (!source.startsWith("virtual-atlases")) return;
    if (buildPromise) await buildPromise;

    return "atlases";
}

/**
 * When committing actions that change many sprites (i.e. switching branches), the filesystem watcher can trigger many changes.
 * We don't want to rebuild the atlases for each individual file that changes.
 *
 * Thus, we throttle to wait for more.
 * @param manager The atlas manager.
 */
function scheduleRebuild(manager: AtlasManager, server: ViteDevServer): void {
    clearTimeout(manager.rebuildTimeout);

    manager.rebuildTimeout = setTimeout(async () => {
        manager.buildPromise = devBuild(manager, server);
        await manager.buildPromise;
    }, 500);
}

function watchCb(manager: AtlasManager, server: ViteDevServer, path: string): void {
    if (path.endsWith(".svg") || path.endsWith(".png") || path.endsWith("jpg")) {
        const relativePath = relative(AtlasManager.imgFolder, path);
        manager.logger.info("Atlas", `Image "${relativePath}" changed, scheduling atlas rebuild.`);

        scheduleRebuild(manager, server);
    }
}
