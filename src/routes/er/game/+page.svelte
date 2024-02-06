<script lang="ts">
	import { onMount } from "svelte";

    let ws: WebSocket;

    onMount(() => {
        window.alert("didmount");
        ws = new WebSocket(`ws://${import.meta.env.VITE_API_URL}ws?name=${localStorage.getItem("username")}&uuid=${localStorage.getItem("uuid")}`);

        ws.onerror = () => {window.alert("noo")};
        ws.onopen = () => {window.alert("yayy")};
        ws.onmessage = (m) => {console.log(JSON.stringify(m))};
    })
</script>

<div></div>