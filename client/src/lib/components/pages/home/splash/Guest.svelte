<script lang="ts">
    import GuestButton from "./GuestButton.svelte";

    import b0 from "$lib/img/ships/human/b0.png";
    import r0 from "$lib/img/ships/alien/r0.png";
    import g0 from "$lib/img/ships/cyborg/g0.png";

    import { Team } from "@/common/constants";

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
</script>

<div class="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 animate-in fade-in slide-in-from-left">
    <span class="font-bold text-xl">New Players</span>
    <GuestButton team="human" idx={humanIdx} image={b0} />
    <GuestButton team="alien" idx={alienIdx} image={r0} />
    <GuestButton team="cyborg" idx={cyborgIdx} image={g0} />
</div>

<style>
    div {
        animation-duration: 1s;
    }
</style>
