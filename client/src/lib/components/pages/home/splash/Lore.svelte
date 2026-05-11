<script lang="ts">
    import type { App } from "$lib/game/App.svelte";
    import { Team } from "@/common/constants";

    const { app, text, team }: { app: App, text: string, team: Team } = $props();

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="flex justify-center items-center w-full h-full px-14" onclick={() => app.join()} role="button" tabindex="0">
    <span
        class="text-2xl leading-10 cursor-pointer"
        class:text-human-lore={team === Team.Human}
        class:text-alien-lore={team === Team.Alien}
        class:text-cyborg-lore={team === Team.Cyborg}
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

    @keyframes slideAndFadeIn {
        0% {
            transform: translateY(-300%);
        }

        100% {}
    }

    span:first-child {
        animation: slideAndFadeIn 1.5s;
    }

    span:last-child {
        animation: growShrink 1.75s ease-in-out infinite;
    }
</style>
