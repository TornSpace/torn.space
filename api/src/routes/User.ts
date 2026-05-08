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

import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod";

import { app } from "../app";
import { RawPlayerTeam, RawPlayerTrail } from "../constants";
import { User } from "../models/User";
import { AuthGuard, DatabaseGuard, RateLimiter, Validator } from "../utils/middleware";

import { GameConstants, Team, Trail } from "@/common/constants";
import { util } from "@/common/utils/util";

const registerSchema = z.object({
    username: z.string().nonempty().min(3).max(GameConstants.player.maxNameLength),
    email: z.email().min(6).max(64),
    token: z.string().nonempty().min(1).max(64),
    team: z.enum(Team),
    sector: z.object({
        x: z
            .number()
            .min(0)
            .max(GameConstants.mapSize - 1),
        y: z
            .number()
            .min(0)
            .max(GameConstants.mapSize - 1)
    })
});

const loginSchema = z.object({
    username: z.string().nonempty().min(3).max(GameConstants.player.maxNameLength),
    token: z.string().nonempty().min(1).max(64)
});

// TODO: Perf optimization to make most of these fields optional, updated as needed.
const updateSchema = z.object({
    id: z.number().min(0),
    xp: z.number().min(0),
    rank: z.number().min(0),
    team: z.enum(Team),
    balance: z.number().min(0),
    lives: z.number().min(0),
    guild: z.number().min(0).optional(),

    ship: z.number(),
    trail: z.enum(Trail),
    sector: z.object({
        x: z
            .number()
            .min(0)
            .max(GameConstants.mapSize - 1),
        y: z
            .number()
            .min(0)
            .max(GameConstants.mapSize - 1)
    }),
    weapons: z.string().array(),

    speed: z.number().min(0),
    radar: z.number().min(0),
    cargo: z.number().min(0),
    hp: z.number().min(0),
    energy: z.number().min(0),
    agility: z.number().min(0),

    iron: z.number().min(0),
    silver: z.number().min(0),
    copper: z.number().min(0),
    platinum: z.number().min(0),

    kills: z.number().min(0),
    baseKills: z.number().min(0),
    driftTime: z.number().min(0),

    achievements: z.number().array(),
    planets: z.number().array(),
    sectors: z.number().array()
});

const Router = new Hono()
    .use(RateLimiter(5, 3e4))
    .use(async (c, next) => AuthGuard(c, next))
    .use(async (c, next) => DatabaseGuard(c, next, app));

Router.post("/register", Validator("json", registerSchema), async c => {
    const body = c.req.valid("json");

    app.db
        .select({ id: User.id })
        .from(User)
        .where(or(eq(User.email, body.email), eq(User.username, body.username)));

    const rawTeam: RawPlayerTeam | undefined = RawPlayerTeam[body.team as unknown as keyof typeof RawPlayerTeam];
    if (rawTeam === undefined) {
        app.logger.error("API", `Tried to register user of invalid team: "${body.team}"`);
        return c.status(500);
    }

    const hash = await Bun.password.hash(body.token, "argon2id");
    const users = await app.db
        .insert(User)
        .values({
            username: body.username,
            email: body.email,
            token: hash,
            team: rawTeam,
            sector: body.sector
        } satisfies typeof User.$inferInsert)
        .returning()
        .catch(function (err) {
            app.logger.error("API", "Failed to create user:", err);
            return c.status(500);
        });

    if (!users) {
        app.logger.error("API", "Failed to create user, but no initial error thrown. What happened?");
        return c.status(500);
    }

    const user = users[0];
    app.logger.debug(
        "API",
        `Created new user "${body.username}" on team "${rawTeam}" at sector "${util.sectorToString(body.sector)}".`
    );

    return c.json({ id: user.id });
});

Router.post("/login", Validator("json", loginSchema), async c => {
    const body = c.req.valid("json");

    const users = await app.db
        .select({ id: User.id, token: User.token, rawTeam: User.team })
        .from(User)
        .where(eq(User.username, body.username));
    if (!users) return c.status(400);

    const checkUser = users[0];
    const hashMatches = await Bun.password.verify(body.token, checkUser.token, "argon2id");

    if (hashMatches) {
        const users = await app.db
            .select({
                // role: User.role,
                xp: User.xp,
                rank: User.rank,
                balance: User.balance,
                lives: User.lives,
                guild: User.guild,

                ship: User.ship,
                trail: User.trail,
                sector: User.sector,
                weapons: User.weapons,

                speed: User.speed,
                radar: User.speed,
                cargo: User.cargo,
                hp: User.hp,
                energy: User.energy,
                agility: User.agility,

                iron: User.iron,
                silver: User.silver,
                copper: User.copper,
                platinum: User.platinum,

                kills: User.kills,
                baseKills: User.baseKills,
                driftTime: User.driftTime,

                achievements: User.achievements,
                planets: User.planets,
                sectors: User.sectors
            })
            .from(User)
            .where(eq(User.id, checkUser.id));

        if (!users) {
            app.logger.error("API", "Failed to find user that just authenticated. What happened?");
            return c.status(500);
        }

        const fullUser = users[0];

        // TODO: This is ugly and should be refactored.
        let team: Team;
        switch (checkUser.rawTeam) {
            case RawPlayerTeam.Human:
                team = Team.Human;
                break;
            case RawPlayerTeam.Alien:
                team = Team.Alien;
                break;
            case RawPlayerTeam.Cyborg:
                team = Team.Cyborg;
                break;
        }

        return c.json({
            ...fullUser,
            team
        });
    }
});

Router.post("/update", Validator("json", updateSchema), async c => {
    const body = c.req.valid("json");

    const rawTeam: RawPlayerTeam | undefined = RawPlayerTeam[body.team as unknown as keyof typeof RawPlayerTeam];
    if (rawTeam === undefined) {
        app.logger.error("API", `Tried to update user with invalid team: "${body.team}"`);
        return c.status(500);
    }

    const rawTrail: RawPlayerTrail | undefined = RawPlayerTrail[body.trail as unknown as keyof typeof RawPlayerTrail];
    if (rawTeam === undefined) {
        app.logger.error("API", `Tried to register user with invalid trail: "${body.trail}"`);
        return c.status(500);
    }

    // Update user data.
    await app.db
        .update(User)
        .set({
            ...body,
            team: rawTeam,
            trail: rawTrail
        })
        .where(eq(User.id, body.id));

    app.logger.debug(
        "API",
        `Updated user data for player "${body.id}" on team "${rawTeam}" at sector "${util.sectorToString(body.sector)}".`
    );

    return c.status(200);
});

export default Router;
