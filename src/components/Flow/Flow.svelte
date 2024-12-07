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
	import { initialNodes, initialEdges } from "./nodes-and-edges.js";

	import { onMount } from "svelte";
	import Node from "./Node/Node.svelte";
	import Edge from "./Edge/Edge.svelte";

	import { activeController } from "$stores/misc.js";

	export let initController;

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
		const ns = useInitialNodes ? initialNodes : $nodes;
		const es = useInitialNodes ? initialEdges : $edges;

		getLayoutedElements(ns, es, layout).then(
			({ nodes: layoutedNodes, edges: layoutedEdges }) => {
				$nodes = layoutedNodes;
				$edges = layoutedEdges;
				setTimeout(
					() => {
						updateLayout();
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

	function updateLayout() {
		let visibleNodes = $activeController.visibleNodes
			.split(",")
			.map((id) => id.trim());

		updateNodes(visibleNodes);
		// Use fitView to fit the view to the visible nodes

		window.setTimeout(() => {
			fitView({
				nodes: $activeController.fitViewNodes.split(",").map((id) => ({ id })),
				// nodes: visibleNodes.map((id) => ({ id })), // Specify the nodes to zoom to by ID
				padding: 0.05,
				includeHiddenNodes: true,
				duration: 500
			});
		}, 10);
	}

	// Function to update the visibility and opacity of nodes
	function updateNodes(visibleNodeIds) {
		$nodes = $nodes.map((node) => {
			const isVisible = visibleNodeIds?.includes(node.id);

			// let secondaryLabelConfig;
			// if (node.id == "64739") {
			// 	console.log(node);
			// }

			// if (node.data.secondaryLabelConfig) {
			// 	secondaryLabelConfig = parseSecondaryLabelConfig(
			// 		node.data.secondaryLabelConfig
			// 	)[$activeController.secondaryLabelAccessor];
			// 	console.log(secondaryLabelConfig, "here?");
			// }

			return {
				...node,
				hidden: !isVisible,
				// data: {
				// 	...node.data
				// }
			};
		});

		const visibleEdges = visibleNodeIds.reduce((acc, curr, index, arr) => {
			if (index < arr.length - 1) {
				acc.push(`e-${curr}-${arr[index + 1]}`);
			}
			return acc;
		}, []);

		$edges = $edges.map((edge) => {
			const isVisible = visibleEdges?.includes(edge.id);

			return {
				...edge,
				hidden: !isVisible
			};
		});
	}

	const nodeTypes = {
		custom: Node
	};

	const edgeTypes = {
		crossfade: Edge
	};

	// Update node visibility based on controller.visibleNodes
	$: if (previousIndex != $activeController.index) {
		if (JSON.stringify(previousLayout) != JSON.stringify(layout)) {
			onLayout();
			previousLayout = layout;
		}

		updateLayout();
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
	id="flow"
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
	#flow {
		top: 0px;
		height: 100svh;
		width: 100%;
	}

	:global(.svelte-flow__edges) {
		position: relative !important;
	}
</style>
