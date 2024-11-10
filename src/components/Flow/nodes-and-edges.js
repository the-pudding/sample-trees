const position = { x: 0, y: 0 };

import nodes from "$data/nodes.csv";
import edges from "$data/links.csv";

export const initialNodes = nodes.map((d) => ({
	id: d["~id"],
	type: "custom",
	data: {
		title: d.title,
		release_date: d.release_date,
		featured_artists: d.featured_artists,
		primary_artist: d.primary_artist,
		id: d["~id"],
		url: d.url
	},
	position
}));

export const initialEdges = edges
	.filter((d) => !d.flag)
	.map((d) => ({
		id: `e-${d["~end_node_id"]}-${d["~start_node_id"]}`,
		source: d["~end_node_id"],
		target: d["~start_node_id"],
		type: d.type || "step"
	}));