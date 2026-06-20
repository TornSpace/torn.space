<script lang="ts">
    import { App, AppState } from "$lib/game/App.svelte";
    import type { Team } from "@/common/constants.ts";

    const { app, teamIdx, teamName, idx }: {
        app: App
        teamIdx: Team,
        teamName: string
        idx: number
    } = $props();

    const capitalizedTeam = $derived(teamName.slice(0, 1).toUpperCase() + teamName.slice(1));
</script>

<button
    class:order-0={idx === 0}
    class:order-1={idx === 1}
    class:order-2={idx === 2}
    class="flex items-center gap-1 p-3 rounded-xl cursor-pointer w-full h-10.5 transition-colors duration-300"
    onclick={() => (app.state = AppState.Lore, app.guestTeamSelect = teamIdx)}
>
    <span class="grow">Join {capitalizedTeam} Team!</span>
</button>

<style>
    button:nth-child(2) {
        background-color: var(--color-btn-human-translucent);
    }

    button:nth-child(3) {
        background-color: var(--color-btn-alien-translucent);
    }

    button:nth-child(4) {
        background-color: var(--color-btn-cyborg-translucent);
    }

    button:nth-child(2):hover {
        background-color: var(--color-btn-human);
    }

    button:nth-child(3):hover {
        background-color: var(--color-btn-alien);
    }

    button:nth-child(4):hover {
        background-color: var(--color-btn-cyborg);
    }
</style>
