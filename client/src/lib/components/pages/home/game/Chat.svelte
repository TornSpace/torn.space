<script lang="ts">
    import type { App } from "$lib/game/App.svelte";

    const { app }: { app: App } = $props();

    let message = $state("");

    let chatInput: HTMLInputElement | undefined = undefined;

    // TODO: Combine this with InputManager.
    function tryChat (e: KeyboardEvent): void {
        if (e.code === "Enter" && document.activeElement?.tagName !== "INPUT") {
            e.preventDefault();
            chatInput?.focus();
        }
    }
</script>

<div class="bg-card p-2 rounded-tr-2xl w-132.5 min-w-132.5 h-42.5">
    <div class="flex flex-col w-full h-full">
        <div class="grow overflow-y-auto"></div>
        <form class="w-full">
            <input bind:this={chatInput} type="text" bind:value={message} placeholder="Press enter to chat!" maxlength="128" class="w-3/4 text-sm text-white placeholder:text-muted select-none" />
        </form>
    </div>
</div>

<svelte:window onkeydown={tryChat} />
