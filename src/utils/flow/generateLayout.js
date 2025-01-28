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
    const method = options?.["method"] || "dagre";
    const direction = "TB";
    const isHorizontal = false;
  
    const viewportWidth = get(viewport).width;
    const viewportHeight = get(viewport).height;
  
    // Slightly larger circles for better visibility
    const circleSize = 20;
    const minSpacing = 30;
    
    // Calculate tree structure
    const nodeMap = new Map(inputNodes.map(node => [node.id, { ...node, children: [] }]));
    const rootNodes = new Set(inputNodes.map(node => node.id));
    
    inputEdges.forEach(edge => {
      rootNodes.delete(edge.target);
      const parentNode = nodeMap.get(edge.source);
      if (parentNode) {
        parentNode.children.push(edge.target);
      }
    });
  
    // Calculate tree depth and width at each level
    let maxWidth = 0;
    let maxDepth = 0;
    const levels = new Map();
    
    function traverseTree(nodeId, level = 0) {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      
      maxDepth = Math.max(maxDepth, level);
      
      if (!levels.has(level)) {
        levels.set(level, 0);
      }
      levels.set(level, levels.get(level) + 1);
      maxWidth = Math.max(maxWidth, levels.get(level));
      
      node.children.forEach(childId => traverseTree(childId, level + 1));
    }
    
    [...rootNodes].forEach(rootId => traverseTree(rootId));
  
    // Calculate spacing to fill viewport height
    const availableHeight = viewportHeight - 100; // Subtract padding
    const availableWidth = viewportWidth - 100;
    
    // Calculate ranksep to distribute nodes vertically
    const ranksep = Math.max(
      minSpacing,
      (availableHeight / maxDepth) - circleSize
    );
    
    // Calculate nodesep based on width
    const nodesep = Math.max(
      minSpacing,
      Math.min(80, availableWidth / maxWidth - circleSize)
    );
  
    const nodeHeight = circleSize;
    const nodeWidth = circleSize;
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ 
      rankdir: direction,
      nodesep: nodesep,
      ranksep: ranksep,
      align: 'UL',
      ranker: 'network-simplex', // Changed back to network-simplex for better distribution
      marginx: 40,
      marginy: 40
    });

    inputNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    inputEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target, { weight: 1 });
    });

    try {
      dagre.layout(dagreGraph);

      const graphWidth = dagreGraph.graph().width || 0;
      const graphHeight = dagreGraph.graph().height || 0;
      
      // Calculate scaling to fit viewport while maintaining aspect ratio
      const scaleX = graphWidth > availableWidth ? availableWidth / graphWidth : 1;
      const scaleY = graphHeight > availableHeight ? availableHeight / graphHeight : 1;
      const scale = Math.min(scaleX, scaleY);

      // Center the graph
      const xOffset = (viewportWidth - graphWidth * scale) / 2;
      const yOffset = (viewportHeight - graphHeight * scale) / 2;
      
      return {
        nodes: inputNodes.map((node) => {
          const dagreNode = dagreGraph.node(node.id);
          return {
            ...node,
            type: 'simple',  // Set node type to simple
            position: {
              x: dagreNode.x * scale + xOffset,
              y: dagreNode.y * scale + yOffset,
            },
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
          };
        }),
        edges: inputEdges,
      };
    } catch (error) {
      console.error("Error during Dagre layout:", error);
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
