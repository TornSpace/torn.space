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

import { AbstractServerEntity, EntityPool, type ServerEntity } from "./Entity";

import { WeaponManager } from "../modules/WeaponManager";

import type { Client } from "../modules/ClientManager";
import type { Game } from "../modules/Game";
import type { Base } from "./universe/Base";
import type { InputPacket } from "@/common/net/InputPacket";
import type { JoinPacket } from "@/common/net/JoinPacket";
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { EntityType, GameConstants, Team, Trail, type LeaderboardEntry, type PlayerSaveData } from "@/common/constants";
import { ShipDefs, type ShipDefKey } from "@/common/defs/shipDefs";
import { WeaponDefs, type WeaponDefKey } from "@/common/defs/weaponDefs";
import { CircleHitbox } from "@/common/utils/hitbox";
import { math } from "@/common/utils/math";
import { v2, type Vec2 } from "@/common/utils/v2";

interface PlayerDamageParams {
    position: Vec2;
    amount: number;
    source?: ServerEntity;
}

export class Player extends AbstractServerEntity {
    readonly __type = EntityType.Player;
    readonly hitbox = new CircleHitbox(0);

    readonly dirty = {
        id: true,
        hp: true,
        weapons: true,
        ammo: true,
        ore: true
    };

    name = "";
    client!: Client;
    team!: Team;

    velocity = v2.new(0, 0);
    direction = v2.new(0, 0);

    weaponManager = new WeaponManager(this);

    lastDockId = -1;

    // Keybinds.
    moveFwd = false;
    moveBwd = false;
    turnLeft = false;
    turnRight = false;
    jukeLeft = false;
    jukeRight = false;
    drift = false;
    attack = false;
    tryShield = false;
    cslot = false;

    guild: number | undefined = undefined;

    // States.
    dead = false;
    shield = false;
    docked = false;

    balance = 8000;
    lives = 20;
    ship: ShipDefKey = "r0";
    xp = 0;
    rank = 0;
    trail = Trail.None;
    activeWeapon = 0;

    weapons = new Array<WeaponDefKey>(GameConstants.player.weaponSlots).fill("");
    ammo = new Array<number>(GameConstants.player.weaponSlots).fill(0);

    readonly tech = {
        speed: 1,
        radar: 1,
        cargo: 1,
        hp: 1,
        energy: 1,
        agility: 1
    };

    // Asteroids.
    readonly ores = {
        iron: 0,
        silver: 0,
        copper: 0,
        platinum: 0
    };

    // Stats
    readonly stats = {
        kills: 0,
        baseKills: 0,
        driftTime: 0
    };

    // Timers.
    baseTimer = 0;
    borderTimer = 0;
    cloakTimer = 0;
    empTimer = 0;
    gyroTimer = 0;
    hyperdriveTimer = 0;
    jukeTimer = 0;
    superchargerTimer = 0;

    private _hp = 1;
    private _charge = 0;

    get charge(): number {
        return this._charge;
    }

    set charge(charge: number) {
        if (charge === this.charge) return;
        this.charge = math.clamp(this.charge, 0, this.charge);
    }

    get hp(): number {
        return this._hp;
    }

    set hp(hp: number) {
        if (hp === this.hp) return;

        this.hp = math.clamp(hp, 0, this.maxHP);
        this.dirty.hp = true;
    }

    get maxHP(): number {
        const def = ShipDefs.typeToDef(this.ship);

        return def.hp * this.tech.hp;
    }

    get oreCount(): number {
        return this.ores.iron + this.ores.silver + this.ores.copper + this.ores.platinum;
    }

    override get position(): Vec2 {
        return this.hitbox.position;
    }

    override set position(pos: Vec2) {
        this.hitbox.position = pos;
        this._position = pos;
    }

    init(client: Client, name: string, team: Team, data?: PlayerSaveData): void {
        this.client = client;
        this.name = name;
        this.team = team;

        // Find the base associated with the sector.
        // TODO: Probably try and make this efficient.
        // This is also used in multiple locations. Maybe extract to common function?
        let base: Base | undefined;
        if (data?.sector) base = this.game.baseManager.pool.find(base => v2.eq(data.sector, base.sector));
        if (!data?.sector || !base) {
            const teamBases = this.game.baseManager.pool.filter(base => base.team === this.team);
            base = teamBases[Math.floor(Math.random() * teamBases.length)];
        }

        // Spawn player at the last logged-off base.
        this.lastDockId = base.id;
        this.dock(base);

        // Restore player data, if logged in.
        if (data) {
            this.xp = data.xp;
            this.rank = data.rank;
            this.balance = data.balance;
            this.lives = data.lives;
            this.guild = data.guild;
            this.ship = `r${data.ship}` as ShipDefKey;
            this.trail = data.trail;
            this.weapons = data.weapons;
            this.tech.speed = data.speed;
            this.tech.radar = data.radar;
            this.tech.cargo = data.cargo;
            this.tech.hp = data.hp;
            this.tech.energy = data.energy;
            this.tech.agility = data.agility;
            this.ores.iron = data.iron;
            this.ores.silver = data.silver;
            this.ores.copper = data.copper;
            this.ores.platinum = data.platinum;
            this.stats.kills = data.kills;
            this.stats.baseKills = data.baseKills;
            this.stats.driftTime = data.driftTime;
            // this.achievements = data.achievements;
            // this.quests = data.quests;
            // this.planets = data.planets;
            // this.sectors = data.sectors;
        }

        // Undock player. We give them 3 extra seconds of shielding in case someone is camping.
        this.undock();
        this.baseTimer += 3 * this.game.config.tps;
    }

    dock(base: Base): void {
        if (this.docked) return;

        this.sector = base.sector;
        this.position = v2.new(GameConstants.maxPosition / 2, GameConstants.maxPosition / 2);
        this.docked = true;
    }

    undock(): void {
        if (!this.docked) return;

        this.charge = 0;
        this.hp = this.maxHP;
        this.refillAmmo();

        this.baseTimer = 3 * this.game.config.tps;

        this.docked = false;
    }

    refillAmmo(): void {
        for (let i = 0; i < this.weapons.length; i++) {
            const wep = this.weapons[i];
            if (wep === "") continue;

            this.ammo[i] = WeaponDefs.typeToDef(wep).ammo;
        }
    }

    update(dt: number): void {
        if (this.dead) return;

        // Timer extravaganza.
        if (this.baseTimer >= 0) this.baseTimer -= dt;
        if (this.borderTimer >= 0) this.borderTimer -= dt;
        if (this.cloakTimer >= 0) this.cloakTimer -= dt;
        if (this.empTimer >= 0) this.empTimer -= dt;
        if (this.gyroTimer >= 0) this.gyroTimer -= dt;
        if (this.hyperdriveTimer >= 0) this.hyperdriveTimer -= dt;
        if (this.jukeTimer >= 0) this.jukeTimer -= dt;
        if (this.superchargerTimer >= 0) this.superchargerTimer -= dt;

        // Heal the player over time.
        if (!this.shield && this.hp < this.maxHP) this.hp += dt * GameConstants.player.healRate;

        /**
         * For a player to drift, the following conditions must be satisfied:
         * - They cannot be EMP'd.
         * - They must be pressing the drift key OR (not exclusive) be under the effect of a destabilizer.
         */
        const drifting = this.empTimer <= 0 && (this.gyroTimer > 0 || this.drift);

        // If the player is drifting or EMP'd, they cannot use their shield.
        this.shield = (!drifting && this.empTimer <= 0) || this.baseTimer > 0;

        // The player cannot conduct any further actions while EMP'd.
        if (this.empTimer > 0) return;

        this.move(dt, drifting);
        if (this.attack && this.charge > 0) this.fireWeapon();
    }

    /**
     * EMP a player.
     * @param duration The base duration, in seconds, of the EMP.
     */
    emp(duration: number): void {
        const ship = ShipDefs.typeToDef(this.ship);

        // EMP works better against elite ships.
        if (ship.elite) duration *= 1.25;

        // Player instantly stops moving.
        this.velocity.x = 0;
        this.velocity.y = 0;

        // Actually EMP the player.
        this.empTimer = duration * this.game.config.tps;
    }

    /**
     * Damage a player.
     * @param params Damage parameters.
     */
    dmg(_params: PlayerDamageParams): void {}

    /**
     * Player movement.
     * @param drifting Whether the player is currently drifting.
     */
    move(dt: number, _drifting: boolean): void {
        if (this.hyperdriveTimer > 0) {
        }

        // Update position from velocity.
        v2.add(this.position, this.velocity);

        // Juking.
        if ((this.jukeLeft || this.jukeRight) && this.charge > 0) {
            this.charge = -22;

            this.jukeTimer = (this.trail === Trail.Random ? 1.25 : 1) * (this.jukeLeft ? 22 : -22);
        }

        if (Math.abs(this.jukeTimer) > 1) {
            this.position.x += this.jukeTimer * this.direction.y;
            this.position.y -= this.jukeTimer * this.direction.x;

            this.jukeTimer *= 0.03 * dt;
        }
    }

    fireWeapon(): void {}

    fireEliteWeapon(): void {}

    jettisonCargo(): void {
        this.ores.iron = this.ores.silver = this.ores.copper = this.ores.platinum = 0;
    }

    /**
     * Process a given input packet.
     * @param packet The packet to process.
     */
    processInput(packet: InputPacket): void {
        if (this.dead) return;

        this.moveFwd = packet.moveFwd;
        this.moveBwd = packet.moveBwd;
        this.turnLeft = packet.turnLeft;
        this.turnRight = packet.turnRight;
        this.jukeLeft = packet.jukeLeft;
        this.jukeRight = packet.jukeRight;
        this.drift = packet.drift;

        this.attack = packet.attack;
        this.tryShield = packet.shield;
        this.cslot = packet.cslot;

        if (this.weapons[packet.queuedWeapon]) this.weaponManager.queuedWeapon = packet.queuedWeapon;
    }

    get data(): Required<EntitiesNetData[EntityType.Player]> {
        return {
            position: this.position,
            direction: this.direction,
            full: {
                dead: this.dead
            }
        };
    }
}

export class PlayerManager extends EntityPool<Player> {
    override readonly type = EntityType.Player;

    players: Player[] = [];
    newPlayers: Player[] = [];
    deletedPlayers: number[] = [];

    leaderboard: LeaderboardEntry[] = [];
    leaderboardDirty = true;

    constructor(game: Game) {
        super(game, Player);
    }

    addPlayer(client: Client, packet: JoinPacket, team: Team, data?: PlayerSaveData): Player {
        const player = this.allocEntity(
            client,
            packet.username || `${GameConstants.player.defaultName} ${this.game.guestIdx}`,
            team,
            data
        );

        this.newPlayers.push(player);
        this.players.push(player);

        this.resetPlayer(player);
        this.updateLeaderboard();

        this.game.logger.info("Server", `"${player.name} joined the game.`);

        return player;
    }

    resetPlayer(player: Player): void {
        // TODO: Try and optimize below O(n).
        const teamBases = this.game.baseManager.pool.filter(base => base.team === player.team);
        const base = teamBases[Math.floor(Math.random() * teamBases.length)];

        player.position = base.position;

        this.game.grid.updateEntity(player);

        player.hp = player.maxHP;
        player.jettisonCargo();
        player.refillAmmo();

        player.dead = false;

        player.setFullDirty();

        for (const key in player.dirty) {
            player.dirty[key as keyof typeof player.dirty] = true;
        }

        player.activeWeapon = 0;
    }

    removePlayer(player: Player): void {
        player.destroy();
        this.deletedPlayers.push(player.id);

        this.game.logger.info(`"${player.name}" left the game.`);
    }

    updateLeaderboard(): void {
        const count = Math.min(this.players.length, GameConstants.leaderboardMaxEntries);
        const newBoard = this.players
            .map(x => ({ playerId: x.id, xp: x.xp, rank: x.rank }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, count);

        if (this.isLeaderboardDirty(newBoard)) {
            this.leaderboard = newBoard;
            this.leaderboardDirty = true;
        }
    }

    isLeaderboardDirty(other: LeaderboardEntry[]): boolean {
        if (this.leaderboard.length !== other.length) return true;

        for (let i = 0; i < other.length; i++) {
            const newEntry = other[i];
            const oldEntry = this.leaderboard[i];

            if (newEntry.playerId !== oldEntry.playerId) return true;
            if (newEntry.xp !== oldEntry.xp) return true;
            if (newEntry.rank !== oldEntry.rank) return true;
        }

        return false;
    }

    flush(): void {
        this.deletedPlayers.length = 0;
        this.newPlayers.length = 0;

        this.leaderboardDirty = false;

        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            for (const key in player.dirty) player.dirty[key as keyof Player["dirty"]] = false;

            // Delete unregistered players.
            if (!player.__type) {
                this.players.slice(i, 1);
                continue;
            }
        }
    }
}
