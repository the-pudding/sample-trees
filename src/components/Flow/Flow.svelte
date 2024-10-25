<script>
	import { writable } from "svelte/store";
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
	import CustomNode from "./CustomNode.svelte";
	import CrossfadeEdge from "./CrossfadeEdge.svelte";

	import { activeController } from "$stores/misc.js";

	// Stores for nodes and edges
	const nodes = writable([]);
	const edges = writable([]);

	const { fitView } = useSvelteFlow();
	let flowRef; // Reference to the SvelteFlow instance

	// Initialize ELK instance
	const elk = new ELK();

	// ELK layout configuration options
	const elkOptions = {
		"elk.algorithm": "mrtree",
		"elk.layered.spacing.nodeNodeBetweenLayers": "100",
		"elk.spacing.nodeNode": "200"
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
				width: 200,
				height: 300
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
	function onLayout(direction, useInitialNodes = false) {
		const opts = { "elk.direction": direction, ...elkOptions };
		const ns = useInitialNodes ? initialNodes : $nodes;
		const es = useInitialNodes ? initialEdges : $edges;

		getLayoutedElements(ns, es, opts).then(
			({ nodes: layoutedNodes, edges: layoutedEdges }) => {
				$nodes = layoutedNodes;
				$edges = layoutedEdges;

				updateLayout();
				window.requestAnimationFrame(() => fitView());
			}
		);
	}

	// Initial layout on mount
	onMount(() => {
		onLayout("DOWN", true);
	});

	function updateLayout() {
		let visibleNodes = $activeController.visibleNodes
			.split(",")
			.map((id) => id.trim());
		let fadedNodes = $activeController?.fadedNodes?.split(",").map((id) => id.trim());
		updateNodeVisibility(visibleNodes, fadedNodes);

		// Use fitView to fit the view to the visible nodes
		fitView({
			nodes: visibleNodes.map((id) => ({ id })), // Specify the nodes to zoom to by ID
			padding: 0.25,
			duration: 100
		});
	}

	// Update node visibility based on controller.visibleNodes
	$: if ($activeController) updateLayout();

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
				sourceIsFaded ||
				targetIsFaded ||
				visibleNodeIds?.includes(edge.source) ||
				visibleNodeIds?.includes(edge.target);
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
