<script lang="ts">
    import Volume2 from "@lucide/svelte/icons/volume-2";
    import VolumeX from "@lucide/svelte/icons/volume-x";

    import musicOff from "$lib/img/ui/icons/musicOff.png";
    import musicOn from "$lib/img/ui/icons/musicOn.png";

    import type { App } from "$lib/game/App.svelte";
    import { Locales } from "$lib/game/modules/Localization.svelte";

    const { app }: { app: App } = $props();

    let musicMuted = $derived(app.config.config.muteMusic);
    let audioMuted = $derived(app.config.config.muteAudio);
</script>

<div class="flex absolute bottom-2 right-2 gap-1.5">
    <select class="bg-black/50 hover:bg-white/50 rounded-lg cursor-pointer"  name="" id="">
        {#each [...Object.entries(Locales)] as [code, locale], i (i)}
            <option value={code}>{locale}</option>
        {/each}
    </select>
    <button class="bg-black/50 hover:bg-white/50 rounded-lg cursor-pointer p-3 transition-colors" onclick={() => app.config.set("muteAudio", !audioMuted)}>
        {#if audioMuted}
            <VolumeX color="#ff0000" />
        {:else}
            <Volume2 color="#ff0000" />
        {/if}
    </button>
    <button class="bg-black/50 hover:bg-white/50 rounded-lg cursor-pointer p-3 transition-colors" onclick={() => app.config.set("muteMusic", !musicMuted)}>
        {#if musicMuted}
            <img class="size-6" src={musicOff} alt="Music muted icon">
        {:else}
            <img class="size-6" src={musicOn} alt="Music muted icon">
        {/if}
    </button>
</div>

<style>
    select {
        text-align-last: center;
        appearance: none;

        background-image: url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23ffffff%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right .75rem center;
        background-size: 16px 12px;

        padding: .375rem 2.25rem .375rem .75rem;
    }
</style>
