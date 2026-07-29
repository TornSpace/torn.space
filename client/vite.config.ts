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

import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption, type ServerOptions } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

import { atlasPlugin } from "./atlases/atlasPlugin.ts";

export default defineConfig(({ mode }) => {
    const isDev = mode === "development";

    const plugins: PluginOption[] = [...atlasPlugin(), tailwindcss(), sveltekit()];

    const serverOptions: ServerOptions = {
        port: 3000,
        strictPort: true,
        host: "127.0.0.1",
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8080",
                changeOrigin: true,
                secure: false
            }
        }
    };

    if (!isDev) plugins.push(ViteImageOptimizer({ logStats: true }));

    return {
        server: serverOptions,
        preview: serverOptions,

        css: {
            devSourcemap: isDev
        },

        json: {
            stringify: true
        },

        plugins,

        logLevel: isDev ? "info" : "warn",
        clearScreen: false
    };
});
