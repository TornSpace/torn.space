<script lang="ts">
    import Guest from "./splash/Guest.svelte";
    import Links from "./splash/Links.svelte";
    import Login from "./splash/Login.svelte";
    import Logo from "./splash/Logo.svelte";
    import Settings from "./splash/Settings.svelte";
</script>

<div class="flex flex-col xl:flex-row justify-around items-center w-screen h-screen text-white overflow-hidden px-50 pb-50 font-game">
    <Guest />
    <Logo />
    <Login />
</div>

<Links />
<Settings />
