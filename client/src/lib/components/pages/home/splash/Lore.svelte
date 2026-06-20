<script lang="ts">
    import type { App } from "$lib/game/App.svelte";
    import { Team } from "@/common/constants.ts";

    const { app, text, team }: { app: App, text: string, team: Team } = $props();

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="absolute top-0 left-0 flex justify-center items-center w-full h-full px-14" onclick={() => app.join()} role="button" tabindex="0">
    <span
        class="text-[22px] leading-10 cursor-pointer animate-in duration-1500 fade-in slide-in-from-top"
        class:text-human={team === Team.Human}
        class:text-alien={team === Team.Alien}
        class:text-cyborg={team === Team.Cyborg}
    >{text}</span>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span class="text-info absolute bottom-12 text-accent text-3xl cursor-pointer">Click to play!</span>
</div>

<style>
    @keyframes growShrink {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.5);
        }

        100% {
            transform: scale(1);
        }
    }

    span:last-child {
        animation: growShrink 1.75s ease-in-out infinite;
    }
</style>
