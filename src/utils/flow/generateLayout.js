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

    // Use minimal padding
    const padding = 20;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - padding * 2;

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

    // Calculate tree depth and width
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

    // Adjust circle size to be slightly smaller
    const maxCircleSize = 20;
    const minCircleSize = 12;

    // const circleSize = 1;
    const circleSize = Math.max(
      minCircleSize,
      Math.min(maxCircleSize, availableHeight / (maxDepth + 1) / 4)
    );

    // Calculate spacings to fill width and height
    const verticalSpacing = Math.max(
      circleSize * 3,
      (availableHeight - (maxDepth + 1) * circleSize) / (maxDepth * 0.7)
    );

    // Increase horizontal spacing to fill width
    const minHorizontalSpacing = circleSize * 2;
    const desiredWidth = availableWidth * 0.95; // Use more width
    const horizontalSpacing = Math.max(
      minHorizontalSpacing,
      // Distribute nodes evenly across available width
      (desiredWidth - (maxWidth * circleSize)) / Math.max(1, maxWidth - 1)
    );

    dagreGraph.setGraph({ 
      rankdir: 'TB',
      nodesep: horizontalSpacing,
      ranksep: verticalSpacing,
      marginx: padding,
      marginy: padding * 2,
      ranker: 'network-simplex', // Changed to network-simplex for better distribution
      align: 'UL', // Changed to UL for better width distribution
      acyclicer: 'greedy'
    });

    // Add nodes with calculated dimensions
    inputNodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: circleSize,
        height: circleSize,
        level: nodeMap.get(node.id).level
      });
    });

    inputEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
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

      const graphWidth = maxX - minX + circleSize;
      const graphHeight = maxY - minY + circleSize;

      // Adjust scaling to use full width
      const scaleX = availableWidth / graphWidth;
      const scaleY = (availableHeight * 1.1) / graphHeight;
      
      // Prioritize width filling while maintaining aspect ratio
      const scale = Math.min(scaleX * 0.95, scaleY * 0.8);
      
      // Center the graph horizontally
      const xOffset = (viewportWidth - (graphWidth * scale)) / 2;
      const yOffset = padding / 2;

      return {
        nodes: inputNodes.map(node => {
          const dagreNode = dagreGraph.node(node.id);
          const level = nodeMap.get(node.id).level;
          const nodesInLevel = levels.get(level);
          
          const x = (dagreNode.x - minX) * scale + xOffset;
          const y = (dagreNode.y - minY) * (scaleY * 0.9) + yOffset;

          return {
            ...node,
            type: 'simple',
            position: { x, y },
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            data: {
              ...node.data,
              circleSize: circleSize  // Pass the size through data
            }
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
    
    const padding = 5;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - padding * 2;

    // Calculate aspect ratio to determine if we're in desktop mode
    const isDesktop = availableWidth / availableHeight > 1.2;

    // Adjust spacing based on aspect ratio
    const baseNodeSpacing = isDesktop ? 60 : 40;
    const baseLayerSpacing = isDesktop ? 250 : 200;
    const horizontalModifier = isDesktop ? 1.5 : 1.0;

    const elkOptions = {
      "elk.direction": direction === "TB" ? "DOWN" : "RIGHT",
      "elk.algorithm": "layered",
      // Adjust spacing based on screen shape
      "elk.spacing.nodeNode": baseNodeSpacing * horizontalModifier,  // More horizontal space on desktop
      "elk.spacing.componentComponent": baseNodeSpacing,
      "elk.layered.spacing.nodeNodeBetweenLayers": baseLayerSpacing,
      "elk.layered.spacing.edgeNodeBetweenLayers": baseLayerSpacing * 0.5,
      // Layout options
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
      // Adjust aspect ratio based on screen shape
      "elk.aspectRatio": isDesktop 
        ? (availableWidth * 0.85) / availableHeight  // Use more width on desktop
        : (availableWidth * 0.7) / availableHeight,
      "elk.padding": `[top=${padding}, left=${padding}, bottom=${padding}, right=${padding}]`,
      // Additional spacing options
      "elk.layered.spacing.baseValue": isDesktop ? 120 : 100,
      "elk.layered.considerModelOrder": true,
      "elk.layered.spacing.modifier": isDesktop ? 1.2 : 1.0
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

      // Calculate bounds
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

      // Adjust scaling based on aspect ratio
      const scaleX = availableWidth / graphWidth;
      const scaleY = (availableHeight * 1.1) / graphHeight;
      
      // Different scaling for desktop vs mobile
      const scale = isDesktop
        ? Math.min(scaleX * 0.95, scaleY * 0.85)  // More horizontal spread on desktop
        : Math.min(scaleX, scaleY * 0.9);

      const xOffset = (viewportWidth - graphWidth * scale) / 2;
      const yOffset = padding * 2;

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
