<script lang="ts">
    import type { RobotColor } from "$lib/types";
    import { demonstrator } from "$lib/stores";
    import { onMount } from "svelte";

    export let ws: WebSocket;
    export let robot: RobotColor | null;

    let isMyTurn: boolean
    onMount(() => {
        demonstrator.subscribe((playerName) => {
            if (playerName === localStorage.getItem("username")) {
                isMyTurn = true;
            }
        })
    });
    
</script>

<div>
    {#if isMyTurn}
        <p>my turn</p>
    {/if}
</div>