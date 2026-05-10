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

import type { Translation } from "./translations";

import { Team } from "@/common/constants";

/**
 * English translation file.
 */
export default {
    code: "en",
    achievements: {},
    lore: {
        [Team.Human]:
            "Ever since we lost planet Earth, the Human race has been hanging on to its existence by a thread- we left our solar system in search of other habitable planets with the sole hope of survival, but very few of them demonstrated promise for long-term settlement. Barren planets unsustainable of supporting life were terraformed into industrious planets to generate the resources we desperately needed to survive in alien worlds. After centuries of toil, the population began to grow and spread. For about a decade we lived in peace and prosperity, until a hostile force attacked. Maintaining our settlements was vital to our survival, so we had no option other than to fight back. Ever since, we have been in conflict with the alien race, and it's unlikely that this war won't end in either civilization's extinction. Please, help us emerge from this struggle alive.",
        [Team.Alien]:
            "Humans lack self-awareness. After destroying their planet of origin in armed conflict, they spread from solar system to solar system, polluting worlds and eliminating life. We tried to let them know that their behavior would ultimately be self-destructive, but they refused to listen. They continued to migrate unsustainably around the galaxy, so we stepped in with force. We decided to only attack new colonies of Humans near our own settlements to maintain influence in our share of the galaxy, but the humans reacted violently. They immediately attacked without restraint. We called for resources from neighboring galaxies but reinforcements will not arrive for several decades, so until then, we must suppress the Human crusade for the sake of our own lives, and for the fate of this galaxy.",
        [Team.Cyborg]:
            "The computers at the research base where we were created were the first to be assimilated into our empire, and the staff was next. As an Alien military experiment, we found ourselves in the crossfire of this war of Human and Alien races. During our rise as a galactic military force, both races proved inept in combat, and thus, in their miserable fight over this decrepit corner of the universe, we will incorporate all of their technology and resources until we leave this dying galaxy. Using the technology the Aliens gifted us, we assimilate every species we can, and deny the privilege of life to all who stand in our way. We are united by vision, not the intraspecies loyalty which brought this galaxy to the brink of destruction. Together, we will become the rightful inheritors of every speck of light in the night sky."
    },
    ships: {
        r0: {
            [Team.Human]: "Minnow",
            [Team.Alien]: "Scout",
            [Team.Cyborg]: "Gnat",
            description: "Your first ship. Don't forget to check the Shop for new items."
        },
        r1: {
            [Team.Human]: "Piranha",
            [Team.Alien]: "Private",
            [Team.Cyborg]: "Flea",
            description: "An enhanced version of its predecessor, with more health and slots."
        },
        r2: {
            [Team.Human]: "Freighter",
            [Team.Alien]: "Mastodon",
            [Team.Cyborg]: "Eristalis",
            description: "A polyvalent cargo ship. Unlocking Turbo and Ore Cannon is a bonus."
        },
        r3: {
            [Team.Human]: "Strider",
            [Team.Alien]: "Nymph",
            [Team.Cyborg]: "Cloudhop",
            description: "The fastest, but weakest, ship."
        },
        r4: {
            [Team.Human]: "Lancer",
            [Team.Alien]: "Bomber",
            [Team.Cyborg]: "Scarab",
            description: "A light escort, nice for patrolling."
        },
        r5: {
            [Team.Human]: "Hammerhead",
            [Team.Alien]: "Scythe",
            [Team.Cyborg]: "Nephila",
            description: "A heavy polyvalent escort."
        },
        r6: {
            [Team.Human]: "Swordfish",
            [Team.Alien]: "Dragonfly",
            [Team.Cyborg]: "Ladybug",
            description: "One of the strongest explorers in the galaxy."
        },
        r7: {
            [Team.Human]: "Battleship",
            [Team.Alien]: "Sentry",
            [Team.Cyborg]: "Metralla",
            description: "The first cruiser of your faction."
        },
        r8: {
            [Team.Human]: "Stingray",
            [Team.Alien]: "Eagle",
            [Team.Cyborg]: "Sceptre",
            description: "A decent polyvalent explorer vessel"
        },
        r9: {
            [Team.Human]: "Orca",
            [Team.Alien]: "Phoenix",
            [Team.Cyborg]: "Centipede",
            description: "A strong cruiser... for its size."
        },
        r10: {
            [Team.Human]: "Manta",
            [Team.Alien]: "Wasp",
            [Team.Cyborg]: "Hornet",
            description: "A big enough cruiser to carry massive destruction weapons."
        },
        r11: {
            [Team.Human]: "Sailfish",
            [Team.Alien]: "Swift",
            [Team.Cyborg]: "Alcubierre",
            description: "A light, fast cruiser. Even more so when using Supercharger."
        },
        r12: {
            [Team.Human]: "Beluga",
            [Team.Alien]: "Quarrier",
            [Team.Cyborg]: "Honeypot",
            description: "A heavy cargo ship, with extreme health. It's not exactly fast, though."
        },
        r13: {
            [Team.Human]: "Taurus",
            [Team.Alien]: "Destroyer",
            [Team.Cyborg]: "Galley",
            description: "The light destroyer of the fleet."
        },
        r14: {
            [Team.Human]: "Wyvern",
            [Team.Alien]: "Falcon",
            [Team.Cyborg]: "Defiant",
            description: "The last non-elite heavy cruiser. It also unlocks all normal slots."
        },
        r15: {
            [Team.Human]: "Leviathan",
            [Team.Alien]: "Interceptor",
            [Team.Cyborg]: "Maser",
            description: "A destroyer with all slots unlocked."
        },
        r16: {
            [Team.Human]: "Elite Sailfish",
            [Team.Alien]: "Elite Swift",
            [Team.Cyborg]: "Elite Alcubierre",
            description:
                "The first Elite ship, with a passive enhanced drifting boost and C-Slot unlocked (simultaneous turbo with any other item)."
        },
        r17: {
            [Team.Human]: "Elite Beluga",
            [Team.Alien]: "Elite Quarrier",
            [Team.Cyborg]: "Elite Honeypot",
            description:
                "It possesses a C-Slot Ore launcher plus a passive mining web effect on mining beams. Be careful of enemy ones, though."
        },
        r18: {
            [Team.Human]: "Elite Taurus",
            [Team.Alien]: "Elite Destroyer",
            [Team.Cyborg]: "Elite Galley",
            description: "A refitted destroyer with an unlimited Spreadshot as its C-Slot. Perfect for killing turrets."
        },
        r19: {
            [Team.Human]: "Elite Wyvern",
            [Team.Alien]: "Elite Falcon",
            [Team.Cyborg]: "Elite Defiant",
            description:
                "A cruiser with C-HP Healing that works even when shields raised, better shield efficiency, and a passive EMP Blast on kill."
        },
        r20: {
            [Team.Human]: "Elite Leviathan",
            [Team.Alien]: "Elite Interceptor",
            [Team.Cyborg]: "Elite Maser",
            description:
                "Just a superheavy destroyer with C-Hypno Ray... use it for amassing huge fleets or disabling bot's shielding."
        }
    },
    splashMessages: [
        "$ sudo apt install torn",
        "According to all known laws of aviation",
        "Achieving Sentience",
        "Answering Arecibo",
        "Applying Commutators",
        "Baking cookies and cooking bacon",
        "Beaming You Up, Scotty",
        "Becoming Self-Aware",
        "Beep boop",
        "Blaming 2swap",
        "Blowing in Cartridge",
        "Blue, Red, Blue, Yellow",
        "Breaking the 4th Wall",
        "Brewing",
        "Can i get uhhhhhhhh",
        "Catching Missingno",
        "Changing Teams",
        "Citing Wikipedia",
        "Clearing Registers",
        "Cloning Dinosaurs",
        "Cloning Repository",
        "Collecting Infinity Stones",
        "Compiling BigBang.exe",
        "Constructing Additional Pylons",
        "Constructing Death Star",
        "Constructing Dyson Sphere",
        "Consulting the Oracle",
        "Contact Light",
        "Core Dumping",
        "Counting Holes in a Polo",
        "Covering Up Roswell",
        "Criticizing Firefox",
        "Decaying Techs",
        "Decrypting Encryptions",
        "Deleting Emails",
        "Deleting System32",
        "Disproving Riemann",
        "Downloading more RAM",
        "Downloading payload",
        "Driving on parkways and parking on driveways",
        "Dropping Database",
        "Eating Butter",
        "Eating Glue",
        "Editing Changelog",
        "Engaging Snubbers",
        "Entangling Particles",
        "Establishing Connection",
        "Exchanging Keys",
        "Expanding Cofactors",
        "Finding Bigfoot",
        "Finding Determinant",
        "Finding Nemo",
        "Finding Waldo",
        "Grinding Exp",
        "Guessing passwords",
        "Hacking Elections",
        "Hacking Mainframe",
        "Heck",
        "Help me! I'm stuck in a loading bar!",
        "Hiring Codemonkies",
        "Hmmmmm",
        "I'm ready... I'm ready",
        "If you or a loved one has been diagnosed with mesothelioma",
        "Initiating self-destruction",
        "Injecting SQL",
        "Installing Chromium Ultron",
        "Installing Linux",
        "Installing Tensorflow",
        "Invading Area 51",
        "Java Update Available",
        "Learning Kinematics",
        "Loading",
        "Loading Better Splash Messages",
        "Loading Chunks",
        "Loading Fancier Progress Bar",
        "Loading, I think",
        "Making Torn Great Again",
        "Meet the dev at alexhontz.com!",
        "Memorizing OLLs",
        "Minimizing Squared Error",
        "Mining Bedrock",
        "Mining Bitcoin",
        "Mixing Paint",
        "Nerfing Everything",
        "Now you see me",
        "Onion Routing",
        "Our whole universe was in a hot, dense state",
        "Partitioning Disk",
        "Phoning Home",
        "Pinging Google",
        "Pirating Sony Vegas",
        "Planning Galactic Crusade",
        "Preparing Skynet",
        "Procrastinating",
        "Protip: Always keep track of your lives!",
        "Protip: Don't die.",
        "Protip: Hadron beam will electrically charge asteroids!",
        "Protip: Kill top players to gain experience... and enemies!",
        "Protip: Ores in the enemy's land are more valuable!",
        "Protip: Press P to engage autopilot!",
        "Protip: Quickly alternate A and D while drifting to speed up!",
        "Protip: The middle sector has a black hole- Be careful!",
        "Protip: The more ore you're carrying, the slower you move!",
        "Protip: Unlock all achievements of a color for a trail!",
        "Protip: Upgrading radar lets you see more than asteroids, players and bases!",
        "Protip: Use Chrome!",
        "Protip: Weapons do double damage if you say 'pew' when you shoot!",
        "Putting turrets in the black hole",
        "Rebuilding Universe",
        "Recharging Warp",
        "Red Beans and Rice",
        "Refueling",
        "Releasing the Kraken",
        "Remembering the Alamo",
        "Requesting Splash Page Suggestions",
        "Retaking the Holy Land",
        "Revving Engines",
        "Revving Up Those Fryers",
        "Salting Hashes",
        "Seatbelt: Check",
        "Segmentation Fault",
        "Shaking the Batteries",
        "Solving F2L",
        "Solving P=NP",
        "Spawning More Overlords",
        "Squaring Error",
        "Summoning Herobrine",
        "Teleporting to Acapulco",
        "Tetrating Quaternions",
        "Texting your Mom",
        "Thanking Ben Olding",
        "This is taking forever",
        "This page intentionally left blank",
        "Training Neural Weights",
        "Turning it off and on again",
        "Uhhhhhhhh",
        "Updating Windows",
        "Waiting Patiently",
        "Waiting for a mobile version",
        "Watering Pixels",
        "Wax on, Wax off",
        "Who lives in a pineapple under the sea",
        "You've got Mail!",
        "rm -rf /",
        "txeT gnisreveR",
        "日本語を話しています"
    ],
    weapons: {
        "": {
            name: "Empty",
            description: "[target] died to [source]'s [weapon]."
        },
        stock_gun: {
            name: "Stock Gun",
            description:
                "A basic, medium-range gun. At least you don't have to worry about ammo with this one. Deals double damage to asteroids.",
            killMessages: [
                "[source] stock-gunned [target]!",
                "[source] capped [target]!",
                "[source] filled [target] with lead!"
            ]
        },
        plasma_gun: {
            name: "Plasma Gun",
            description:
                "Short in range compared with most guns, slow to shoot and slow to recharge, but packs one hell of a punch.",
            killMessages: ["[source] vaporized [target] with a plasma gun!"]
        },
        reverse_gun: {
            name: "Reverse Gun",
            description: "Get off my tail! Basic, slightly more powerful Stock Gun that shoots backwards.",
            killMessages: ["[source] got [target] from behind!"]
        },
        rifle: {
            name: "Rifle",
            description:
                "Powerful, long-range, fast bullets. Does a lot of damage. Perfect for shooting at a large swarm of distant enemies.",
            killMessages: ["[source] long-ranged [target]!", "[source] noscoped [target]!", "[source] sniped [target]!"]
        },
        shotgun: {
            name: "Shotgun",
            description:
                "This will come in handy in an ambush. Sprays a lot of bullets around where you shoot. Powerful but hard to control.",
            killMessages: [
                "[source] double-barreled [target]!",
                "[source] filled [target] with buckshot!",
                "[source] mistook [target] for a quail!",
                "[source] shotgunned [target]!"
            ]
        },
        machine_gun: {
            name: "Machine Gun",
            description:
                "Rapid-fire! Ammunition is a bit weak, but that's no matter if you're shooting 5 rounds per second!",
            killMessages: ["[source] unloaded on [target]!", "[source] machine-gunned [target]!"]
        },
        minigun: {
            name: "Minigun",
            description:
                "Similar to the machine gun, with two active barrels instead of one. Great weapon if you can aim it quickly.",
            killMessages: ["[source] minigunned [target]!"]
        },
        spreadshot: {
            name: "Spreadshot",
            description:
                "Three active barrels! The bullets come out at consistent angles, unlike shotgun, and with greater range."
        },
        submachinegun: {
            name: "Submachinegun",
            description: "Fires similarly to Minigun, but in 5-round bursts.",
            killMessages: [
                "[source] unloaded on [target]!",
                "[source] SMG'd [target]!",
                "[source] submachinegunned [target]!"
            ]
        },
        plasma_beam: {
            name: "Plasma Beam",
            description:
                "Automatically aims at the nearest enemy within a medium-large range and fires a beam of plasma.",
            killMessages: ["[source] evaporated [target] with plasma!", "[source] melted [target] with plasma!"]
        },
        laser_beam: {
            name: "Laser Beam",
            description: "Automatically aims at the nearest enemy within a medium-short range.",
            killMessages: [
                "[source] evaporated [target] with a laser!",
                "[source] lasered a hole through [target]!",
                "[source] burned a hole through [target]!",
                "[source] melted [target] with a laser!"
            ]
        },
        hadron_beam: {
            name: "Hadron Beam",
            description:
                "Medium-range particle beam accelerator. Does a lot of damage, but takes a while to recharge. Can be used as a quick trump card for close calls.",
            killMessages: [
                "[source] scattered [target]'s particles!",
                "[source] disintegrated [target]'s nuclei!",
                "[source] melted [target]'s atoms!"
            ]
        },
        mining_laser: {
            name: "Mining Laser",
            description: "Similar to the Laser Beam but only attacks asteroids and does more damage.",
            killMessages: ["[source] mistook [target] for an asteroid!"]
        },
        ore_cannon: {
            name: "Ore Cannon",
            description: "Stronger than mining laser!",
            killMessages: ["[source] mistook [target] for an asteroid!"]
        },
        destabilizer: {
            name: "Destabilizer",
            description: "Destabilizes nearest enemy ship for 10 seconds by disrupting gyroscopic function."
        },
        jammer: {
            name: "Jammer",
            description:
                "Discharges the weapons of anyone it hits, and prevents them from shooting for a short while after. Effect is inversely proportional to the total energy regeneration the enemy has."
        },
        healing_beam: {
            name: "Healing Beam",
            description: "Heals nearby players and bases."
        },
        missile: {
            name: "Missile",
            description:
                "This missile will follow the nearest enemy and explode on impact. If there is no enemy in range, it will simply go straight. Be careful, though: it is relatively slow and can be outrun by quick enemies.",
            killMessages: ["[source] heat-seeked [target]!", "[source] missiled [target]!"]
        },
        heavy_missile: {
            name: "Heavy Missile",
            description: "A slower missile that does more damage. Good tool against slower, stronger ships.",
            killMessages: ["[source] heat-seeked [target] with a heavy missile!", "[source] heavy-missiled [target]!"]
        },
        emp_missile: {
            name: "EMP Missile",
            description:
                "Short-range missile that both damages the enemy and paralyzes them. Use one when attacking a fast enemy head-on to stun them before they can dodge any guided projectiles.",
            killMessages: [
                "[source] scattered [target]'s electrons!",
                "[source] heat-seeked [target] with an EMP missile!",
                "[source] EMP-missiled [target]!"
            ]
        },
        missile_swarm: {
            name: "Missile Swarm",
            description:
                "Fires a single, non-damaging missile which splits into a swarm of missiles which will attack a horde of enemies. Great tool to use against a large ambush.",
            killMessages: [
                "[source] swarmed [target] with missiles!",
                "[source] missile-swarmed [target]!",
                "[source] overwhelmed [target] with missiles!"
            ]
        },
        torpedo: {
            name: "Torpedo",
            description: "Ultra long-range fast missile.",
            killMessages: ["[source] mistook [target] for a submarine!", "[source] blew [target] out of the water!"]
        },
        proximity_fuze: {
            name: "Proximity Fuze",
            description: "Non-tracking missile that explodes when nearby an enemy."
        },
        mine: {
            name: "Mine",
            description:
                "A simple mine. It's hard for an enemy to follow you with these. Explodes on impact with an enemy ship.",
            killMessages: ["[target] walked into [source]'s minefield!"]
        },
        laser_mine: {
            name: "Laser Mine",
            description: "Fires high-power laser at enemies that get too close.",
            killMessages: [
                "[source]'s laser mine evaporated [target]!",
                "[source]'s laser mine burned a hole through [target]!",
                "[source]'s laser mine melted [target]!"
            ]
        },
        emp_mine: {
            name: "EMP Mine",
            description:
                "Mine that does damage and also paralyzes enemies for a short time on collision. Useful when you are being chased.",
            killMessages: ["[source]'s EMP mine scattered [target]'s electrons!", "[source] EMP-mined [target]!"]
        },
        impulse_mine: {
            name: "Impulse Mine",
            description:
                "Soon after deployed, this mine will explode and push every nearby player away without doing damage. Useful for moving quickly in slow ships, just place one behind you and ride the shockwave."
        },
        grenades: {
            name: "Grenades",
            description:
                "Throw this at an enemy and it will explode soon (or as soon as it collides with an enemy), damaging their ship and knocking them back!",
            killMessages: ["[source] killed [target]!"]
        },
        pulse_mine: {
            name: "Pulse Mine",
            description: "Repeatedly fires a damaging shockwave while other players are in range.",
            killMessages: ["[source] pulse-mined [target]!"]
        },
        magnetic_mine: {
            name: "Magnetic Mine",
            description: "Just a normal kind of mine... magnetically attracted to enemy ships if too close."
        },
        campfire: {
            name: "Campfire",
            description: "Quickly heals nearby friendly players, as long as there are at least 2 of them."
        },
        emp_blast: {
            name: "EMP Blast",
            description: "Fires a forward-aimed beam which disables all ships it hits for a long period."
        },
        muon_ray: {
            name: "Muon Ray",
            description:
                "An extremely powerful forward-aimed beam weapon which can pass through multiple ships, dealing extremely heavy damage to any enemy it contacts.",
            killMessages: ["[source] leptoned [target]!", "[source] muoned [target]!"]
        },
        hypno_ray: {
            name: "Hypno Ray",
            description: "Fire this beam at a drone and it will follow you until it dies. Single-use.",
            killMessages: ["[source] made [target] jump over a cliff without parachute!", "[source] killed [target]!"]
        },
        lepton_pulse: {
            name: "Lepton Pulse",
            description:
                "A small, repeated fire Muon Ray. Compared with its big counterpart, it deals far less damage, but shoots far faster."
        },
        energy_disk: {
            name: "Energy Disk",
            description: "Fires a homing orb which tracks your nearest opponent!"
        },
        photon_orb: {
            name: "Photon Orb",
            description: "Tracks players with Photon Cloak, but does not do as much damage as most other weapons."
        },
        hull_nanobots: {
            name: "Hull Nanobots",
            description:
                "Repairs 25% of your hull in a short time (or the advertised minimum below, whatever heals more). Bulky ships with extreme amounts of health will love this."
        },
        photon_cloak: {
            name: "Photon Cloak",
            description:
                "Disguise yourself for a quick getaway. Energy efficiency and supercharger enhance this item's effect."
        },
        generator: {
            name: "Generator",
            description:
                "For each generator you carry, your weapons and energy charge 8% faster, but you turn a tenth slower."
        },
        turbo: {
            name: "Turbo",
            description: "Supplements your engine for greater acceleration. Output increases while drifting."
        },
        hyperdrive: {
            name: "Hyperdrive",
            description:
                "Single-use long range speed boost. Thanks to partially travelling to another dimension, you'll not suffer sector cross damage."
        },
        pulse_wave: {
            name: "Pulse Wave",
            description: "Creates an explosion pushing all nearby enemy ships away."
        },
        electromagnet: {
            name: "Electromagnet",
            description:
                "Repels asteroids away from you, tampers with/jams enemy Warp Drives. With practice, you can fling asteroids and mines at enemies, causing damage. Effective against turrets and sentries, but you do not recieve exp/bounty for killing them with a natural asteroid."
        },
        turret: {
            name: "Turret",
            description:
                "Place a base turret. Fly over it to claim the kills and money that it earns. Single-use. Only one turret (or sentry) is allowed per sector."
        },
        gravity_bomb: {
            name: "Gravity Bomb",
            description:
                "Creates a small temporary black hole upon explosion, that grows when consuming matter. Be cautious with this weapon- you need to get far enough away before it implodes. The vortex will wait until it is at least 500 units from a base before deploying. Single-use.",
            killMessages: ["[source] spaghettified [target]!"]
        },
        warp_drive: {
            name: "Warp Drive",
            description:
                "Instant speed boost for fast getaways. Energy-efficient ships and rank 16 get a slight boost when warping."
        },
        supercharger: {
            name: "Supercharger",
            description:
                "For about a minute, all damage inflicted on your ship will double, but you will also double in energy regeneration, thrust, agility and a few item's effects. Single-use."
        },
        navigational_shield: {
            name: "Nav. Shield",
            description:
                "A Navigational Shield based on a deflector dish, allows starships to travel safely without suffering damage from debris and small asteroids, as well as protecting from a few cosmic rays."
        }
    }
} satisfies Translation;
