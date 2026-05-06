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

import { DefinitionList } from "../utils/DefinitionList";

export interface WeaponDef {
    /**
     * The English name of the weapon.
     */
    name: string;
    readonly type: "weapon";
    /**
     * The price of the weapon.
     */
    price: number;
    /**
     * The minimum rank at which the weapon can be purchased.
     */
    rank: number;
    /**
     * The ammo of the weapon.
     *
     * Any number greater than `0` is treated as standard.
     * `-1` represents infinite ammo.
     * `-2` represents a single-use weapon.
     */
    ammo: number;
    /**
     * The projectile the weapon spawns. Empty string means no projectile.
     * @default ""
     */
    projectile: "bullet" | "plasma" | "beam" | "blast" | "orb" | "mine" | "missile" | "";
    /**
     * The range of the weapon.
     *
     * `0` means the weapon does not need a range.
     * `-1` means infinite range.
     * @default 0
     */
    range: number;
    /**
     * The amount of damage the weapon's projectile deals.
     * @default 0
     */
    damage: number;
    /**
     * The positive speed modifier.
     * @default 0
     */
    speed: number;
    /**
     * The amount of energy the weapon consumes.
     * @default 0
     */
    charge: number;
    /**
     * The projectile image. Empty string means no image.
     * @default ""
     */
    image: string;
    /**
     * The firing sound used for this weapon. Empty string means no sound.
     * @default ""
     */
    sound: string;
    /**
     * Whether bots can spawn with this weapon.
     * @default false
     */
    bot: boolean;
}

const rawDefs = {
    // Empty
    "": {
        name: "",
        type: "weapon",
        price: 0,
        rank: 0,
        ammo: -2,
        projectile: "",
        range: 0,
        damage: 0,
        speed: 0,
        charge: 0,
        image: "",
        sound: "",
        bot: false
    },

    // Guns
    stock_gun: {
        name: "Stock Gun",
        type: "weapon",
        price: 0,
        rank: 0,
        ammo: -1,
        projectile: "bullet",
        range: 250,
        damage: 20,
        speed: 50,
        charge: 8,
        image: "",
        sound: "shot",
        bot: true
    },
    plasma_gun: {
        name: "Plasma Gun",
        type: "weapon",
        price: 2e3,
        rank: 2,
        ammo: 175,
        projectile: "plasma",
        range: 150,
        damage: 45,
        speed: 40,
        charge: 10,
        image: "",
        sound: "shot",
        bot: true
    },
    reverse_gun: {
        name: "Reverse Gun",
        type: "weapon",
        price: 1e3,
        rank: 1,
        ammo: -1,
        projectile: "bullet",
        range: 250,
        damage: 30,
        speed: 50,
        charge: 8,
        image: "",
        sound: "shot",
        bot: false
    },
    rifle: {
        name: "Rifle",
        type: "weapon",
        price: 5e3,
        rank: 5,
        ammo: 50,
        projectile: "bullet",
        range: 750,
        damage: 50,
        speed: 80,
        charge: 12,
        image: "",
        sound: "shot",
        bot: true
    },
    shotgun: {
        name: "Shotgun",
        type: "weapon",
        price: 5e3,
        rank: 3,
        ammo: 40,
        projectile: "bullet",
        range: 100,
        damage: 18,
        speed: 50,
        charge: 15,
        image: "",
        sound: "shot",
        bot: true
    },
    machine_gun: {
        name: "Machine Gun",
        type: "weapon",
        price: 6e3,
        rank: 4,
        ammo: 500,
        projectile: "bullet",
        range: 300,
        damage: 20,
        speed: 75,
        charge: 4,
        image: "",
        sound: "minigun",
        bot: true
    },
    minigun: {
        name: "Minigun",
        type: "weapon",
        price: 3e4,
        rank: 6,
        ammo: 500,
        projectile: "bullet",
        range: 250,
        damage: 14,
        speed: 60,
        charge: 6,
        image: "",
        sound: "minigun",
        bot: true
    },
    spreadshot: {
        name: "Spreadshot",
        type: "weapon",
        price: 3e4,
        rank: 6,
        ammo: 200,
        projectile: "bullet",
        range: 250,
        damage: 10,
        speed: 60,
        charge: 5,
        image: "",
        sound: "minigun",
        bot: true
    },
    submachinegun: {
        name: "Submachinegun",
        type: "weapon",
        price: 3e4,
        rank: 6,
        ammo: 1e3,
        projectile: "bullet",
        range: 300,
        damage: 13,
        speed: 70,
        charge: 9,
        image: "",
        sound: "minigun",
        bot: true
    },

    // Beams
    plasma_beam: {
        name: "Plasma Beam",
        type: "weapon",
        price: 6e3,
        rank: 1,
        ammo: -1,
        projectile: "beam",
        range: 200,
        damage: 5,
        speed: -1,
        charge: 4,
        image: "",
        sound: "beam",
        bot: true
    },
    laser_beam: {
        name: "Laser Beam",
        type: "weapon",
        price: 12e3,
        rank: 4,
        ammo: -1,
        projectile: "beam",
        range: 65,
        damage: 22,
        speed: -1,
        charge: 10,
        image: "",
        sound: "beam",
        bot: true
    },
    hadron_beam: {
        name: "Hadron Beam",
        type: "weapon",
        price: 3e4,
        rank: 8,
        ammo: -1,
        projectile: "beam",
        range: 135,
        damage: 80,
        speed: -1,
        charge: 50,
        image: "",
        sound: "beam",
        bot: true
    },
    mining_laser: {
        name: "Mining Laser",
        type: "weapon",
        price: 5e3,
        rank: 1,
        ammo: -1,
        projectile: "beam",
        range: 120,
        damage: 30,
        speed: -1,
        charge: 5,
        image: "",
        sound: "beam",
        bot: false
    },
    ore_cannon: {
        name: "Ore Cannon",
        type: "weapon",
        price: 2e4,
        rank: 2,
        ammo: -1,
        projectile: "beam",
        range: 280,
        damage: 60,
        speed: -1,
        charge: 5,
        image: "",
        sound: "beam",
        bot: false
    },
    destabilizer: {
        name: "Destabilizer",
        type: "weapon",
        price: 4e3,
        rank: 6,
        ammo: -1,
        projectile: "beam",
        range: 1e6,
        damage: -1,
        speed: -1,
        charge: 50,
        image: "",
        sound: "beam",
        bot: false
    },
    jammer: {
        name: "Jammer",
        type: "weapon",
        price: 11e3,
        rank: 10,
        ammo: -1,
        projectile: "beam",
        range: 75,
        damage: 0,
        speed: -1,
        charge: 30,
        image: "",
        sound: "beam",
        bot: false
    },
    healing_beam: {
        name: "Healing Beam",
        type: "weapon",
        price: 5e3,
        rank: 8,
        ammo: -1,
        projectile: "beam",
        range: 35,
        damage: -30,
        speed: 0,
        charge: 20,
        image: "",
        sound: "beam",
        bot: true
    },

    // Missiles
    missile: {
        name: "Missile",
        type: "weapon",
        price: 4e3,
        rank: 0,
        ammo: 20,
        projectile: "missile",
        range: 750,
        damage: 15,
        speed: 100,
        charge: 12,
        image: "",
        sound: "missile",
        bot: true
    },
    heavy_missile: {
        name: "Heavy Missile",
        type: "weapon",
        price: 1e4,
        rank: 3,
        ammo: 20,
        projectile: "missile",
        range: 450,
        damage: 40,
        speed: 50,
        charge: 25,
        image: "",
        sound: "missile",
        bot: true
    },
    emp_missile: {
        name: "EMP Missile",
        type: "weapon",
        price: 4e4,
        rank: 7,
        ammo: 10,
        projectile: "missile",
        range: 600,
        damage: 15,
        speed: 90,
        charge: 25,
        image: "",
        sound: "missile",
        bot: false
    },
    missile_swarm: {
        name: "Missile Swarm",
        type: "weapon",
        price: 6e4,
        rank: 9,
        ammo: 20,
        projectile: "missile",
        range: 750,
        damage: -1,
        speed: 45,
        charge: 18,
        image: "",
        sound: "missile",
        bot: true
    },
    torpedo: {
        name: "Torpedo",
        type: "weapon",
        price: 18e3,
        rank: 5,
        ammo: 15,
        projectile: "missile",
        range: 5e3,
        damage: 15,
        speed: 180,
        charge: 30,
        image: "",
        sound: "missile",
        bot: true
    },
    proximity_fuze: {
        name: "Proximity Fuze",
        type: "weapon",
        price: 5e3,
        rank: 5,
        ammo: 20,
        projectile: "missile",
        range: 600,
        damage: 80,
        speed: 75,
        charge: 25,
        image: "",
        sound: "missile",
        bot: true
    },

    // Mines
    mine: {
        name: "Mine",
        type: "weapon",
        price: 1e3,
        rank: 0,
        ammo: 20,
        projectile: "mine",
        range: 96,
        damage: 140,
        speed: 0,
        charge: 15,
        image: "",
        sound: "",
        bot: false
    },
    laser_mine: {
        name: "Laser Mine",
        type: "weapon",
        price: 6e3,
        rank: 3,
        ammo: 10,
        projectile: "mine",
        range: 192,
        damage: 90,
        speed: 0,
        charge: 75,
        image: "",
        sound: "",
        bot: false
    },
    emp_mine: {
        name: "EMP Mine",
        type: "weapon",
        price: 1e4,
        rank: 6,
        ammo: 5,
        projectile: "mine",
        range: 96,
        damage: 72,
        speed: 0,
        charge: 25,
        image: "",
        sound: "",
        bot: false
    },
    impulse_mine: {
        name: "Impulse Mine",
        type: "weapon",
        price: 6e3,
        rank: 4,
        ammo: 10,
        projectile: "mine",
        range: 20,
        damage: 0,
        speed: -1,
        charge: 25,
        image: "",
        sound: "",
        bot: false
    },
    grenades: {
        name: "Grenades",
        type: "weapon",
        price: 8e3,
        rank: 3,
        ammo: 10,
        projectile: "mine",
        range: 22,
        damage: 100,
        speed: 25,
        charge: 25,
        image: "",
        sound: "",
        bot: false
    },
    pulse_mine: {
        name: "Pulse Mine",
        type: "weapon",
        price: 8e3,
        rank: 4,
        ammo: 3,
        projectile: "mine",
        range: 25,
        damage: 8,
        speed: 0,
        charge: 30,
        image: "",
        sound: "",
        bot: false
    },
    magnetic_mine: {
        name: "Magnetic Mine",
        type: "weapon",
        price: 1e4,
        rank: 12,
        ammo: 10,
        projectile: "mine",
        range: 50,
        damage: 100,
        speed: 0,
        charge: 45,
        image: "",
        sound: "",
        bot: true
    },
    campfire: {
        name: "Campfire",
        type: "weapon",
        price: 5e3,
        rank: 5,
        ammo: 2,
        projectile: "mine",
        range: 100,
        damage: -30,
        speed: 0,
        charge: 90,
        image: "",
        sound: "",
        bot: false
    },

    // Blasts
    emp_blast: {
        name: "EMP Blast",
        type: "weapon",
        price: 5e4,
        rank: 9,
        ammo: 2,
        projectile: "blast",
        range: 100000,
        damage: -1,
        speed: -1,
        charge: 50,
        image: "",
        sound: "beam",
        bot: true
    },
    muon_ray: {
        name: "Muon Ray",
        type: "weapon",
        price: 1e6,
        rank: 10,
        ammo: 1,
        projectile: "blast",
        range: 1e4,
        damage: 300,
        speed: -1,
        charge: 100,
        image: "",
        sound: "beam",
        bot: false
    },
    hypno_ray: {
        name: "Hypno Ray",
        type: "weapon",
        price: 6e3,
        rank: 5,
        ammo: -2,
        projectile: "blast",
        range: 1e4,
        damage: 0,
        speed: -1,
        charge: 25,
        image: "",
        sound: "beam",
        bot: true
    },
    lepton_pulse: {
        name: "Lepton Pulse",
        type: "weapon",
        price: 25e3,
        rank: 8,
        ammo: -1,
        projectile: "blast",
        range: 1e4,
        damage: 20,
        speed: -1,
        charge: 15,
        image: "",
        sound: "beam",
        bot: true
    },

    // Orbs
    energy_disk: {
        name: "Energy Disk",
        type: "weapon",
        price: 5e3,
        rank: 0,
        ammo: 15,
        projectile: "orb",
        range: 150,
        damage: 30,
        speed: 8,
        charge: 25,
        image: "",
        sound: "",
        bot: true
    },
    photon_orb: {
        name: "Photon Orb",
        type: "weapon",
        price: 1e4,
        rank: 6,
        ammo: -1,
        projectile: "orb",
        range: 140,
        damage: 18,
        speed: 8,
        charge: 12,
        image: "",
        sound: "",
        bot: false
    },

    // Misc
    hull_nanobots: {
        name: "Hull Nanobots",
        type: "weapon",
        price: 5e4,
        rank: 8,
        ammo: 4,
        projectile: "",
        range: -1,
        damage: -150,
        speed: -1,
        charge: 150,
        image: "",
        sound: "",
        bot: true
    },
    photon_cloak: {
        name: "Photon Cloak",
        type: "weapon",
        price: 3e4,
        rank: 4,
        ammo: 3,
        projectile: "",
        range: -1,
        damage: -1,
        speed: -1,
        charge: 25,
        image: "",
        sound: "",
        bot: false
    },
    generator: {
        name: "Generator",
        type: "weapon",
        price: 8e4,
        rank: 9,
        ammo: -1,
        projectile: "",
        range: -1,
        damage: -1,
        speed: -1,
        charge: 0,
        image: "",
        sound: "",
        bot: false
    },
    turbo: {
        name: "Turbo",
        type: "weapon",
        price: 15e3,
        rank: 2,
        ammo: -1,
        projectile: "",
        range: -1,
        damage: -1,
        speed: 1.02,
        charge: 0,
        image: "",
        sound: "",
        bot: false
    },
    hyperdrive: {
        name: "Hyperdrive",
        type: "weapon",
        price: 6e3,
        rank: 5,
        ammo: -2,
        projectile: "",
        range: -1,
        damage: -1,
        speed: 11111,
        charge: 150,
        image: "",
        sound: "hyperspace",
        bot: false
    },
    pulse_wave: {
        name: "Pulse Wave",
        type: "weapon",
        price: 25e3,
        rank: 7,
        ammo: 1,
        projectile: "",
        range: 1e4,
        damage: 0,
        speed: 40,
        charge: 75,
        image: "",
        sound: "",
        bot: false
    },
    electromagnet: {
        name: "Electromagnet",
        type: "weapon",
        price: 4e4,
        rank: 8,
        ammo: -1,
        projectile: "",
        range: 512,
        damage: 0.1666,
        speed: -1,
        charge: 0,
        image: "",
        sound: "",
        bot: false
    },
    turret: {
        name: "Turret",
        type: "weapon",
        price: 75e4,
        rank: 10,
        ammo: -2,
        projectile: "",
        range: 750,
        damage: 30,
        speed: -1,
        charge: 8,
        image: "",
        sound: "",
        bot: false
    },
    gravity_bomb: {
        name: "Gravity Bomb",
        type: "weapon",
        price: 1e7,
        rank: 10,
        ammo: -2,
        projectile: "",
        range: 3e3,
        damage: 300,
        speed: 10,
        charge: 0,
        image: "",
        sound: "",
        bot: false
    },
    warp_drive: {
        name: "Warp Drive",
        type: "weapon",
        price: 15e4,
        rank: 7,
        ammo: 2,
        projectile: "",
        range: -1,
        damage: -1,
        speed: 716,
        charge: 80,
        image: "",
        sound: "",
        bot: false
    },
    supercharger: {
        name: "Supercharger",
        type: "weapon",
        price: 1e5,
        rank: 11,
        ammo: -2,
        projectile: "",
        range: -1,
        damage: -1,
        speed: -1,
        charge: 0,
        image: "",
        sound: "",
        bot: true
    },
    navigational_shield: {
        name: "Navigational Shield",
        type: "weapon",
        price: 6e4,
        rank: 13,
        ammo: -1,
        projectile: "",
        range: 0,
        damage: 0,
        speed: 0,
        charge: -1,
        image: "",
        sound: "",
        bot: false
    }
} satisfies Record<string, WeaponDef>;

export type WeaponDefKey = keyof typeof rawDefs;

export const WeaponDefs = new DefinitionList<WeaponDefKey, WeaponDef>(rawDefs);
