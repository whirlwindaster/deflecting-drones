<script lang="ts">
    import { onMount } from 'svelte';
    import {
        DEFAULT_CONFIG,
        type Coordinate,
        type GameConfig,
        type GenericMessageToPlayer,
        type RobotColor,
        type Tile,
        type Bid,
        type Goal
    } from '$lib/types';
    import TileComponent from './TileComponent.svelte';
    import { demonstrator } from '$lib/stores';
    import TextDisplay from './TextDisplay.svelte';
    import { secondsToClockString, toSeconds, wsSend } from '$lib/helpers';
    import { API_WS_URL } from '$lib/helpers';
    import { goto } from '$app/navigation';

    let board: Tile[][] = [];
    for (let x = 0; x < 16; x++) {
        const row: Tile[] = [];
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
    let myName: string;
    let m_demonstrator: string = '';
    let demo_moves: number = 0;
    let bids: Bid[] = [];
    let gameCode: string = '';
    let timer: number = 0;
    let gameConfig: GameConfig = DEFAULT_CONFIG;
    let robotPositions: Record<RobotColor, Coordinate> = {
        r: { x: 0, y: 0 },
        y: { x: 0, y: 0 },
        g: { x: 0, y: 0 },
        u: { x: 0, y: 0 },
        b: { x: 0, y: 0 }
    };

    demonstrator.subscribe((playerName) => {
        m_demonstrator = playerName;
    });

    let interval_id: NodeJS.Timer | number;
    let bidInput: string = '';
    let chatInput: string = '';

    let chatFocused = false;

    function scrollChat() {
        (document.getElementById('chatEnd') as HTMLElement).scrollIntoView({
            block: 'nearest',
            inline: 'nearest'
        });
    }

    let ws: WebSocket;
    let sendConfig: () => void = () => {};

    onMount(() => {
        ws = new WebSocket(`${API_WS_URL}?uuid=${localStorage.getItem('uuid')}`);

        ws.onopen = () => {
            sendConfig = () => {
                wsSend(ws, {
                    category: 'config',
                    config: gameConfig
                });
            };
        };

        ws.onerror = () => {
            window.alert('websocket connection failed. create or join a new game');
            goto('/er');
        };

        ws.onmessage = (m) => {
            const message = JSON.parse(m.data) as GenericMessageToPlayer;
            if (message.log) {
                log = [...log, `[SERVER]: ${message.log}`];
                scrollChat();
            }
            switch (message.category) {
                case 'chat':
                    log = [...log, `${message.name}: ${message.msg}`];
                    scrollChat();
                    break;
                case 'config_update':
                    gameConfig = message.game_config;
                    break;
                case 'check_in':
                    players = message.players;
                    amHost = message.is_host;
                    myName = message.name;
                    round = message.round;
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
                    board = board;
                    break;
                case 'player_update':
                    if (message.add) {
                        players = [...players, [message.name, 0]];
                    } else {
                        players = players.filter(([playerName, _]) => playerName !== message.name);
                    }
                    break;
                case 'robot_update':
                    for (const [robot, coord] of message.robots) {
                        board[robotPositions[robot].x][robotPositions[robot].y].robot = null;
                        board[coord.x][coord.y].robot = robot;
                        robotPositions[robot] = coord;
                    }
                    // TODO make sure this assignment is needed
                    board = board;
                    break;
                case 'timer':
                    clearInterval(interval_id);
                    timer = message.seconds;
                    interval_id = setInterval(() => {
                        timer -= 1;
                        if (timer === 0) clearInterval(interval_id);
                    }, 1000);
                    break;
                case 'new_round':
                    currentGoal = message.goal;
                    bids = [];
                    round += 1;
                    demonstrator.set('');
                    demo_moves = 0;
                    break;
                case 'bid':
                    bids.unshift({ player: message.name, moves: message.moves });
                    for (let i = 0; i < bids.length - 1; i++) {
                        if (bids[i].moves >= bids[i + 1].moves) {
                            const temp = bids[i];
                            bids[i] = bids[i + 1];
                            bids[i + 1] = temp;
                        }
                    }
                    bids = bids;
                    break;
                case 'demonstrator':
                    bids.shift();
                    bids = bids;
                    demonstrator.set(message.name);
                    demo_moves = message.moves;
                    break;
                case 'score':
                    for (let i = 0; i < players.length; i++) {
                        if (players[i][0] === message.name) {
                            players[i][1] += message.points;
                            break;
                        }
                    }
                    players = players.sort(([_, aScore], [__, bScore]) =>
                        bScore > aScore ? 1 : -1
                    );
                    break;
            }
        };
        ws.onclose = () => {
            clearInterval(interval_id);
            timer = 0;
            demonstrator.set('');
        };

        function handleKeyboard(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                if (chatFocused) {
                    wsSend(ws, {
                        category: 'chat',
                        msg: chatInput
                    });
                    chatInput = '';
                } else if (round) {
                    wsSend(ws, {
                        category: 'bid',
                        moves: parseInt(bidInput)
                    });
                    bidInput = '';
                }
            }
        }

        document.addEventListener('keydown', handleKeyboard);

        return () => {
            document.removeEventListener('keydown', handleKeyboard);
            ws.close();
        };
    });
</script>

<div class="grid grid-cols-7 grid-rows-4 gap-6 p-8 max-h-full">
    <!-- left panes -->
    <div class="grid grid-rows-subgrid grid-cols-subgrid row-span-4 col-span-2 gap-6 max-h-full">
        <!-- leaderboard -->
        <div class="col-span-2 row-span-2 bg-primary rounded-lg p-6">
            <p class="text-xl text-center pb-2">leaderboard</p>
            <div class="overflow-y-scroll bg-accent shadow-inner rounded min-h-80 max-h-80">
                <ol class="list-decimal pl-6">
                    {#each players as [playerName, score]}
                        <li class="py-2">{`${playerName}: ${score}`}</li>
                    {/each}
                </ol>
            </div>
        </div>

        <!-- chat -->
        <div
            class="col-span-2 row-span-2 bg-primary rounded-lg p-6 h-full max-h-full overflow-hidden"
        >
            <p class="text-xl text-center pb-2">chat</p>
            <div
                class="overflow-y-scroll bg-accent shadow-inner rounded min-h-[17rem] max-h-[17rem]"
            >
                {#each log as msg}
                    <p class="relative pl-1 text-wrap">{msg}</p>
                {/each}
                <div id="chatEnd" />
            </div>
            <div class="flex items-center pt-4 gap-2">
                <input
                    class="bg-accent w-4/5 shadow-inner rounded"
                    maxlength="200"
                    bind:value={chatInput}
                    on:focus={() => {
                        chatFocused = true;
                    }}
                    on:blur={() => {
                        chatFocused = false;
                    }}
                />
                <button
                    class="bg-accent rounded w-1/5 shadow hover:cursor-default hover:shadow-md"
                    on:click={() => {
                        wsSend(ws, {
                            category: 'chat',
                            msg: chatInput
                        });
                        chatInput = '';
                    }}
                >
                    send
                </button>
            </div>
        </div>
    </div>

    <!-- board -->
    <div
        class="col-span-3 row-span-4 bg-{m_demonstrator === myName
            ? 'danger'
            : 'primary'} rounded-lg p-6"
    >
        <div class="grid grid-cols-16 border-dark_grey border-2 border-solid shadow">
            {#each Array(16) as _, y}
                {#each Array(16) as _, x}
                    <TileComponent tile={board[x][y]} {ws} />
                {/each}
            {/each}
        </div>
    </div>

    {#if round}
        <TextDisplay title="timer" content={secondsToClockString(timer)} textSize={6} />
        <TextDisplay title="round" content={round.toString()} textSize={7} />

        <!-- goal display -->
        <div class="bg-primary rounded-lg p-6 text-center">
            <p class="text-center pb-2 text-xl">goal</p>
            <div class="flex items-center shadow-inner bg-accent rounded min-h-[70%]">
                <img
                    class="mx-auto w-24 h-24"
                    src={`/goals/${currentGoal?.color || 'm'}_${
                        currentGoal?.shape || 'vortex'
                    }.svg`}
                    alt={`${currentGoal?.color || 'm'} ${currentGoal?.shape || 'vortex'} goal`}
                />
            </div>
        </div>

        <TextDisplay
            title="showing bid"
            content={m_demonstrator ? `${m_demonstrator}: ${demo_moves}` : ''}
        />

        <!-- queued bids -->
        <div class="col-span-2 bg-primary rounded-lg p-6 text-center max-h-full overflow-hidden">
            <p class="text-center pb-2 text-xl">queued bids</p>
            <div class="overflow-y-scroll shadow-inner bg-accent rounded min-h-24 max-h-24">
                {#each bids as bid, rank}
                    <p class="py-1">{`${rank + 1}. ${bid.player}: ${bid.moves}`}</p>
                {/each}
            </div>
        </div>

        <!-- bid submit -->
        <div
            class="flex flex-col justify-center items-center col-span-2 bg-primary min-w-full rounded-lg p-6"
        >
            <input
                class="bg-accent shadow-inner rounded w-full p-3 mb-2 text-center"
                type="number"
                min="2"
                max="500"
                placeholder="enter bid"
                bind:value={bidInput}
            />
            <button
                class="bg-accent border-background rounded p-3 w-full mt-2 hover:shadow"
                on:click={() => {
                    wsSend(ws, {
                        category: 'bid',
                        moves: parseInt(bidInput)
                    });
                    bidInput = '';
                }}
            >
                submit bid!
            </button>
        </div>
    {:else}
        <!-- game code -->
        <div class="col-span-2 bg-primary rounded-lg p-6 text-center w-full">
            <p class="text-center pb-2 text-xl">code</p>
            <div class="shadow-inner bg-accent rounded h-max">
                <p class="text-center text-7xl font-bold p-2">{gameCode}</p>
            </div>
        </div>

        <!-- game config -->
        <div class="col-span-2 row-span-2 bg-primary rounded-lg p-6 text-center">
            <div class="bg-accent rounded shadow-inner h-full">
                <p class="text-xl p-4">rounds: {gameConfig.num_rounds}</p>
                <input
                    type="range"
                    class="w-4/5 border-transparent"
                    min="1"
                    max="16"
                    disabled={!amHost}
                    on:change={sendConfig}
                    bind:value={gameConfig.num_rounds}
                />
                <p class="text-xl p-4">
                    pre-bid timeout: {secondsToClockString(toSeconds(gameConfig.pre_bid_timeout))}
                </p>
                <input
                    type="range"
                    class="w-4/5"
                    min="100000"
                    max="500000"
                    step="50000"
                    disabled={!amHost}
                    on:change={sendConfig}
                    bind:value={gameConfig.pre_bid_timeout}
                />
                <p class="text-xl p-4">
                    post-bid timeout: {secondsToClockString(toSeconds(gameConfig.post_bid_timeout))}
                </p>
                <input
                    type="range"
                    class="w-4/5"
                    min="15000"
                    max="105000"
                    step="15000"
                    disabled={!amHost}
                    on:change={sendConfig}
                    bind:value={gameConfig.post_bid_timeout}
                />
                <p class="text-xl p-4">
                    demo timeout: {secondsToClockString(toSeconds(gameConfig.demo_timeout))}
                </p>
                <input
                    type="range"
                    class="w-4/5"
                    min="30000"
                    max="90000"
                    step="5000"
                    disabled={!amHost}
                    on:change={sendConfig}
                    bind:value={gameConfig.demo_timeout}
                />
            </div>
        </div>

        <!-- start button -->
        <div class="col-span-2 p-6 bg-primary rounded-lg">
            {#if amHost}
                <button
                    class="rounded bg-accent border-background p-4 w-full h-full text-center shadow hover:shadow-lg text-8xl font-light"
                    on:click={() => {
                        wsSend(ws, {
                            category: 'start'
                        });
                    }}
                >
                    start!
                </button>
            {:else}
                <button
                    class="rounded bg-grey p-4 w-full h-full text-center shadow mx-auto text-8xl font-light cursor-default"
                >
                    start!
                </button>
            {/if}
        </div>
    {/if}
</div>
