<script lang="ts">
    import type { RobotColor } from "./types";
    import { demonstrator } from "./stores";

    export let robot: RobotColor | null;

    let isMyTurn: boolean
    demonstrator.subscribe((playerName) => {
        if (playerName === localStorage.getItem("username")) {
            isMyTurn = true;
        }
    })
</script>

<div>
    {#if isMyTurn}
        <p>my turn</p>
    {/if}
</div>