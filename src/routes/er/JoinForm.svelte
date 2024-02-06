<script lang="ts">
    import { goto } from '$app/navigation';

    async function onSubmit(e: Event) {
        e.preventDefault();

        const username = (document.getElementById('join_name') as HTMLInputElement)
            .value;
        const jsonData: Record<string, string> = {
            name: username,
            game_code: (document.getElementById('game_code') as HTMLInputElement).value
        };

        const resp = await fetch(`http://${import.meta.env.VITE_API_URL}join`, {
            method: 'POST',
            body: JSON.stringify(jsonData)
        });
        const respText = await resp.text();

        if (!resp.ok) {
            window.alert(`server error: ${respText}`);
            return;
        }

        localStorage.setItem('username', username);
        localStorage.setItem('uuid', respText);

        goto('/er/game');
    }
</script>

<form autocomplete="off" class="relative" on:submit={onSubmit}>
    <h1 class="text-center text-xl">join game</h1>
    <label for="join_name">your name</label>
    <input
        class="bg-accent shadow-inner rounded w-full p-3 mb-3"
        type="text"
        id="join_name"
        name="name"
        maxLength={15}
    />
    <label for="game_code">game code</label>
    <input
        class="bg-accent shadow-inner rounded w-full p-3 mb-3"
        type="text"
        id="game_code"
        name="game_code"
    />
    <input type="hidden" name="join" value="true" />
    <button class="bg-accent rounded p-3 w-full mt-5 hover:shadow" type="submit">
        join!
    </button>
</form>
