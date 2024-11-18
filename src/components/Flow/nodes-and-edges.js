const position = { x: 0, y: 0 };

import nodes from "$data/nodes.csv";
import edges from "$data/links.csv";

const groupBy = function (xs, key) {
	return xs.reduce(function (rv, x) {
		(rv[x[key]] = rv[x[key]] || []).push(x);
		return rv;
	}, {});
};

const groupedNodes = groupBy(nodes, "tree");
const groupedEdges = groupBy(edges, "tree");

const nodeIds = groupedNodes["hit em up"].map((d) => d.id);
console.log(groupedNodes);
export const initialNodes = groupedNodes["hit em up"].map((d) => ({
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

export const initialEdges = groupedEdges["hit em up"]
	.filter((d) => !d.flag)
	.filter(
		(d) => nodeIds.includes(d.start_node_id) && nodeIds.includes(d.end_node_id)
	)
	.map((d) => ({
		id: `e-${d["end_node_id"]}-${d["start_node_id"]}`,
		source: d["end_node_id"],
		target: d["start_node_id"],
		type: d.type || "step"
	}));
