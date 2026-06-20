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

import { pgTable } from "drizzle-orm/pg-core";

import { Guild } from "./Guild.ts";

import { PlayerTeam, PlayerTrail, RawPlayerTrail } from "../constants.ts";

import { GameConstants } from "@/common/constants.ts";

export const User = pgTable("user", t => ({
    id: t.serial().primaryKey(),
    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    username: t.varchar({ length: GameConstants.player.maxNameLength }).notNull().unique(),
    email: t.varchar({ length: 64 }).notNull().unique(),
    token: t.varchar({ length: 64 }).notNull(),
    /**
     * User permissions.
     */
    // role: PlayerRole()

    // basic player data
    xp: t.integer().notNull().default(0),
    rank: t.integer().notNull().default(0),
    team: PlayerTeam().notNull(),
    balance: t.integer().notNull().default(GameConstants.player.initialBalance),
    lives: t.integer().notNull().default(GameConstants.player.maxLives),
    guild: t.integer().references(() => Guild.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),

    // ship details
    ship: t.integer().notNull().default(0),
    trail: PlayerTrail().notNull().default(RawPlayerTrail.None),
    sector: t.point({ mode: "xy" }).notNull(),
    weapons: t.text().array().notNull().default(new Array(10).fill(null)),

    // tech
    speed: t.integer().notNull().default(0),
    radar: t.integer().notNull().default(0),
    cargo: t.integer().notNull().default(0),
    hp: t.integer().notNull().default(0),
    energy: t.integer().notNull().default(0),
    agility: t.integer().notNull().default(0),

    // cargo
    iron: t.integer().notNull().default(0),
    silver: t.integer().notNull().default(0),
    copper: t.integer().notNull().default(0),
    platinum: t.integer().notNull().default(0),

    // stats
    kills: t.integer().notNull().default(0),
    baseKills: t.integer().notNull().default(0),
    driftTime: t.integer().notNull().default(0),

    // achs
    achievements: t.integer().array().notNull().default([]),
    planets: t.integer().array().notNull().default([]),
    sectors: t.integer().array().notNull().default([])
}));
