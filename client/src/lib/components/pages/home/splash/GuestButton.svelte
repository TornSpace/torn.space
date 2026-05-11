<script lang="ts">
    import { App, AppState } from "$lib/game/App.svelte";
    import type { Team } from "@/common/constants";

    const { app, teamIdx, teamName, idx, image }: {
        app: App
        teamIdx: Team,
        teamName: string
        idx: number
        image: string
    } = $props();

    const capitalizedTeam = $derived(teamName.slice(0, 1).toUpperCase() + teamName.slice(1));
</script>

<button
    class:order-0={idx === 0}
    class:order-1={idx === 1}
    class:order-2={idx === 2}
    class="flex items-center gap-1 p-3 rounded-xl cursor-pointer w-full h-12 transition-colors duration-300"
    onclick={() => (app.state = AppState.Lore, app.guestTeamSelect = teamIdx)}
>
    <img src={image} alt="{capitalizedTeam} rank 0 ship" class="size-8">
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
