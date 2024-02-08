<script lang="ts">
    import { goto } from '$app/navigation';
    import { myName, uuid } from '$lib/stores';

    async function onSubmit(e: Event) {
        e.preventDefault();

        const username = (document.getElementById('create_name') as HTMLInputElement)
            .value;
        const jsonData: Record<string, string> = {
            name: username,
            num_rounds: (document.getElementById('num_rounds') as HTMLInputElement)
                .value,
            board_setup_num: (
                document.getElementById('board_setup_num') as HTMLInputElement
            ).value,
            pre_bid_timeout: (
                document.getElementById('pre_bid_timeout') as HTMLInputElement
            ).value,
            post_bid_timeout: (
                document.getElementById('post_bid_timeout') as HTMLInputElement
            ).value,
            demo_timeout: (document.getElementById('demo_timeout') as HTMLInputElement)
                .value
        };

        const resp = await fetch(`http://${import.meta.env.VITE_API_URL}create`, {
            method: 'POST',
            body: JSON.stringify(jsonData)
        });
        const respText = await resp.text();

        if (!resp.ok) {
            window.alert(`server error: ${respText}`);
            return;
        }

        myName.set(username);
        uuid.set(respText);
        localStorage.setItem('username', username);
        localStorage.setItem('uuid', respText);

        goto('/er/game');
    }
</script>

<form autocomplete="off" on:submit={onSubmit}>
    <h1 class="text-center text-xl">create game</h1>
    <label for="create_name">your name</label>
    <input
        class="bg-accent shadow-inner rounded w-full p-3 mb-3"
        type="text"
        id="create_name"
        name="name"
        maxLength={15}
    />
    <label for="num_rounds">number of rounds</label>
    <input
        class="bg-accent shadow-inner rounded w-full p-3 mb-3"
        type="number"
        min="1"
        max="16"
        id="num_rounds"
        name="num_rounds"
        value="8"
    />
    <label for="board_setup_num">board setup number</label>
    <select
        class="bg-accent shadow-inner rounded w-full p-3 mb-3"
        name="board_setup_num"
        id="board_setup_num"
    >
        <option value="1">1</option>
    </select>
    <label for="pre_bid_timeout">seconds to make bid</label>
    <input
        class="bg-accent shadow-inner rounded w-full p-3 mb-3"
        type="number"
        min="15"
        max="600"
        id="pre_bid_timeout"
        name="pre_bid_timeout"
        step="15"
        value="300"
    />
    <label for="post_bid_timeout">seconds before demonstration</label>
    <input
        class="bg-accent shadow-inner rounded w-full p-3 mb-3"
        type="number"
        min="15"
        max="600"
        id="post_bid_timeout"
        name="post_bid_timeout"
        step="15"
        value="60"
    />
    <label for="demo_timeout">seconds for demonstration</label>
    <input
        class="bg-accent shadow-inner rounded w-full p-3 mb-3"
        type="number"
        min="15"
        max="600"
        id="demo_timeout"
        name="demo_timeout"
        step="15"
        value="30"
    />
    <input type="hidden" name="create" value="true" />
    <button class="bg-accent rounded p-3 w-full mt-5 hover:shadow" type="submit">
        create!
    </button>
</form>
