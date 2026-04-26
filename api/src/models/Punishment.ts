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

import { pgEnum, pgTable } from "drizzle-orm/pg-core";

// import { User } from "./User.js";

/**
 * This is not guaranteed to be the same as ReportReason. This is why that enum is not being used here.
 */
export enum PunishmentReason {
    Cheating = "cheating",
    BadChat = "chat",
    BadName = "badname",
    Other = "other"
}

export enum PunishmentAction {
    Warn = "warn",
    Mute = "mute",
    Tempban = "tempban",
    Ban = "ban" // This is a permanent ban.
}

export const PunishmentReasonEnum = pgEnum("punishmentReason", PunishmentReason);
export const PunishmentActionEnum = pgEnum("punishmentAction", PunishmentAction);

export const Punishment = pgTable("punishment", t => ({
    id: t.serial().primaryKey(),
    uuid: t.uuid().notNull().unique().defaultRandom(),
    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: t.timestamp({ withTimezone: true }),
    expiresAt: t.timestamp({ withTimezone: true }),
    targetName: t.varchar({ length: 16 }).notNull(),
    targetIp: t.text().notNull(),
    // targetId: t.integer(),
    /**
     * Currently, we do not have website-based moderation. So, instead of a User-based ID, we use the Discord user ID.
     */
    issuerDiscordId: t.text().notNull(),
    // issuerId: t.integer().notNull().references(() => User.id, {
    //     onDelete: "no action",
    //     onUpdate: "cascade"
    // }),
    active: t.boolean().notNull().default(false),
    action: PunishmentActionEnum().notNull(),
    reason: PunishmentReasonEnum().notNull(),
    note: t.text()
}));
