import dagre from "@dagrejs/dagre";
import ELK from "elkjs/lib/elk.bundled.js";
import { get } from "svelte/store";

import viewport from "$stores/viewport.js";

import { Position } from "@xyflow/svelte";

// Function to generate the layout using Dagre or ELK
export default async function generateLayout(
  inputNodes,
  inputEdges,
  options = {}
) {
  const method = options?.["method"] || "dagre"; // Choose method: "dagre" or "elk"
  const direction = options?.["rankdir"] === "LR" ? "LR" : "TB"; // Layout direction
  const isPacked = options?.["isPacked"];
  const isHorizontal = direction === "LR";

  const textHeight = 30;
  const waveformHeight = 30;

  const nodeHeight = isPacked
    ? 20
    : Math.min(get(viewport).height / 2 - textHeight - waveformHeight, 260);
  const nodeWidth = isPacked ? 20 : nodeHeight * 0.75;

  if (method === "dagre") {
    // Dagre Layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Set graph direction
    dagreGraph.setGraph({ rankdir: direction });

    // Add nodes to the Dagre graph
    inputNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    // Add edges to the Dagre graph
    inputEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    try {
      // Perform the layout
      dagre.layout(dagreGraph);

      // Map the layouted graph back to the expected output format
      return {
        nodes: inputNodes.map((node) => {
          const dagreNode = dagreGraph.node(node.id);
          return {
            ...node,
            position: {
              x: dagreNode.x - nodeWidth / 2, // Adjust position for top-left anchor
              y: dagreNode.y - nodeHeight / 2,
            },
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          };
        }),
        edges: inputEdges,
      };
    } catch (error) {
      console.error("Error during Dagre layout:", error);
      return null;
    }
  } else if (method === "elk") {
    // ELK Layout
    const elk = new ELK();
    const elkOptions = {
      "elk.direction": "RIGHT",
      "elk.algorithm": "box"
    };

    const graph = {
      id: "root",
      layoutOptions: elkOptions,
      children: inputNodes.map((node) => ({
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        width: nodeWidth,
        height: nodeHeight,
      })),
      edges: inputEdges,
    };

    try {
      const layoutedGraph = await elk.layout(graph);

      return {
        nodes: layoutedGraph.children.map((node) => ({
          ...node,
          position: { x: node.x, y: node.y },
        })),
        edges: layoutedGraph.edges,
      };
    } catch (error) {
      console.error("Error during ELK layout:", error);
      return null;
    }
  } else {
    console.error(`Unsupported layout method: ${method}`);
    return null;
  }
}
