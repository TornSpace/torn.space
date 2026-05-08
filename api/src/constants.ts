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

import { pgEnum } from "drizzle-orm/pg-core";

/**
 * This should have the same keys as `Team`.
 */
export enum RawPlayerTeam {
    Human = "human",
    Alien = "alien",
    Cyborg = "cyborg"
}

/**
 * This should have the same keys as `Trail`.
 */
export enum RawPlayerTrail {
    None = "none",
    Blood = "blood",
    Money = "money",
    Panda = "panda",
    Random = "random",
    Rainbow = "rainbow"
}

export enum RawPunishmentReason {
    Cheating = "cheating",
    BadChat = "chat",
    BadName = "badname",
    Other = "other"
}

export enum RawPunishmentAction {
    Warn = "warn",
    Mute = "mute",
    Tempban = "tempban",
    Ban = "ban" // This is a permanent ban.
}

export const PlayerTeam = pgEnum("player_team", RawPlayerTeam);
export const PlayerTrail = pgEnum("player_trail", RawPlayerTrail);

export const PunishmentReason = pgEnum("punishment_reason", RawPunishmentReason);
export const PunishmentAction = pgEnum("punishment_action", RawPunishmentAction);
