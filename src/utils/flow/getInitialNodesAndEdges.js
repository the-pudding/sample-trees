import groupBy from "../groupBy";

const position = { x: 0, y: 0 };


import nodes from "$data/nodes.csv";
import edges from "$data/links.csv";


const groupedEdges = groupBy(edges, "tree");

const groupedNodes = {};

Object.keys(groupedEdges).forEach((key) => {
	let treeNodesIds = [];

	groupedEdges[key].forEach((edge) => {
		treeNodesIds.push(edge.start_node_id);
		treeNodesIds.push(edge.end_node_id);
	});

	groupedNodes[key] = nodes
		.filter((node) => treeNodesIds.includes(node.id))
		.map((d) => ({
			id: d["id"],
			type: "custom",
			data: {
				title: d.title,
				release_date: d.release_date,
				featured_artists: d.featured_artists,
				primary_artist: d.primary_artist,
				id: d["id"],
				url: d.url,
				secondaryLabelConfig: d.secondaryLabelConfig
			},
			position
		}));

	groupedEdges[key] = groupedEdges[key]
		.filter((d) => !d.flag)
		.map((d) => ({
			id: `e-${d["end_node_id"]}-${d["start_node_id"]}`,
			source: d["end_node_id"],
			target: d["start_node_id"],
			type: d.type || "step"
		}))
		.filter((d) => !d.id.includes("#N/A"));
});

/**
 * Function to get nodes and edges for a specific key
 * @param {string} key - The key to retrieve nodes and edges for
 * @returns {[Array, Array]} - An array containing initialNodes and initialEdges
 */
export default function getInitialNodesAndEdges(key) {
	const initialNodes = groupedNodes[key] || [];
	const initialEdges = groupedEdges[key] || [];
	return [initialNodes, initialEdges];
}
