<script>
	import { writable } from "svelte/store";
	import {
		SvelteFlow,
		Background,
		ConnectionLineType,
		useSvelteFlow
	} from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";

	import { setContext } from 'svelte';
	import viewport from "$stores/viewport";

	import Node from "./Node/Node.svelte";
	import Edge from "./Edge/Edge.svelte";
	import SimpleNode from "./Node/SimpleNode.svelte";
	import SimpleEdge from "./Edge/SimpleEdge.svelte";

	const { fitView } = useSvelteFlow();

	export let activeTree;
	export let activeController;
	export let slides = [];
	export let offset = 0;

	// Create dimensions store
	const textHeight = 30;
	const waveformHeight = 20;
	const playheadHeight = 6;
	const waveformGap = 4; // TODO this might need to by dynamic or zoom dependent

	$: nodeHeight = Math.min(
		$viewport.height / 2 - textHeight - waveformHeight,
		220
	);
	$: nodeWidth = nodeHeight * 0.75;

	const dimensions = writable({
		textHeight,
		waveformHeight,
		nodeHeight,
		nodeWidth,
		playheadHeight,
		waveformGap
	});

	// Update dimensions when viewport changes
	$: dimensions.set({
		textHeight,
		waveformHeight,
		nodeHeight,
		nodeWidth,
		playheadHeight,
		waveformGap
	});

	setContext('dimensions', dimensions);

	// Create a writable store for the controller
	const controllerStore = writable(activeController);
	setContext('activeController', controllerStore);

	// Create crossfades store
	const crossfades = writable({});
	setContext('crossfades', crossfades);

	// Update crossfades when slides change
	$: {
		const crossfadesObj = slides
			.filter((d) => d?.controller?.component?.type == "crossfade")
			.reduce((acc, item) => {
				const { id } = item.controller?.component;
				const [source, target] = id.split("_");

				acc[id] = {
					source,
					target
				};

				return acc;
			}, {});
		crossfades.set(crossfadesObj);
	}

	// Update progress when offset changes
	$: if ($controllerStore?.component?.type == "crossfade") {
		const id = $controllerStore.component?.id;
		const crossfadeData = $crossfades[id];
		if (crossfadeData) {
			crossfadeData.progress = $controllerStore.focusNode == crossfadeData.source
				? offset / 2
				: offset / 2 + 0.5;
			crossfades.set($crossfades);
		}
	}

	// Update the store whenever activeController changes
	$: controllerStore.set(activeController);

	// Create loops store
	const loops = writable({});
	setContext('loops', loops);

	// Update loops when slides change
	$: {
		const loopsObj = slides
			.filter((d) => d?.controller?.component?.type == "loop")
			.reduce((acc, item) => {
				const { id } = item.controller?.component;
				const nodeIds = id.split(",");

				acc[id] = {
					sequence: nodeIds,
					currentIndex: 0,
					isPlaying: true
				};

				return acc;
			}, {});
		loops.set(loopsObj);
	}

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
		custom: Edge,
		simple: SimpleEdge
	};

	// Reactive key to force re-render
	let flowKey = 0;

	// Watch for changes in activeTree and update nodes and edges accordingly
	$: if (activeTree) {
		nodes.set(activeTree.nodes);
		edges.set(activeTree.edges);
	}

	// Function to advance to next song in loop
	function advanceLoop(loopId) {
		loops.update(loops => {
			const loop = loops[loopId];
			if (loop && loop.isPlaying) {
				loop.currentIndex = (loop.currentIndex + 1) % loop.sequence.length;
			}
			return loops;
		});
	}

	// Expose advance function to components
	setContext('advanceLoop', advanceLoop);

	// Handle state changes when controller changes
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

		// Reset all loops
		loops.update(loops => {
			Object.keys(loops).forEach(key => {
				loops[key].isPlaying = false;
				loops[key].currentIndex = 0;
			});
			return loops;
		});

		// Initialize new state if this is a loop controller
		if (activeController?.component?.type === "loop") {
			const loopId = activeController.component.id;
			
			// Set up loop state
			loops.update(loops => {
				if (loops[loopId]) {
					loops[loopId].isPlaying = true;
					loops[loopId].currentIndex = 0;
				}
				return loops;
			});
		}

		window.setTimeout(() => {
			fitView({
				nodes: fitToNodes,
				padding: 0.05,
				duration: 500
			});
		}, 0);

		if (activeController.links === activeController.tree) {
			flowKey += 1;
		}

		previousIndex = activeController.index;
	}

	// Change the connection line type to 'straight'
	const connectionLineType = ConnectionLineType.Straight;
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
			{connectionLineType}
			defaultEdgeOptions={{ 
				type: "custom", 
				animated: false,
				style: { strokeWidth: 1 }
			}}
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
