import type { Team } from "@/common/constants";

export enum SortOrder {
    Experience,
    ELO,
    Kills,
    Money,
    Tech
}

export interface LeaderboardEntry {
    /**
     * Position of the player.
     */
    p: number;
    /**
     * Name of the player.
     */
    n: string;
    /**
     * Team of the player.
     */
    t: Team;
    /**
     * Experience of the player.
     */
    x: number;
    /**
     * ELO of the player.
     */
    e: number;
    /**
     * Kills of the player.
     */
    k: number;
    /**
     * Money of the player.
     */
    m: number;
    /**
     * Tech of the player.
     */
    r: number;
}
