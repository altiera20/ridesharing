// src/algorithms/dijkstra.ts

interface Edge {
  neighborId: string;
  weight: number;
}

interface Graph {
  [nodeId: string]: Edge[];
}

interface DijkstraOutput {
  distances: { [nodeId: string]: number };
  predecessors: { [nodeId: string]: string | null };
}

export const dijkstra = (graph: Graph, startNode: string): DijkstraOutput => {
  const distances: { [nodeId: string]: number } = {};
  const predecessors: { [nodeId: string]: string | null } = {};
  const visited: { [nodeId: string]: boolean } = {};

  // Initialize distances and predecessors
  for (const nodeId in graph) {
    distances[nodeId] = Infinity;
    predecessors[nodeId] = null;
  }
  distances[startNode] = 0;

  // Priority queue (min-heap) implementation
  const priorityQueue: { nodeId: string; distance: number }[] = [];
  priorityQueue.push({ nodeId: startNode, distance: 0 });

  while (priorityQueue.length > 0) {
    // Get node with smallest distance
    priorityQueue.sort((a, b) => a.distance - b.distance);
    const { nodeId: currentNodeId } = priorityQueue.shift()!;

    if (visited[currentNodeId]) {
      continue;
    }
    visited[currentNodeId] = true;

    if (!graph[currentNodeId]) {
      continue;
    }

    for (const { neighborId, weight } of graph[currentNodeId]) {
      const newDistance = distances[currentNodeId] + weight;
      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        predecessors[neighborId] = currentNodeId;
        priorityQueue.push({ nodeId: neighborId, distance: newDistance });
      }
    }
  }

  return { distances, predecessors };
};
