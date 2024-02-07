<script lang="ts">
    import { onMount } from 'svelte';
    import { DEFAULT_CONFIG, type Coordinate, type GameConfig, type GenericMessageToPlayer, type RobotColor, type Tile, type Bid, type Goal } from './types';
    import TileComponent from './TileComponent.svelte';
    import TextDisplay from './TextDisplay.svelte';

    let board: Tile[][] = [];
    for (let x = 0; x < 16; x++) {
        const row: Tile[] = []
        for (let y = 0; y < 16; y++) {
            row.push({
                goal: null,
                robot: null,
                right_wall: false,
                left_wall: false,
                top_wall: false,
                bottom_wall: false,
                coord: { x: x, y: y }
            });
        }
        board.push(row);
    }

    let log: string[] = [];
    let players: [string, number][] = [];
    let amHost: boolean = false;
    let round: number = 0;
    let currentGoal: Goal | null;
    let demonstrator: string = "";
    let bids: Bid[] = []
    let gameCode: string = "";
    let gameConfig: GameConfig = DEFAULT_CONFIG;
    let robotPositions: Record<RobotColor, Coordinate> = {
        r: {x: 0, y: 0},
        y: {x: 0, y: 0},
        g: {x: 0, y: 0},
        u: {x: 0, y: 0},
        b: {x: 0, y: 0},
    };

    let ws: WebSocket;

    onMount(() => {
        ws = new WebSocket(
            `ws://${import.meta.env.VITE_API_URL}ws?uuid=${localStorage.getItem('uuid')}`
        );

        ws.onerror = () => {
            console.log('err');
        };
        ws.onopen = () => {
            console.log('opened');
        };
        ws.onmessage = (m) => {
            console.log(`message received: ${m.data}`);
            const message = JSON.parse(m.data) as GenericMessageToPlayer;
            if (message.log) { log = [...log, message.log] };
            switch (message.category) {
                case ("check_in"):
                    players = message.players.map((playerName) => [playerName, 0]);
                    amHost = message.is_host;
                    gameCode = message.game_code;
                    gameConfig = message.game_config;
                    for (const goal of message.goals) {
                        board[goal.coord.x][goal.coord.y].goal = goal;
                    }
                    for (const right_wall of message.right_walls) {
                        board[right_wall.x][right_wall.y].right_wall = true;
                        board[right_wall.x + 1][right_wall.y].left_wall = true;
                    }
                    for (const bottom_wall of message.bottom_walls) {
                        board[bottom_wall.x][bottom_wall.y].bottom_wall = true;
                        board[bottom_wall.x][bottom_wall.y + 1].top_wall = true;
                    }
                    break;
                case 'player_update':
                    if (message.add) {
                        players = [...players, [message.name, 0]];
                    }
                    else {
                        players = players.filter(([playerName, _]) => playerName !== message.name);
                    }
                    break;
                case 'robot_update':
                    for (const [robot, coord] of message.robots) {
                        board[robotPositions[robot].x][robotPositions[robot].y].robot = null;
                        board[coord.x][coord.y].robot = robot;
                    }
                    break;
                case 'timer':
                    break;
                case 'new_round':
                    currentGoal = message.goal;
                    bids = [];
                    round += 1;
                    demonstrator = "";
                    break;
                case 'bid':
                    bids.push({ player: message.name, moves: message.moves });
                    for (let i = bids.length - 1; i > 0; i--) {
                        if (bids[i].moves >= bids[i - 1].moves) {
                            const temp = bids[i];
                            bids[i] = bids[i - 1];
                            bids[i - 1] = temp;
                        }
                    }
                    break;
                case 'demonstrator':
                    bids.pop();
                    demonstrator = message.name;
                    break;
                case 'score':
                    for (let i = 0; i < players.length; i++) {
                        if (players[i][0] === message.name) {
                            players[i][1] += message.points;
                            break;
                        }
                    }
                    break;
            }
        };

        return () => {
            ws.close();
        }
    });
</script>

<body class="min-h-screen bg-gradient-to-b from-background_dark to-background m-9">
    <div class="grid grid-cols-7 grid-rows-4 gap-6">
        {#if round}
            <TextDisplay title={"round"} content={round.toString()}/>
        {:else}
            
        {/if}
    </div>
</body>

<div>
    <div class="grid grid-cols-10">
        {#each Array(16) as _, y}
            {#each Array(16) as _, x}
                <TileComponent tile={board[x][y]}/>
            {/each}
        {/each}
    </div>
</div>
