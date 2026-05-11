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

import type { App } from "../App.svelte";
import type { FederatedPointerEvent, FederatedWheelEvent } from "pixi.js";

import { GameConstants } from "@/common/constants";
import { InputPacket } from "@/common/net/InputPacket";
import { math } from "@/common/utils/math";

interface Input {
    type: "key" | "mouse" | "wheel";
    down: boolean;
}

const wheelEvents = [
    "MWheelRight",
    "MWheelLeft",
    "MWheelDown",
    "MWheelUp",
    "MWheelForwards",
    "MWheelBackwards"
] as const;

export class InputManager {
    private _inputs: Record<string, Input> = {};

    prevPacket = new InputPacket();
    ticker = 0;

    sequenceInFlight = false;
    lastSequenceTime = 0;
    inputSequence = 0;

    queuedWeapon = 0;

    constructor(readonly app: App) {}

    init(): void {
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));

        this.app.pixi.stage.on("pointerdown", this.onMouseDown.bind(this));
        this.app.pixi.stage.on("pointerup", this.onMouseUp.bind(this));

        this.app.pixi.stage.on("wheel", this.onWheel.bind(this));
    }

    /**
     * Called when a key is pressed.
     */
    onKeyDown(e: KeyboardEvent): void {
        this._inputs[e.code] = {
            type: "key",
            down: true
        };
    }

    /**
     * Called when a key is released.
     */
    onKeyUp(e: KeyboardEvent): void {
        this._inputs[e.code] = {
            type: "key",
            down: false
        };
    }

    /**
     * Called when a mouse button is pressed.
     */
    onMouseDown(e: FederatedPointerEvent): void {
        this._inputs[`Mouse${e.button}`] = {
            type: "mouse",
            down: true
        };
    }

    /**
     * Called when a mouse button is released.
     */
    onMouseUp(e: FederatedPointerEvent): void {
        this._inputs[`Mouse${e.button}`] = {
            type: "mouse",
            down: false
        };
    }

    /**
     * Mouse wheel events.
     */
    onWheel(e: FederatedWheelEvent): void {
        let key: (typeof wheelEvents)[number] | undefined = undefined;

        if (e.deltaX > 0) key = "MWheelRight";
        else if (e.deltaX < 0) key = "MWheelLeft";
        else if (e.deltaY > 0) key = "MWheelDown";
        else if (e.deltaY < 0) key = "MWheelUp";
        else if (e.deltaZ > 0) key = "MWheelForwards";
        else if (e.deltaZ < 0) key = "MWheelBackwards";

        if (!key) {
            console.error("Unknown wheel event:", e);
            return;
        }

        this._inputs[key] = {
            type: "wheel",
            down: true
        };
    }

    /**
     * Reset wheel inputs at the end of each frame.
     */
    flushInputs(): void {
        for (const e of wheelEvents) {
            if (this._inputs[e]) {
                this._inputs[e].down = false;
            }
        }
    }

    /**
     * Determine if an input is currently active.
     * @param input The input to check.
     */
    isInputDown(input: string): boolean {
        return this._inputs[input]?.down ?? false;
    }

    /**
     * Send inputs as needed & update ping statistics.
     * @param dt Delta time.
     */
    update(dt: number): void {
        this.ticker += dt;

        const packet = new InputPacket();
        const shiftKeyPressed = this.isInputDown("ShiftLeft") || this.isInputDown("ShiftRight");

        packet.moveFwd = this.isInputDown("KeyW");
        packet.moveBwd = shiftKeyPressed && this.isInputDown("KeyS");
        packet.turnLeft = this.isInputDown("KeyA");
        packet.turnRight = this.isInputDown("KeyD");
        packet.jukeLeft = this.isInputDown("KeyQ");
        packet.jukeRight = this.isInputDown("KeyE");
        packet.drift = shiftKeyPressed && !packet.moveBwd;

        packet.attack = this.isInputDown("Space") || this.isInputDown("Mouse0");
        packet.shield = this.isInputDown("KeyS");
        packet.cslot = this.isInputDown("KeyC") || this.isInputDown("KeyV");

        packet.queuedWeapon = this.queuedWeapon;

        if (this.app.player) {
            for (let i = 0; i < GameConstants.player.weaponSlots; i++) {
                const key = i === 9 ? 0 : i + 1;
                if (this.isInputDown(`Digit${key}`) && key !== this.app.player.activeWeapon) {
                    packet.queuedWeapon = key;
                    break;
                }
            }

            if (this.isInputDown("MWheelDown")) {
                packet.queuedWeapon = math.min(this.app.player.activeWeapon + 1, GameConstants.player.weaponSlots - 1);
            } else if (this.isInputDown("MWheelUp")) {
                packet.queuedWeapon = math.max(this.app.player.activeWeapon - 1, 0);
            }
        }

        if (packet.compare(this.prevPacket) || this.ticker > 1) {
            if (!this.sequenceInFlight) {
                this.sequenceInFlight = true;
                this.inputSequence = (this.inputSequence + 1) % 256;
                this.lastSequenceTime = performance.now();
            }

            packet.inputSequence = this.inputSequence;

            this.ticker = 0;
            this.app.sendPacket(packet);
        }

        this.prevPacket = packet;
        this.queuedWeapon = -1;
    }
}
