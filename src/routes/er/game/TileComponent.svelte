<script lang="ts">
    import GoalComponent from "./GoalComponent.svelte";
    import RobotComponent from "./RobotComponent.svelte";
    import type { Coordinate, Tile, RobotColor} from "./types";

    export let tile: Tile;
</script>

<div>
    <GoalComponent goal={tile.goal} />
    <RobotComponent robot={tile.robot} />
</div>