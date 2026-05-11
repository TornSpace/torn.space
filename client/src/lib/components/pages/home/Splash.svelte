<script lang="ts">
    import { AppState, type App } from "$lib/game/App.svelte";
    import Guest from "./splash/Guest.svelte";
    import Links from "./splash/Links.svelte";
    import Login from "./splash/Login.svelte";
    import Logo from "./splash/Logo.svelte";
    import Lore from "./splash/Lore.svelte";
    import Settings from "./splash/Settings.svelte";

    const { app }: { app: App } = $props();
</script>

<div class="w-screen h-screen text-white overflow-hidden font-game">
    <div class="flex flex-col xl:flex-row justify-around items-center w-full h-full px-50 pb-50" class:hidden={app.state !== AppState.Splash}>
        <Guest {app} />
        <Logo />
        <Login bind:username={app.loginUser} bind:password={app.loginPass} />
    </div>
    {#if app.state === AppState.Lore}
        <Lore {app} text={app.localization.translation.lore[app.guestTeamSelect]} team={app.guestTeamSelect} />
    {/if}
</div>

<Links />
<Settings />
