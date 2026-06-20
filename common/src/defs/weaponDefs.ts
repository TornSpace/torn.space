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

import { Team } from "../constants.ts";
import { DefinitionList } from "../utils/DefinitionList.ts";

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
    projectile: "bullet" | "beam" | "blast" | "orb" | "mine" | "missile" | "";
    /**
     * The projectile image. Empty string in any subfields means no image.
     */
    image: { default: string } | Record<Team, string>;
    /**
     * The projectile color. Undefined means no color.
     * Only used for beams & blasts.
     * @default undefined
     */
    color?: number;
    /**
     * The firing sound used for this weapon. Empty string means no sound.
     * @default ""
     */
    sound: string;
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
     * Whether bots can spawn with this weapon.
     * @default false
     */
    bot: boolean;
    /**
     * Whether this weapon is purchaseable.
     * @default true
     */
    inShop: boolean;
}

const rawDefs = {
    "": {
        name: "Empty",
        type: "weapon",
        price: 0,
        rank: 0,
        ammo: 0,
        projectile: "",
        image: {
            [Team.Human]: "",
            [Team.Alien]: "",
            [Team.Cyborg]: ""
        },
        sound: "",
        range: 0,
        damage: 0,
        speed: 0,
        charge: 0,
        bot: false,
        inShop: false
    },

    // Guns
    stock_gun: {
        name: "Stock Gun",
        type: "weapon",
        price: 0,
        rank: 0,
        ammo: -1,
        projectile: "bullet",
        image: {
            [Team.Human]: "blueBullet.img",
            [Team.Alien]: "redBullet.img",
            [Team.Cyborg]: "greenBullet.img"
        },
        sound: "shot",
        range: 250,
        damage: 20,
        speed: 50,
        charge: 8,
        bot: true,
        inShop: true
    },
    plasma_gun: {
        name: "Plasma Gun",
        type: "weapon",
        price: 2e3,
        rank: 2,
        ammo: 175,
        projectile: "bullet",
        image: {
            default: "plasmaBullet.img"
        },
        sound: "shot",
        range: 150,
        damage: 45,
        speed: 40,
        charge: 10,
        bot: true,
        inShop: true
    },
    reverse_gun: {
        name: "Reverse Gun",
        type: "weapon",
        price: 1e3,
        rank: 1,
        ammo: -1,
        projectile: "bullet",
        image: {
            [Team.Human]: "blueBullet.img",
            [Team.Alien]: "redBullet.img",
            [Team.Cyborg]: "greenBullet.img"
        },
        sound: "shot",
        range: 250,
        damage: 30,
        speed: 50,
        charge: 8,
        bot: false,
        inShop: true
    },
    rifle: {
        name: "Rifle",
        type: "weapon",
        price: 5e3,
        rank: 5,
        ammo: 50,
        projectile: "bullet",
        image: {
            [Team.Human]: "blueBullet.img",
            [Team.Alien]: "redBullet.img",
            [Team.Cyborg]: "greenBullet.img"
        },
        sound: "shot",
        range: 750,
        damage: 50,
        speed: 80,
        charge: 12,
        bot: true,
        inShop: true
    },
    shotgun: {
        name: "Shotgun",
        type: "weapon",
        price: 5e3,
        rank: 3,
        ammo: 40,
        projectile: "bullet",
        image: {
            [Team.Human]: "blueBullet.img",
            [Team.Alien]: "redBullet.img",
            [Team.Cyborg]: "greenBullet.img"
        },
        sound: "shot",
        range: 100,
        damage: 18,
        speed: 50,
        charge: 15,
        bot: true,
        inShop: true
    },
    machine_gun: {
        name: "Machine Gun",
        type: "weapon",
        price: 6e3,
        rank: 4,
        ammo: 500,
        projectile: "bullet",
        image: {
            [Team.Human]: "blueBullet.img",
            [Team.Alien]: "redBullet.img",
            [Team.Cyborg]: "greenBullet.img"
        },
        sound: "minigun",
        range: 300,
        damage: 20,
        speed: 75,
        charge: 4,
        bot: true,
        inShop: true
    },
    minigun: {
        name: "Minigun",
        type: "weapon",
        price: 3e4,
        rank: 6,
        ammo: 500,
        projectile: "bullet",
        image: {
            [Team.Human]: "blueBullet.img",
            [Team.Alien]: "redBullet.img",
            [Team.Cyborg]: "greenBullet.img"
        },
        sound: "minigun",
        range: 250,
        damage: 14,
        speed: 60,
        charge: 6,
        bot: true,
        inShop: true
    },
    spreadshot: {
        name: "Spreadshot",
        type: "weapon",
        price: 3e4,
        rank: 6,
        ammo: 200,
        projectile: "bullet",
        image: {
            [Team.Human]: "blueBullet.img",
            [Team.Alien]: "redBullet.img",
            [Team.Cyborg]: "greenBullet.img"
        },
        sound: "minigun",
        range: 250,
        damage: 10,
        speed: 60,
        charge: 5,
        bot: true,
        inShop: true
    },
    submachinegun: {
        name: "Submachinegun",
        type: "weapon",
        price: 3e4,
        rank: 6,
        ammo: 1e3,
        projectile: "bullet",
        image: {
            [Team.Human]: "blueBullet.img",
            [Team.Alien]: "redBullet.img",
            [Team.Cyborg]: "greenBullet.img"
        },
        sound: "minigun",
        range: 300,
        damage: 13,
        speed: 70,
        charge: 9,
        bot: true,
        inShop: true
    },

    // Beams
    plasma_beam: {
        name: "Plasma Beam",
        type: "weapon",
        price: 6e3,
        rank: 1,
        ammo: -1,
        projectile: "beam",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 200,
        damage: 5,
        speed: -1,
        charge: 4,
        bot: true,
        inShop: true
    },
    laser_beam: {
        name: "Laser Beam",
        type: "weapon",
        price: 12e3,
        rank: 4,
        ammo: -1,
        projectile: "beam",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 65,
        damage: 22,
        speed: -1,
        charge: 10,
        bot: true,
        inShop: true
    },
    hadron_beam: {
        name: "Hadron Beam",
        type: "weapon",
        price: 3e4,
        rank: 8,
        ammo: -1,
        projectile: "beam",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 135,
        damage: 80,
        speed: -1,
        charge: 50,
        bot: true,
        inShop: true
    },
    mining_laser: {
        name: "Mining Laser",
        type: "weapon",
        price: 5e3,
        rank: 1,
        ammo: -1,
        projectile: "beam",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 120,
        damage: 30,
        speed: -1,
        charge: 5,
        bot: false,
        inShop: true
    },
    ore_cannon: {
        name: "Ore Cannon",
        type: "weapon",
        price: 2e4,
        rank: 2,
        ammo: -1,
        projectile: "beam",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 280,
        damage: 60,
        speed: -1,
        charge: 5,
        bot: false,
        inShop: true
    },
    destabilizer: {
        name: "Destabilizer",
        type: "weapon",
        price: 4e3,
        rank: 6,
        ammo: -1,
        projectile: "beam",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 1e6,
        damage: -1,
        speed: -1,
        charge: 50,
        bot: false,
        inShop: true
    },
    jammer: {
        name: "Jammer",
        type: "weapon",
        price: 11e3,
        rank: 10,
        ammo: -1,
        projectile: "beam",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 75,
        damage: 0,
        speed: -1,
        charge: 30,
        bot: false,
        inShop: true
    },
    healing_beam: {
        name: "Healing Beam",
        type: "weapon",
        price: 5e3,
        rank: 8,
        ammo: -1,
        projectile: "beam",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 35,
        damage: -30,
        speed: 0,
        charge: 20,
        bot: true,
        inShop: true
    },

    // Missiles
    missile: {
        name: "Missile",
        type: "weapon",
        price: 4e3,
        rank: 0,
        ammo: 20,
        projectile: "missile",
        image: {
            default: "missile.img"
        },
        sound: "missile",
        range: 750,
        damage: 15,
        speed: 100,
        charge: 12,
        bot: true,
        inShop: true
    },
    heavy_missile: {
        name: "Heavy Missile",
        type: "weapon",
        price: 1e4,
        rank: 3,
        ammo: 20,
        projectile: "missile",
        image: {
            default: "heavyMissile.img"
        },
        sound: "missile",
        range: 450,
        damage: 40,
        speed: 50,
        charge: 25,
        bot: true,
        inShop: true
    },
    emp_missile: {
        name: "EMP Missile",
        type: "weapon",
        price: 4e4,
        rank: 7,
        ammo: 10,
        projectile: "missile",
        image: {
            default: "empMissile.img"
        },
        sound: "missile",
        range: 600,
        damage: 15,
        speed: 90,
        charge: 25,
        bot: false,
        inShop: true
    },
    missile_swarm: {
        name: "Missile Swarm",
        type: "weapon",
        price: 6e4,
        rank: 9,
        ammo: 20,
        projectile: "missile",
        image: {
            default: "missile.img"
        },
        sound: "missile",
        range: 750,
        damage: -1,
        speed: 45,
        charge: 18,
        bot: true,
        inShop: true
    },
    torpedo: {
        name: "Torpedo",
        type: "weapon",
        price: 18e3,
        rank: 5,
        ammo: 15,
        projectile: "missile",
        image: {
            default: "torpedoMissile.img"
        },
        sound: "missile",
        range: 5e3,
        damage: 15,
        speed: 180,
        charge: 30,
        bot: true,
        inShop: true
    },
    proximity_fuze: {
        name: "Proximity Fuze",
        type: "weapon",
        price: 5e3,
        rank: 5,
        ammo: 20,
        projectile: "missile",
        image: {
            // literally no idea what this is supposed to be
            default: ".img"
        },
        sound: "missile",
        range: 600,
        damage: 80,
        speed: 75,
        charge: 25,
        bot: true,
        inShop: true
    },

    // Mines
    mine: {
        name: "Mine",
        type: "weapon",
        price: 1e3,
        rank: 0,
        ammo: 20,
        projectile: "mine",
        image: {
            default: "mine.img"
        },
        sound: "",
        range: 96,
        damage: 140,
        speed: 0,
        charge: 15,
        bot: false,
        inShop: true
    },
    laser_mine: {
        name: "Laser Mine",
        type: "weapon",
        price: 6e3,
        rank: 3,
        ammo: 10,
        projectile: "mine",
        image: {
            default: "laserMine.img"
        },
        sound: "",
        range: 192,
        damage: 90,
        speed: 0,
        charge: 75,
        bot: false,
        inShop: true
    },
    emp_mine: {
        name: "EMP Mine",
        type: "weapon",
        price: 1e4,
        rank: 6,
        ammo: 5,
        projectile: "mine",
        image: {
            default: "empMine.img"
        },
        sound: "",
        range: 96,
        damage: 72,
        speed: 0,
        charge: 25,
        bot: false,
        inShop: true
    },
    impulse_mine: {
        name: "Impulse Mine",
        type: "weapon",
        price: 6e3,
        rank: 4,
        ammo: 10,
        projectile: "mine",
        image: {
            default: "impulseMine.img"
        },
        sound: "",
        range: 20,
        damage: 0,
        speed: -1,
        charge: 25,
        bot: false,
        inShop: true
    },
    grenades: {
        name: "Grenades",
        type: "weapon",
        price: 8e3,
        rank: 3,
        ammo: 10,
        projectile: "mine",
        image: {
            // not included in spritesheet as of now
            default: ""
        },
        sound: "",
        range: 22,
        damage: 100,
        speed: 25,
        charge: 25,
        bot: false,
        inShop: true
    },
    pulse_mine: {
        name: "Pulse Mine",
        type: "weapon",
        price: 8e3,
        rank: 4,
        ammo: 3,
        projectile: "mine",
        image: {
            default: "pulseMine.img"
        },
        sound: "",
        range: 25,
        damage: 8,
        speed: 0,
        charge: 30,
        bot: false,
        inShop: true
    },
    magnetic_mine: {
        name: "Magnetic Mine",
        type: "weapon",
        price: 1e4,
        rank: 12,
        ammo: 10,
        projectile: "mine",
        image: {
            default: "magneticMine.img"
        },
        sound: "",
        range: 50,
        damage: 100,
        speed: 0,
        charge: 45,
        bot: true,
        inShop: true
    },
    campfire: {
        name: "Campfire",
        type: "weapon",
        price: 5e3,
        rank: 5,
        ammo: 2,
        projectile: "mine",
        image: {
            default: "campfire.img"
        },
        sound: "",
        range: 100,
        damage: -30,
        speed: 0,
        charge: 90,
        bot: false,
        inShop: true
    },

    // Blasts
    emp_blast: {
        name: "EMP Blast",
        type: "weapon",
        price: 5e4,
        rank: 9,
        ammo: 2,
        projectile: "blast",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 100000,
        damage: -1,
        speed: -1,
        charge: 50,
        bot: true,
        inShop: true
    },
    muon_ray: {
        name: "Muon Ray",
        type: "weapon",
        price: 1e6,
        rank: 10,
        ammo: 1,
        projectile: "blast",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 1e4,
        damage: 300,
        speed: -1,
        charge: 100,
        bot: false,
        inShop: true
    },
    hypno_ray: {
        name: "Hypno Ray",
        type: "weapon",
        price: 6e3,
        rank: 5,
        ammo: -2,
        projectile: "blast",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 1e4,
        damage: 0,
        speed: -1,
        charge: 25,
        bot: true,
        inShop: true
    },
    lepton_pulse: {
        name: "Lepton Pulse",
        type: "weapon",
        price: 25e3,
        rank: 8,
        ammo: -1,
        projectile: "blast",
        image: {
            default: ""
        },
        color: 0,
        sound: "beam",
        range: 1e4,
        damage: 20,
        speed: -1,
        charge: 15,
        bot: true,
        inShop: true
    },

    // Orbs
    energy_disk: {
        name: "Energy Disk",
        type: "weapon",
        price: 5e3,
        rank: 0,
        ammo: 15,
        projectile: "orb",
        image: {
            default: "energyDisk.img"
        },
        sound: "",
        range: 150,
        damage: 30,
        speed: 8,
        charge: 25,
        bot: true,
        inShop: true
    },
    photon_orb: {
        name: "Photon Orb",
        type: "weapon",
        price: 1e4,
        rank: 6,
        ammo: -1,
        projectile: "orb",
        image: {
            default: "photonOrb.img"
        },
        sound: "",
        range: 140,
        damage: 18,
        speed: 8,
        charge: 12,
        bot: false,
        inShop: true
    },

    // Misc
    hull_nanobots: {
        name: "Hull Nanobots",
        type: "weapon",
        price: 5e4,
        rank: 8,
        ammo: 4,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: -1,
        damage: -150,
        speed: -1,
        charge: 150,
        bot: true,
        inShop: true
    },
    photon_cloak: {
        name: "Photon Cloak",
        type: "weapon",
        price: 3e4,
        rank: 4,
        ammo: 3,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: -1,
        damage: -1,
        speed: -1,
        charge: 25,
        bot: false,
        inShop: true
    },
    generator: {
        name: "Generator",
        type: "weapon",
        price: 8e4,
        rank: 9,
        ammo: -1,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: -1,
        damage: -1,
        speed: -1,
        charge: 0,
        bot: false,
        inShop: true
    },
    turbo: {
        name: "Turbo",
        type: "weapon",
        price: 15e3,
        rank: 2,
        ammo: -1,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: -1,
        damage: -1,
        speed: 1.02,
        charge: 0,
        bot: false,
        inShop: true
    },
    hyperdrive: {
        name: "Hyperdrive",
        type: "weapon",
        price: 6e3,
        rank: 5,
        ammo: -2,
        projectile: "",
        image: {
            default: ""
        },
        sound: "hyperspace",
        range: -1,
        damage: -1,
        speed: 11111,
        charge: 150,
        bot: false,
        inShop: true
    },
    pulse_wave: {
        name: "Pulse Wave",
        type: "weapon",
        price: 25e3,
        rank: 7,
        ammo: 1,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: 1e4,
        damage: 0,
        speed: 40,
        charge: 75,
        bot: false,
        inShop: true
    },
    electromagnet: {
        name: "Electromagnet",
        type: "weapon",
        price: 4e4,
        rank: 8,
        ammo: -1,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: 512,
        damage: 0.1666,
        speed: -1,
        charge: 0,
        bot: false,
        inShop: true
    },
    turret: {
        name: "Turret",
        type: "weapon",
        price: 75e4,
        rank: 10,
        ammo: -2,
        projectile: "",
        image: {
            // No projectile image for turrets, they just get placed and the image
            // is handled by the turret entity.
            default: ""
        },
        sound: "",
        range: 750,
        damage: 30,
        speed: -1,
        charge: 8,
        bot: false,
        inShop: true
    },
    gravity_bomb: {
        name: "Gravity Bomb",
        type: "weapon",
        price: 1e7,
        rank: 10,
        ammo: -2,
        projectile: "",
        image: {
            // Same as above.
            default: ""
        },
        sound: "",
        range: 3e3,
        damage: 300,
        speed: 10,
        charge: 0,
        bot: false,
        inShop: true
    },
    warp_drive: {
        name: "Warp Drive",
        type: "weapon",
        price: 15e4,
        rank: 7,
        ammo: 2,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: -1,
        damage: -1,
        speed: 716,
        charge: 80,
        bot: false,
        inShop: true
    },
    supercharger: {
        name: "Supercharger",
        type: "weapon",
        price: 1e5,
        rank: 11,
        ammo: -2,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: -1,
        damage: -1,
        speed: -1,
        charge: 0,
        bot: true,
        inShop: true
    },
    navigational_shield: {
        name: "Navigational Shield",
        type: "weapon",
        price: 6e4,
        rank: 13,
        ammo: -1,
        projectile: "",
        image: {
            default: ""
        },
        sound: "",
        range: 0,
        damage: 0,
        speed: 0,
        charge: -1,
        bot: false,
        inShop: true
    }
} satisfies Record<string, WeaponDef>;

export type WeaponDefKey = keyof typeof rawDefs;

export const WeaponDefs = new DefinitionList<WeaponDefKey, WeaponDef>(rawDefs);
