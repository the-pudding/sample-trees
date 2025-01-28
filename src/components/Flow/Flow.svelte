<script>
	import { writable } from "svelte/store";
	import {
		SvelteFlow,
		Background,
		ConnectionLineType,
		useSvelteFlow
	} from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";

	import Node from "./Node/Node.svelte";
	import Edge from "./Edge/Edge.svelte";
	import SimpleNode from "./Node/SimpleNode.svelte";

	const { fitView } = useSvelteFlow();

	export let activeTree
	export let activeController
	export let index;

	let flowRef;
	let previousIndex = activeController.index;

	// Initialize nodes and edges as writable stores
	const nodes = writable(activeTree.nodes);
	const edges = writable(activeTree.edges);

	// Define node and edge types
	const nodeTypes = {
		custom: Node,
		simple: SimpleNode
	};

	const edgeTypes = {
		// custom: Edge
	};

	// Reactive key to force re-render
	let flowKey = 0;

	// Watch for changes in activeTree and update nodes and edges accordingly
	$: if (activeTree) {
		nodes.set(activeTree.nodes);
		edges.set(activeTree.edges);
	}

	// Handle fitView when activeController index changes
	$: if (previousIndex !== activeController.index) {
		let fitToNodes;
		if (activeController?.fitViewNodes) {
			fitToNodes = activeController.fitViewNodes
				.split(",")
				.map((id) => id.trim())
				.map((id) => ({ id }));
		} else {
			fitToNodes = activeTree.nodes;
		}

		window.setTimeout(() => {
			fitView({
				nodes: fitToNodes,
				padding: 0.05,
				duration: 500
			});
		}, 0);

		// Watch for changes in the specific condition and update flowKey
		if (activeController.links === activeController.tree) {
			flowKey += 1; // Increment key to force re-render
		}

		previousIndex = activeController.index;
	}
</script>

{#key flowKey}
	<div class="flow">
		<SvelteFlow
			bind:this={flowRef}
			{nodes}
			{edges}
			{nodeTypes}
			{edgeTypes}
			fitView
			connectionLineType={ConnectionLineType.SmoothStep}
		>
			<Background bgColor="#f0f0f0" patternColor="#f0f0f0" />
		</SvelteFlow>
	</div>
{/key}

<style lang="scss">
	.flow {
		top: 0px;
		height: 100svh;
		width: 100%;
	}

	:global(.svelte-flow__edges) {
		position: relative !important;
		z-index: 1;
	}
</style>
