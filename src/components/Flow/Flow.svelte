<script>
	import { writable } from "svelte/store";
	import {
		SvelteFlow,
		Background,
		ConnectionLineType,
		useSvelteFlow
	} from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";

	import { setContext, onMount } from "svelte";
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
	export let isFullTree = false;

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

	setContext("dimensions", dimensions);

	// Create a writable store for the controller
	const controllerStore = writable(activeController);
	setContext("activeController", controllerStore);

	// Create crossfades store
	const crossfades = writable({});
	setContext("crossfades", crossfades);

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

	const secondaryLabels = writable({});
	setContext("secondaryLabels", secondaryLabels);

	// Create edge highlights store
	const edgeHighlights = writable([]);
	setContext("edgeHighlights", edgeHighlights);
	updateEdgeHighlights();

	// Update progress when offset changes
	$: if ($controllerStore?.component?.type == "crossfade") {
		const id = $controllerStore.component?.id;
		const crossfadeData = $crossfades[id];
		if (crossfadeData) {
			crossfadeData.progress =
				$controllerStore.focusNode == crossfadeData.source
					? offset / 2
					: offset / 2 + 0.5;
			crossfades.set($crossfades);
		}
	}

	// Update the store whenever activeController changes
	$: controllerStore.set(activeController);

	// Create loops store
	const loops = writable({});
	setContext("loops", loops);

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
		loops.update((loops) => {
			const loop = loops[loopId];
			if (loop && loop.isPlaying) {
				loop.currentIndex = (loop.currentIndex + 1) % loop.sequence.length;
			}
			return loops;
		});
	}

	// Expose advance function to components
	setContext("advanceLoop", advanceLoop);

	function fitViewToNodes() {
		let fitToNodes;

		if (activeController?.fitViewNodes) {
			fitToNodes = activeController.fitViewNodes
				.split(",")
				.map((id) => id.trim())
				.map((id) => ({ id }));
		} else {
			// Remove duplicate nodes by id
			fitToNodes = [
				...new Map(activeTree.nodes.map((node) => [node.id, node])).values()
			];
			// fitToNodes = activeTree.nodes;
		}

		window.setTimeout(() => {
			fitView({
				nodes: fitToNodes,
				padding: fitToNodes.length === 2 ? 0.2 : 0.05,
				duration: 500,
				minZoom: 0.1,
				maxZoom: 2,
				includeHiddenNodes: false,
				width: $viewport.width,
				height: window.innerHeight
			});
		}, 250);
	}

	function updateSecondaryLabels() {
		// Update secondary labels
		if (activeController?.secondaryLabel) {
			let labels = activeController?.secondaryLabel
				.replaceAll(/\n+/g, "")
				.split(";");

			labels.forEach((l) => {
				if (l.trim() === "") return;
				let parts = l.split(".");
				let id = parts[0].trim();
				let key = parts[1].trim();
				let value = parts[2].trim();

				// If the id doesn't exist yet, initialize it as an object
				if (!$secondaryLabels[id]) {
					$secondaryLabels[id] = {};
				}

				// Add or update the property
				$secondaryLabels[id][key] = value;
			});
		} else {
			$secondaryLabels = {};
		}
	}

	function updateEdgeHighlights() {
		// Update edge highlights
		if (activeController?.edgeHighlight) {
			const highlightedEdges = activeController.edgeHighlight
				.split(",")
				.map((id) => id.trim());

			$edgeHighlights = highlightedEdges;
		} else {
			$edgeHighlights = [];
		}

		$edgeHighlights = $edgeHighlights;
	}

	// Handle state changes when controller changes
	$: if (previousIndex !== activeController.index) {
		// fit the view
		fitViewToNodes();

		// Reset all loops
		loops.update((loops) => {
			Object.keys(loops).forEach((key) => {
				loops[key].isPlaying = false;
				loops[key].currentIndex = 0;
			});
			return loops;
		});

		// Initialize new state if this is a loop controller
		if (activeController?.component?.type === "loop") {
			const loopId = activeController.component.id;

			// Set up loop state
			loops.update((loops) => {
				if (loops[loopId]) {
					loops[loopId].isPlaying = true;
					loops[loopId].currentIndex = 0;
				}
				return loops;
			});
		}

		if (activeController.links === activeController.tree) {
			flowKey += 1;
		}

		updateSecondaryLabels();

		previousIndex = activeController.index;
	}

	// Handle the special case for the wrap1 controller
	$: if (activeController?.component?.id == "258574") {
		updateSecondaryLabels();
	}

	if (isFullTree) {
		updateSecondaryLabels();
		updateEdgeHighlights();
	}

	// Change the connection line type to 'straight'
	const connectionLineType = ConnectionLineType.Straight;

	onMount(() => {
		fitViewToNodes();
	});
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
			minZoom={0.1}
			maxZoom={2}
		>
			<Background bgColor="#f0f0f0" patternColor="#f0f0f0" />
		</SvelteFlow>
	</div>
{/key}

<style lang="scss">
	.flow {
		top: 0px;
		height: 100dvh;
		width: 100%;
		position: relative;
	}

	:global(.svelte-flow__edges) {
		position: relative !important;
		z-index: 1;
	}
</style>
