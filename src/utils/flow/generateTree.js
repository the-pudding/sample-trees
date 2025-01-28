export default async function generateTree({ nodes, edges, treeKey }) {
	const tree = {
		treeKey,
		nodes: nodes
			.filter((d) => !d.remove)
			.map((d) => ({
				id: d["id"],
				type: "custom",
				data: {
					title: d.title,
				label: d.title,
				release_date: d.release_date,
				featured_artists: d.featured_artists,
				primary_artist: d.primary_artist,
				id: d["id"],
				url: d.url,
				secondaryLabelConfig: d.secondaryLabelConfig
			},
			position: { x: 0, y: 0 }
		})),
		edges: edges
			// .filter((d) => !d.flag)
			.filter((d) => !d.remove)
			.map((d) => ({
				id: d["true_id"],
				source: d["end_node_id"],
				target: d["start_node_id"],
				type: "custom"
			}))
			.filter((d) => !d.id.includes("#N/A"))
	};

	return tree;
}
