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

  const viewportWidth = get(viewport).width;
  const viewportHeight = get(viewport).height;

  if (method === "dagreTwo") {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Calculate optimal spacing based on viewport and number of nodes
    const padding = 80;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - padding * 2;

    // Estimate the tree depth and max width
    const nodeMap = new Map();
    const levels = new Map();
    let maxLevel = 0;

    // Build node map and find roots
    inputNodes.forEach(node => nodeMap.set(node.id, { ...node, level: 0, children: [] }));
    inputEdges.forEach(edge => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (source && target) {
        source.children.push(target);
      }
    });

    // Calculate levels
    function assignLevels(node, level = 0) {
      const nodeData = nodeMap.get(node.id);
      nodeData.level = level;
      maxLevel = Math.max(maxLevel, level);
      
      if (!levels.has(level)) {
        levels.set(level, 0);
      }
      levels.set(level, levels.get(level) + 1);

      const children = nodeData.children || [];
      children.forEach(child => assignLevels(child, level + 1));
    }

    // Find root nodes and assign levels
    const roots = inputNodes.filter(node => 
      !inputEdges.some(edge => edge.target === node.id)
    );
    roots.forEach(root => assignLevels(root));

    // Calculate optimal spacing
    const maxNodesInLevel = Math.max(...Array.from(levels.values()));
    const verticalSpacing = Math.min(100, availableHeight / (maxLevel + 1));
    const horizontalSpacing = Math.min(120, availableWidth / maxNodesInLevel);

    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: horizontalSpacing,
      ranksep: verticalSpacing,
      marginx: padding,
      marginy: padding,
      ranker: 'network-simplex',
      align: 'DL'
    });

    // Add nodes and edges
    inputNodes.forEach(node => {
      dagreGraph.setNode(node.id, { 
        width: nodeWidth,
        height: nodeHeight,
        level: nodeMap.get(node.id).level
      });
    });

    inputEdges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target, { weight: 1 });
    });

    try {
      dagre.layout(dagreGraph);

      // Calculate bounds
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      inputNodes.forEach(node => {
        const dagreNode = dagreGraph.node(node.id);
        minX = Math.min(minX, dagreNode.x);
        maxX = Math.max(maxX, dagreNode.x);
        minY = Math.min(minY, dagreNode.y);
        maxY = Math.max(maxY, dagreNode.y);
      });

      const graphWidth = maxX - minX + nodeWidth;
      const graphHeight = maxY - minY + nodeHeight;

      // Calculate scaling to fit viewport
      const scaleX = availableWidth / graphWidth;
      const scaleY = availableHeight / graphHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Limit scale to 1 to prevent too large nodes

      // Center the graph
      const xOffset = (viewportWidth - graphWidth * scale) / 2;
      const yOffset = (viewportHeight - graphHeight * scale) / 2;

      return {
        nodes: inputNodes.map(node => {
          const dagreNode = dagreGraph.node(node.id);
          return {
            ...node,
            position: {
              x: (dagreNode.x - minX) * scale + xOffset,
              y: (dagreNode.y - minY) * scale + yOffset
            },
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom
          };
        }),
        edges: inputEdges
      };
    } catch (error) {
      console.error("Error during DagreTwo layout:", error);
      return null;
    }
  } else if (method === "dagre") {
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
    
    // Calculate padding
    const padding = 100;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - padding * 2;

    const elkOptions = {
      "elk.direction": direction === "TB" ? "DOWN" : "RIGHT",
      "elk.algorithm": "layered",
      "elk.spacing.nodeNode": 50,
      "elk.spacing.componentComponent": 50,
      "elk.layered.spacing.nodeNodeBetweenLayers": 100,
      "elk.layered.spacing.edgeNodeBetweenLayers": 50,
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
      "elk.aspectRatio": availableWidth / availableHeight,
      "elk.padding": `[top=${padding}, left=${padding}, bottom=${padding}, right=${padding}]`
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

      // Calculate graph bounds
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      
      layoutedGraph.children.forEach(node => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x + node.width);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y + node.height);
      });

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      // Calculate scaling to fit viewport
      const scaleX = availableWidth / graphWidth;
      const scaleY = availableHeight / graphHeight;
      const scale = Math.min(scaleX, scaleY);

      // Calculate centering offsets
      const xOffset = (viewportWidth - graphWidth * scale) / 2;
      const yOffset = (viewportHeight - graphHeight * scale) / 2;

      return {
        nodes: layoutedGraph.children.map((node) => ({
          ...node,
          position: {
            x: node.x * scale + xOffset,
            y: node.y * scale + yOffset,
          },
          targetPosition: isHorizontal ? Position.Left : Position.Top,
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
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
