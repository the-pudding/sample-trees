<script>
	import { writable } from "svelte/store";
	import previous from "$stores/previous.js";

	import viewport from "$stores/viewport.js";

	import ELK from "elkjs/lib/elk.bundled.js";
	import {
		SvelteFlow,
		Background,
		Position,
		ConnectionLineType,
		useSvelteFlow
	} from "@xyflow/svelte";

	import "@xyflow/svelte/dist/style.css";
	import { getInitialNodesAndEdges } from "./nodes-and-edges.js";

	// import { initialNodes, initialEdges } from "./nodes-and-edges.js";

	import { onMount } from "svelte";
	import Node from "./Node/Node.svelte";
	import Edge from "./Edge/Edge.svelte";

	import { activeController } from "$stores/misc.js";

	export let initController;
	export let tree;

	$: treeIsVisible = tree == $activeController.tree;

	const [initialNodes, initialEdges] = getInitialNodesAndEdges(tree);


	// Create the "previous" store based on `count`
	let previousIndex = $activeController.index;

	// Stores for nodes and edges
	const nodes = writable([]);
	const edges = writable([]);

	const textHeight = 30;
	const waveformHeight = 30;

	const nodeHeight = Math.min(
		$viewport.height / 2 - textHeight - waveformHeight,
		260
	);

	const nodeWidth = nodeHeight * 0.75;

	$: layout = {
		"elk.direction": "DOWN",
		"elk.algorithm": "mrtree",
		// "elk.layered.spacing.nodeNodeBetweenLayers": 0,
		"elk.spacing.nodeNode": $activeController.nodeHorizontalGap ?? nodeWidth
	};

	let previousLayout = layout;

	const { fitView } = useSvelteFlow();
	let flowRef; // Reference to the SvelteFlow instance

	// Initialize ELK instance
	const elk = new ELK();

	// ELK layout configuration options

	// Function to get layouted elements (nodes and edges)
	function getLayoutedElements(nodes, edges, options = {}) {
		const isHorizontal = options?.["elk.direction"] === "RIGHT";
		const graph = {
			id: "root",
			layoutOptions: options,
			children: nodes.map((node) => ({
				...node,
				targetPosition: isHorizontal ? Position.Left : Position.Top,
				sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
				width: nodeWidth,
				height: nodeHeight
			})),
			edges: edges
		};


		return elk
			.layout(graph)
			.then((layoutedGraph) => ({
				nodes: layoutedGraph.children.map((node) => ({
					...node,
					position: { x: node.x, y: node.y }
				})),
				edges: layoutedGraph.edges
			}))
			.catch(console.error);
	}

	// Function to handle layout changes
	function onLayout(direction, useInitialNodes = false, init) {
		console.log("--onLayout--");

		const ns = $nodes;
		const es = $edges;

		getLayoutedElements(ns, es, layout).then(
			({ nodes: layoutedNodes, edges: layoutedEdges }) => {
				$nodes = layoutedNodes;
				$edges = layoutedEdges;
				setTimeout(
					() => {
						window.setTimeout(() => {
							fitView({
								nodes: $nodes,
								// nodes: visibleNodes.map((id) => ({ id })), // Specify the nodes to zoom to by ID
								padding: 0.05,
								includeHiddenNodes: true,
								duration: 500
							});
						}, 10);
					},
					init ? 10 : 0
				);
				window.requestAnimationFrame(() => fitView());
			}
		);
	}



	// Initial layout on mount
	onMount(() => {
		onLayout("DOWN", true, true);
	});



	const nodeTypes = {
		custom: Node
	};

	const edgeTypes = {
		crossfade: Edge
	};

	function handleUpdate() {
		let visibleNodes = $activeController.visibleNodes
			.split(",")
			.map((id) => id.trim());

		const visibleEdges = visibleNodes.reduce((acc, curr, index, arr) => {
			if (index < arr.length - 1) {
				acc.push(`e-${curr}-${arr[index + 1]}`);
			}
			return acc;
		}, []);

		$nodes = initialNodes.filter((node) => visibleNodes?.includes(node.id));

		$edges = initialEdges.filter((edge) => visibleEdges?.includes(edge.id));

		onLayout("DOWN", true, true);


	}

	// Update node visibility based on controller.visibleNodes
	$: if (previousIndex != $activeController.index) {
		// if (JSON.stringify(previousLayout) != JSON.stringify(layout)) {
		// 	onLayout();
		// 	previousLayout = layout;
		// }
		// onLayout();
		// updateLayout();

		handleUpdate();

		previousIndex = $activeController.index;

		// eventContent = events[$activeController.index];
		// console.log(eventContent);

		// if (eventContent) {
		// 	$nodes.forEach((node) => {
		// 		node.data = {
		// 			...node.data,
		// 			eventText: eventContent[node.id]?.text || "",
		// 			eventTextPosition: eventContent[node.id]?.position || ""
		// 		};
		// 	});
		// } else {
		// 	$nodes.forEach((node) => {
		// 		node.data = {
		// 			...node.data,
		// 			eventText: "",
		// 			eventTextPosition: ""
		// 		};
		// 	});
		// }
	}
</script>

<!-- Flow visualization layout -->
<div
	id="flow-{tree}"
	class="flow"
	class:treeIsVisible
	style:--node-width="{nodeWidth}px"
	style:--node-height="{nodeHeight}px"
>
	<SvelteFlow
		bind:this={flowRef}
		{nodes}
		{edges}
		{nodeTypes}
		{edgeTypes}
		fitView
		connectionLineType={ConnectionLineType.SmoothStep}
		defaultEdgeOptions={{ type: "smoothstep", animated: false }}
	>
		<Background bgColor="#f0f0f0" patternColor="#f0f0f0" />
	</SvelteFlow>
</div>

<style lang="scss">
	.flow {
		top: 0px;
		height: 100svh;
		width: 100%;
		opacity: 0;
		position: absolute;
		top: 0;
		left: 0;

		&.treeIsVisible {
			opacity: 1;
		}
	}

	:global(.svelte-flow__edges) {
		position: relative !important;
	}
</style>
