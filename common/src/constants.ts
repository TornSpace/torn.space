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

export enum EntityType {
    Invalid,
    Loot,
    Player
}

export const GameConstants = {
    gameSpeed: 1,
    leaderboardMaxEntries: 25,
    lootRadius: 16,
    /**
     * How many sectors per side on the map.
     */
    mapSize: 7,
    /**
     * The sector width (in game units).
     * Must be divisible by 2048.
     */
    sectorWidth: 14336,
    maxPosition: 1024,
    maxEntityId: (1 << 16) - 1,
    maxChatLength: 256,
    player: {
        defaultName: "Guest",
        maxNameLength: 16,
        /**
         * The rate at which players heal per tick.
         * The default is 6 hp per second.
         * @default 0.05
         */
        healRate: 0.05,
        /**
         * Viewport radius. Should be the maximum of the two viewport dimensions.
         */
        viewRadius: 10,
        /**
         * The maximum number of weapon slots a player can have.
         */
        weaponSlots: 10
    }
};

export interface LeaderboardEntry {
    playerId: number;
    rank: number;
    xp: number;
}

export enum PacketType {
    // Client (to server)
    Join, // MUST ALWAYS BE FIRST
    Disconnect,
    DebugToggle,
    Chat,
    Input,
    Respawn,

    // Server (to client)
    Announcement,
    ChatServer,
    Death,
    Debug,
    Joined,
    Kill,
    Raid,
    Update
}

export enum Team {
    Human,
    Alien,
    Cyborg
}

export enum Trail {
    /**
     * Default trail.
     */
    None,
    /**
     * 1.25x damage.
     */
    Blood,
    /**
     * 1.25x income.
     */
    Money,
    /**
     * 1.25x agility.
     */
    Panda,
    /**
     * 1.25x juking...
     */
    Random,
    /**
     * 1.25x something...
     */
    Rainbow
}

export type ValidEntityType = Exclude<EntityType, EntityType.Invalid>;
