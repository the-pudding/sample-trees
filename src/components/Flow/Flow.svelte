<script>
	import { writable } from "svelte/store";
	import previous from "$stores/previous.js";
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
	import CustomNode from "./Node/Node.svelte";
	import CrossfadeEdge from "./CrossfadeEdge.svelte";

	import { activeController } from "$stores/misc.js";

	export let initController;

	console.log(initController);

	const { viewport } = useSvelteFlow();

	// Create the "previous" store based on `count`
	let previousIndex = $activeController.index;

	// Stores for nodes and edges
	const nodes = writable([]);
	const edges = writable([]);

	// const nodeWidth = window.innerHeight / 5;
	const nodeWidth = 150;

	const { fitView } = useSvelteFlow();
	let flowRef; // Reference to the SvelteFlow instance

	// Initialize ELK instance
	const elk = new ELK();

	// ELK layout configuration options
	const elkOptions = {
		"elk.algorithm": "mrtree",
		"elk.layered.spacing.nodeNodeBetweenLayers": nodeWidth,
		"elk.spacing.nodeNode": nodeWidth / 2
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
				height: getHeightFromAR(nodeWidth)
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

		let fadedNodes = [];
		// let fadedNodes = $activeController?.fadedNodes
		// 	?.split(",")
		// 	.map((id) => id.trim());

		updateNodeVisibility(visibleNodes, fadedNodes);
		// Use fitView to fit the view to the visible nodes

		fitView({
			nodes: $activeController.focusNode.split(",").map((id) => ({ id })),
			// nodes: visibleNodes.map((id) => ({ id })), // Specify the nodes to zoom to by ID
			padding: 1,
			duration: 500
		});
	}

	// Function to update the visibility and opacity of nodes
	function updateNodeVisibility(visibleNodeIds, fadedNodeIds) {
		$nodes = $nodes.map((node) => {
			const isVisible =
				visibleNodeIds?.includes(node.id) || fadedNodeIds?.includes(node.id);
			const isFaded = fadedNodeIds?.includes(node.id);

			return {
				...node,
				hidden: !isVisible,
				style: isFaded ? "opacity: 0.5;" : ""
			};
		});

		$edges = $edges.map((edge) => {
			const sourceIsFaded = fadedNodeIds?.includes(edge.source);
			const targetIsFaded = fadedNodeIds?.includes(edge.target);

			const isVisible =
				sourceIsFaded || targetIsFaded || visibleNodeIds?.includes(edge.source);
			const isFaded = sourceIsFaded || targetIsFaded;

			return {
				...edge,
				hidden: !isVisible,
				style: isFaded ? "opacity: 0.5;" : ""
			};
		});
	}

	const nodeTypes = {
		custom: CustomNode
	};

	const edgeTypes = {
		crossfade: CrossfadeEdge
	};

	const getHeightFromAR = (width) => {
		const aspectRatio = 444 / 300;
		const height = width * aspectRatio;
		return height;
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

		eventContent = events[$activeController.index];
		console.log(eventContent);

		if (eventContent) {
			$nodes.forEach((node) => {
				node.data = {
					...node.data,
					eventText: eventContent[node.id]?.text || "",
					eventTextPosition: eventContent[node.id]?.position || ""
				};
			});
		} else {
			$nodes.forEach((node) => {
				node.data = {
					...node.data,
					eventText: "",
					eventTextPosition: ""
				};
			});
		}
	}
</script>

<!-- Flow visualization layout -->
<div id="flow">
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
		height: 100lvh;
		width: 100%;
	}

	:global(.svelte-flow__edges) {
		position: relative !important;
	}
</style>
