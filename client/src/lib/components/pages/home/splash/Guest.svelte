<script lang="ts">
    import GuestButton from "./GuestButton.svelte";

    import { Team } from "@/common/constants.ts";
    import type { App } from "$lib/game/App.svelte";

    const permutations = [
        [Team.Human, Team.Alien, Team.Cyborg],
        [Team.Human, Team.Cyborg, Team.Alien],
        [Team.Alien, Team.Human, Team.Cyborg],
        [Team.Alien, Team.Cyborg, Team.Human],
        [Team.Cyborg, Team.Human, Team.Alien],
        [Team.Cyborg, Team.Alien, Team.Human],
    ];

    const renderOrder = permutations[Math.floor(Math.random() * permutations.length)];

    const humanIdx = renderOrder.indexOf(Team.Human);
    const alienIdx = renderOrder.indexOf(Team.Alien);
    const cyborgIdx = renderOrder.indexOf(Team.Cyborg);

    const { app }: { app: App } = $props();
</script>

<div class="flex flex-col items-center gap-2 w-53 opacity-50 hover:opacity-100 transition-opacity duration-300 animate-in fade-in slide-in-from-left">
    <span class="font-bold text-xl">New Players</span>
    <GuestButton {app} teamIdx={Team.Human} teamName="human" idx={humanIdx} />
    <GuestButton {app} teamIdx={Team.Alien} teamName="alien" idx={alienIdx} />
    <GuestButton {app} teamIdx={Team.Cyborg} teamName="cyborg" idx={cyborgIdx} />
</div>

<style>
    div {
        animation-duration: 1s;
    }
</style>
