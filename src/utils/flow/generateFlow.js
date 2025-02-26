import generateTree from "./generateTree";
import generateLayout from "./generateLayout";

import nodes from "$data/nodes.csv";
import edges from "$data/links.csv";

export default async function generateFlow(s) {
	let treeKey = s.controller?.tree;
	if (!treeKey) return;

	let controllerLinks = s.controller?.links?.split(",");

	let treeEdges;
	let treeNodes;

	let isPacked = false;
	let method = "dagre";

	if (!controllerLinks) {
		if (s.controller.fitViewNodes) {
			treeNodes = nodes.filter((node) =>
				s.controller.fitViewNodes.split(",").includes(node.id)
			);
			treeEdges = []
		} else {
			return;
		}
	} else {
		if (controllerLinks[0] == treeKey) {
			treeEdges = edges.filter((edge) => edge.tree == treeKey);
			isPacked = true;
			// method = "elk";
			method = "dagreTwo";
			if(treeKey == "king_2") {
				method = "elkTwo";
			}
			// if(treeKey == "funky_3") {
			// 	method = "elk";
			// }

			// method = "dagreTwo";
		} else {
			let trueIds = controllerLinks.map((id) => `${id}-${treeKey}`);

			treeEdges = edges.filter((edge) => trueIds.includes(edge.true_id));
		}

		let treeNodeIds = treeEdges
			.map((edge) => [edge.start_node_id, edge.end_node_id])
			.flat();

		treeNodes = nodes.filter((node) => treeNodeIds.includes(node.id));
	}

	const tree = await generateTree({
		nodes: treeNodes,
		edges: treeEdges,
		treeKey
	});

	// if (!tree.nodes.length || !tree.edges.length) return;

	const layout = await generateLayout(tree.nodes, tree.edges, {
		isPacked,
		method,
		treeKey
	});

	return layout;
}
