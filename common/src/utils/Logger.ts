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

import { styleText } from "node:util";

import type { Config } from "../../../config.d";

/**
 * Custom logger. Cannot be used on the client.
 */
export class Logger {
    constructor(protected readonly config: Config["logging"]) {}

    clear(): void {
        console.clear();
    }

    protected log(fn = console.log, levelText: string, topic: string, ...args: any[]): void {
        let message = "";

        if (this.config.timestamp) {
            const time = new Date();

            const second = time.getSeconds().toString().padStart(2, "0");
            const minute = time.getMinutes().toString().padStart(2, "0");
            const hour = time.getHours().toString();

            const day = time.getDate().toString();
            const month = (time.getMonth() + 1).toString();
            const year = time.getFullYear().toString();

            message += styleText(
                "dim",
                `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year.padStart(2, "0")} ${hour.padStart(2, "0")}:${minute}:${second}`
            );
            message += styleText("dim", " | ");
        }

        message += levelText;
        message += styleText("dim", " | ");
        message += styleText("bold", topic);
        message += styleText("dim", " |");
        message += styleText("reset", "");

        fn(message, ...args);
    }

    info(topic: string, ...args: any[]): void {
        if (!this.config.info) return;
        this.log(console.info, styleText(["bold", "cyan"], "INFO"), topic, ...args);
    }

    warn(topic: string, ...args: any[]): void {
        if (!this.config.warn) return;
        this.log(console.warn, styleText(["bold", "yellow"], "WARN"), topic, ...args);
    }

    error(topic: string, ...args: any[]): void {
        if (!this.config.error) return;
        this.log(console.error, styleText(["bold", "red"], "ERROR"), topic, ...args);
    }

    debug(topic: string, ...args: any[]): void {
        if (!this.config.debug) return;
        this.log(console.debug, styleText(["bold", "white"], "DEBUG"), topic, ...args);
    }

    /**
     * Log a splash message.
     * @param topic The message topic.
     */
    splash(topic: string): void {
        // oxfmt-ignore
        this.info(topic, `************************************************************************************************************************`);
        // oxfmt-ignore
        this.info(topic, ` ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄        ▄     ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄ `);
        // oxfmt-ignore
        this.info(topic, `▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░▌      ▐░▌   ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌`);
        // oxfmt-ignore
        this.info(topic, ` ▀▀▀▀█░█▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀█░▌▐░▌░▌     ▐░▌   ▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀ `);
        // oxfmt-ignore
        this.info(topic, `     ▐░▌     ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌▐░▌    ▐░▌   ▐░▌          ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌          ▐░▌          `);
        // oxfmt-ignore
        this.info(topic, `     ▐░▌     ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄█░▌▐░▌ ▐░▌   ▐░▌   ▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄█░▌▐░▌          ▐░█▄▄▄▄▄▄▄▄▄ `);
        // oxfmt-ignore
        this.info(topic, `     ▐░▌     ▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░▌  ▐░▌  ▐░▌   ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌          ▐░░░░░░░░░░░▌`);
        // oxfmt-ignore
        this.info(topic, `     ▐░▌     ▐░▌       ▐░▌▐░█▀▀▀▀█░█▀▀ ▐░▌   ▐░▌ ▐░▌    ▀▀▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░▌          ▐░█▀▀▀▀▀▀▀▀▀ `);
        // oxfmt-ignore
        this.info(topic, `     ▐░▌     ▐░▌       ▐░▌▐░▌     ▐░▌  ▐░▌    ▐░▌▐░▌             ▐░▌▐░▌          ▐░▌       ▐░▌▐░▌          ▐░▌          `);
        // oxfmt-ignore
        this.info(topic, `     ▐░▌     ▐░█▄▄▄▄▄▄▄█░▌▐░▌      ▐░▌ ▐░▌     ▐░▐░▌ ▄  ▄▄▄▄▄▄▄▄▄█░▌▐░▌          ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄▄▄ `);
        // oxfmt-ignore
        this.info(topic, `     ▐░▌     ▐░░░░░░░░░░░▌▐░▌       ▐░▌▐░▌      ▐░░▌▐░▌▐░░░░░░░░░░░▌▐░▌          ▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌`);
        // oxfmt-ignore
        this.info(topic, `      ▀       ▀▀▀▀▀▀▀▀▀▀▀  ▀         ▀  ▀        ▀▀  ▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀            ▀         ▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀ `);
        // oxfmt-ignore
        this.info(topic, `                                                                                                                        `);
        // oxfmt-ignore
        this.info(topic, `*************************************************************************************************************************`);
        // oxfmt-ignore
        this.info(topic, "This program is free software: you can redistribute it and / or modify it under the terms of the GNU Affero General");
        // oxfmt-ignore
        this.info(topic, "Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any");
        // oxfmt-ignore
        this.info(topic, "later version. You should have received a copy of the GNU Affero General Public License along with this program. If not,");
        this.info(topic, "see <https://www.gnu.org/licenses/>.");
        this.info(topic, "");
        this.info(topic, "");
        this.info(topic, "Source code is available at <https://github.com/TornSpace/torn.space>.");
        this.info(
            topic,
            `*************************************************************************************************************************`
        );
    }
}
