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

import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";

export interface AtlasDef {
    compress: boolean;
    images: string[];
}

function readPath(path: string): string[] {
    return readdirSync(resolve(import.meta.dirname, "../src/lib/img", path), { recursive: true, encoding: "utf-8" })
        .filter(x => x.endsWith(".svg") || x.endsWith(".png") || x.endsWith(".jpg"))
        .map(x => join(path, x).replace(/\\/g, "/"));
}

// Spritesheets.
export const AsteroidSpritesheets = readPath("asteroids");

// Sprites.
export const AuraSprites = readPath("aura");
export const BaseSprites = readPath("bases");
export const ShipSprites = readPath("ships");
export const LootSprites = readPath("loot");
export const PlanetSprites = readPath("planets");
export const TurretSprites = readPath("turrets");
export const VortexSprites = readPath("vorts");
export const WeaponSprites = [
    readPath("weapons/bullets"),
    readPath("weapons/mines"),
    readPath("weapons/missiles"),
    readPath("weapons/orbs"),
    "weapons/misc/shockwave.png"
].flat();

// UI Sprites.
export const UISprites = {
    map: readPath("ui/map")
};
