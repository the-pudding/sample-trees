<script>
	import { writable } from "svelte/store";
	import { SvelteFlow, Controls, Background, MiniMap } from "@xyflow/svelte";

	import "@xyflow/svelte/dist/style.css";

	import CustomNode from "./CustomNode.svelte";

	const nodes = writable([
		{
			id: "1",
			data: { label: "Hello" },
			position: { x: 0, y: 0 }
		},
		{
			id: "2",
			data: { label: "World" },
			position: { x: 200, y: 0 }
		},
		{
			id: "3",
			type: "custom",
			data: { label: "World" },
			position: { x: 100, y: 150 }
		}
	]);

	const edges = writable([
		{
			id: "1-3",
			source: "1",
			target: "3"
		},
		{
			id: "2-3",
			source: "2",
			target: "3"
		}
	]);

	const nodeTypes = {
		custom: CustomNode
	};
</script>

<div style:height="100vh">
	<SvelteFlow {nodes} {edges} {nodeTypes} fitView>
		<Controls />
		<Background />
		<MiniMap />
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow__edges) {
		position: relative !important;
	}
</style>
