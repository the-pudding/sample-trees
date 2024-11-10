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

	const nodeHeight = $viewport.height / 2 - textHeight - waveformHeight;
	const nodeWidth = nodeHeight * (3 / 4);

	const { fitView } = useSvelteFlow();
	let flowRef; // Reference to the SvelteFlow instance

	// Initialize ELK instance
	const elk = new ELK();

	// ELK layout configuration options
	const elkOptions = {
		"elk.algorithm": "mrtree",
		"elk.layered.spacing.nodeNodeBetweenLayers": 0,
		"elk.spacing.nodeNode": nodeHeight * 0.75
	};

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
		const opts = { "elk.direction": direction, ...elkOptions };
		const ns = useInitialNodes ? initialNodes : $nodes;
		const es = useInitialNodes ? initialEdges : $edges;

		getLayoutedElements(ns, es, opts).then(
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

		updateNodeVisibility(visibleNodes);
		// Use fitView to fit the view to the visible nodes

		fitView({
			nodes: $activeController.fitViewNodes.split(",").map((id) => ({ id })),
			// nodes: visibleNodes.map((id) => ({ id })), // Specify the nodes to zoom to by ID
			padding: 0.05,
			duration: 500
		});

		// $nodes.forEach((node) => {
		// 	node.data = {
		// 		...node.data,
		// 		activeSource: $activeController?.component.id.split("_")[0],
		// 		activeTarget: $activeController?.component.id.split("_")[1]
		// 	};
		// });

		// $edges.forEach((edge) => {
		// 	edge.data = {
		// 		...edge.data
		// 	};
		// });
	}

	// Function to update the visibility and opacity of nodes
	function updateNodeVisibility(visibleNodeIds) {
		$nodes = $nodes.map((node) => {
			const isVisible = visibleNodeIds?.includes(node.id);

			return {
				...node,
				hidden: !isVisible
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

	const events = {
		2: {
			"64739": { text: "Great Great Great Grandparent", position: "top" },
			"253610": { text: "Great Great Grandparent", position: "right" },
			"234958": { text: "Great Grandparent", position: "right" },
			"234780": { text: "Grandparent", position: "right" },
			"234899": { text: "Parent", position: "right" },
			"233667": { text: "1996", position: "bottom" }
		}
	};

	let eventContent;

	// Update node visibility based on controller.visibleNodes
	$: if (previousIndex != $activeController.index) {
		updateLayout();
		previousIndex = $activeController.index;
		console.log("HERE");

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
