<script lang="ts">
    import type { App } from "$lib/game/App.svelte";

    import Announcement from "./game/Announcement.svelte";
    import BaseMenu from "./game/BaseMenu.svelte";
    import Cargo from "./game/Cargo.svelte";
    import Chat from "./game/Chat.svelte";
    import Leaderboard from "./game/Leaderboard.svelte";
    import Inventory from "./game/Inventory.svelte";
    import Stats from "./game/Stats.svelte";
    import Settings from "./splash/Settings.svelte";

    const { app }: { app: App } = $props();
</script>

<div class="font-game">
    <BaseMenu {app} />
    <Cargo {app} />
    <div class="flex flex-col absolute bottom-0 left-0 gap-4">
        <Announcement {app} />
        <Chat {app} />
    </div>
    <div class="flex absolute top-0 right-0 gap-4">
        <Stats {app} />
        <Leaderboard {app} />
    </div>
    <div class="flex flex-col absolute bottom-0 right-0 gap-1.5">
        <span class="text-2xl text-info text-right me-2 mb-1 select-none transition-colors"></span>
        <Inventory {app} />
        <span class="text-md text-info text-right me-2 select-none">Scroll to Change Weapons</span>
        <div class="mb-2 me-2">
            <Settings {app} />
        </div>
    </div>
</div>

<style>
    @keyframes warnPulse {
        0% {
            color: var(--color-warning);
        }

        50% {
            color: var(--color-info);
        }

        100% {
            color: var(--color-warning);
        }
    }

    div > div:last-child > span:first-child {
        animation: warnPulse 1.25s ease-in-out infinite;
    }
</style>
