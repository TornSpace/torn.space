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

import { app } from "./app";
import AuthRouter from "./routes/Auth";
import GameRouter from "./routes/Game";
import ModerationRouter from "./routes/Moderation";

app.route("/auth", AuthRouter);
app.route("/game", GameRouter);
app.route("/moderation", ModerationRouter);

Bun.serve({
    fetch: app.fetch
});
