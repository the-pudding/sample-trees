import dagre from "@dagrejs/dagre";
import ELK from "elkjs/lib/elk.bundled.js";
import { get } from "svelte/store";
import * as d3 from 'd3';

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
    ? 50
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
    const maxCircleSize = 30;
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
        width:+node.id == 233667 ? circleSize*2 : circleSize,
        height: +node.id == 233667 ? circleSize*2 : circleSize,
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
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            data: {
              ...node.data,
              circleSize: dagreNode.width
            }
          };
        }),
        edges: inputEdges.map(edge => ({
          ...edge,
          data: {
            ...edge.data,
            method: method  // Add method to edge data
          },
          type: "smoothstep"
        }))

        // edges: inputEdges
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
    dagreGraph.setGraph({ 
      rankdir: direction,
      // ranksep: 1,
    });

    // Add nodes to the Dagre graph
    inputNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });


    // Add edges to the Dagre graph
    // inputEdges.forEach((edge) => {
    //   dagreGraph.setEdge(edge.source, edge.target);
    // });

    // Set edge type to 'step' for each edge
    inputEdges.forEach((edge) => {
      // edge.type = 'step';
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
    const elk = new ELK();
    
    // Increase padding to give more room around edges
    const padding = 5;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - padding * 2;

    const isDesktop = availableWidth / availableHeight > 1.2;

    // Count nodes per level
    const levels = new Map();
    const nodeMap = new Map();
    inputNodes.forEach(node => nodeMap.set(node.id, { level: 0 }));
    
    // Calculate levels
    inputEdges.forEach(edge => {
      const targetNode = nodeMap.get(edge.target);
      const sourceNode = nodeMap.get(edge.source);
      if (targetNode && sourceNode) {
        targetNode.level = sourceNode.level + 1;
      }
    });

    nodeMap.forEach(node => {
      if (!levels.has(node.level)) {
        levels.set(node.level, 0);
      }
      levels.set(node.level, levels.get(node.level) + 1);
    });

    const maxNodesInLevel = Math.max(...levels.values());
    const numLevels = levels.size;

    // Calculate larger node dimensions
    const maxNodeWidth = Math.floor(availableWidth / (maxNodesInLevel));  // Removed +1 to allow larger nodes
    const maxNodeHeight = Math.floor(availableHeight / (numLevels));      // Removed +1 to allow larger nodes
    
    console.log(maxNodesInLevel)


    // Increase maximum node size by using a larger fraction of screen
    let nodeSize = Math.min(
      maxNodeWidth,
      maxNodeHeight,
      Math.min(availableWidth, availableHeight) / 2  // Changed from /3 to /2 for larger nodes
    );

    nodeSize = 30;

    const nodeWidth = nodeSize;
    const nodeHeight = nodeSize;

    const baseNodeSpacing = isDesktop ? nodeSize*4 : nodeSize*2;//60 : 60;
    const baseLayerSpacing = isDesktop ? 250 : 200;
    const horizontalModifier = isDesktop ? 1.5 : 1.0;


    // Very small spacing to keep nodes close together
    // const baseNodeSpacing = nodeSize * 0.05;    // 5% of node size
    // const baseLayerSpacing = nodeSize * 0.05;   // 5% of node size

    const elkOptions = {
      "elk.direction": direction === "TB" ? "DOWN" : "RIGHT",
      "elk.algorithm": "layered",
      "elk.spacing.nodeNode": baseNodeSpacing * horizontalModifier,
      "elk.spacing.componentComponent": baseNodeSpacing,
      "elk.layered.spacing.nodeNodeBetweenLayers": baseLayerSpacing,
      "elk.layered.spacing.edgeNodeBetweenLayers": baseLayerSpacing * 0.1,  // Reduced to 10% for shorter edges
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
      "elk.aspectRatio": isDesktop 
        ? (availableWidth * 0.85) / availableHeight  // Use more width on desktop
        : (availableWidth * 0.7) / availableHeight,
      "elk.padding": `[top=${padding}, left=${padding}, bottom=${padding}, right=${padding}]`,
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
        width:+node.id == 233667 ? nodeWidth*2 : nodeWidth,
        height: +node.id == 233667 ? nodeHeight*2 : nodeHeight,
      })),
      edges: inputEdges
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

      // console.log(layoutedGraph.children)

      return {
        nodes: layoutedGraph.children.map((node) => ({
          ...node,
          position: {
            x: node.x * scale + xOffset,
            y: node.y * scale + yOffset,
          },
          targetPosition: isHorizontal ? Position.Left : Position.Top,
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          type: 'simple',
          data: {
            ...node.data,
            circleSize: node.width
          }
        })),
        edges: layoutedGraph.edges.map(edge => ({
          ...edge,
          data: {
            ...edge.data,
            method: method  // Add method to edge data
          },
          type: "bezier"
        }))
      };
    } catch (error) {
      console.error("Error during ELK layout:", error);
      return null;
    }
  }
  else if (method === "elkTwo") {
    // Convert nodes and edges to hierarchical structure for d3
    const nodeMap = new Map(inputNodes.map(node => [node.id, { 
      ...node, 
      children: [] 
    }]));
    
    // Build tree structure
    inputEdges.forEach(edge => {
      const parent = nodeMap.get(edge.source);
      const child = nodeMap.get(edge.target);
      if (parent && child) {
        parent.children.push(child);
      }
    });

    // Find root nodes (nodes with no incoming edges)
    const roots = inputNodes.filter(node => 
      !inputEdges.some(edge => edge.target === node.id)
    );

    // Create hierarchy
    const root = {
      id: 'virtual-root',
      children: roots.map(r => nodeMap.get(r.id))
    };

    const padding = 40;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - padding * 2;
    const radius = Math.min(availableWidth, availableHeight) / 2;

    // Create cluster layout
    const cluster = d3.cluster()
      .size([360, radius - 100])  // 360 degrees, radius minus padding
      .separation((a, b) => (a.parent == b.parent ? 1 : 2));

    // Generate the layout
    const hierarchy = d3.hierarchy(root);
    const layout = cluster(hierarchy);

    // Convert polar coordinates to Cartesian
    const nodes = layout.descendants().slice(1); // Skip virtual root
    const positions = new Map();

    nodes.forEach(node => {
      const angle = (node.x - 90) / 180 * Math.PI; // Convert to radians, rotate to start from top
      const x = node.y * Math.cos(angle);
      const y = node.y * Math.sin(angle);
      positions.set(node.data.id, {
        x: x + availableWidth / 2,  // Center in available space
        y: y + availableHeight / 2
      });
    });

    try {
      return {
        nodes: inputNodes.map(node => {
          const position = positions.get(node.id);
          return {
            ...node,
            type: 'simple',
            position: position,
            targetPosition: Position.Left,
            sourcePosition: Position.Left,
            data: {
              ...node.data,
              circleSize: 20
            }
          };
        }),
        edges: inputEdges.map(edge => ({
          ...edge,
          type: 'simple'  // Specify simple edge type for elkTwo
        }))
      };
    } catch (error) {
      console.error("Error during radial layout:", error);
      return null;
    }
  }
   else {
    console.error(`Unsupported layout method: ${method}`);
    return null;
  }
}
