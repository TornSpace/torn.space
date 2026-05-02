<script lang="ts">
    import { onMount } from "svelte";

    import musicOff from "$lib/img/ui/icons/musicOff.png";
    import musicOn from "$lib/img/ui/icons/musicOn.png";
    import sfxOff from "$lib/img/ui/icons/sfxOff.png";
    import sfxOn from "$lib/img/ui/icons/sfxOn.png";

    let musicMuted = $state(false);
    let sfxMuted = $state(false);

    onMount(() => {
        // Obtain settings from localStorage and apply them.
    });

    // TODO: Write actual functions for muting / unmuting music & SFX.
</script>

<div class="flex absolute bottom-2 right-2 gap-1.5">
    <button class="bg-black/50 hover:bg-white/50 rounded-xl p-3 transition-colors" onclick={() => sfxMuted = !sfxMuted}>
        {#if sfxMuted}
            <img src={sfxOff} alt="SFX muted icon">
        {:else}
            <img src={sfxOn} alt="SFX muted icon">
        {/if}
    </button>
    <button class="bg-black/50 hover:bg-white/50 rounded-xl p-3 transition-colors" onclick={() => musicMuted = !musicMuted}>
        {#if musicMuted}
            <img src={musicOff} alt="Music muted icon">
        {:else}
            <img src={musicOn} alt="Music muted icon">
        {/if}
    </button>
</div>
