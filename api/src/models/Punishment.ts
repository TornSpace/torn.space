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

import { User } from "./User";

import { PunishmentAction, PunishmentReason } from "../constants";

export const Punishment = pgTable("punishment", t => ({
    id: t.serial().primaryKey(),
    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: t.timestamp({ withTimezone: true }),
    expiresAt: t.timestamp({ withTimezone: true }),
    targetIp: t.text().notNull(),
    targetId: t.integer(),
    issuerId: t
        .integer()
        .notNull()
        .references(() => User.id, {
            onDelete: "no action",
            onUpdate: "cascade"
        }),
    active: t.boolean().notNull().default(false),
    action: PunishmentAction().notNull(),
    reason: PunishmentReason().notNull(),
    note: t.text()
}));
