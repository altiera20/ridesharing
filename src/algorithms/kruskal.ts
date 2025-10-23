// src/algorithms/kruskal.ts

interface Edge {
  u: string;
  v: string;
  weight: number;
}

interface KruskalOutput {
  mstEdges: Edge[];
  totalWeight: number;
}

class UnionFind {
  private parent: { [nodeId: string]: string };
  private rank: { [nodeId: string]: number };

  constructor(nodes: string[]) {
    this.parent = {};
    this.rank = {};
    for (const node of nodes) {
      this.parent[node] = node;
      this.rank[node] = 0;
    }
  }

  find(nodeId: string): string {
    if (this.parent[nodeId] === undefined) {
        this.parent[nodeId] = nodeId;
        this.rank[nodeId] = 0;
    }
    if (this.parent[nodeId] === nodeId) {
      return nodeId;
    }
    // Path compression
    this.parent[nodeId] = this.find(this.parent[nodeId]);
    return this.parent[nodeId];
  }

  union(nodeA: string, nodeB: string): boolean {
    const rootA = this.find(nodeA);
    const rootB = this.find(nodeB);

    if (rootA !== rootB) {
      // Union by rank
      if (this.rank[rootA] > this.rank[rootB]) {
        this.parent[rootB] = rootA;
      } else if (this.rank[rootA] < this.rank[rootB]) {
        this.parent[rootA] = rootB;
      } else {
        this.parent[rootB] = rootA;
        this.rank[rootA]++;
      }
      return true;
    }
    return false;
  }
}

export const kruskal = (nodes: string[], edges: Edge[]): KruskalOutput => {
  const mstEdges: Edge[] = [];
  let totalWeight = 0;

  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  const unionFind = new UnionFind(nodes);

  for (const edge of sortedEdges) {
    const { u, v, weight } = edge;
    if (unionFind.union(u, v)) {
      mstEdges.push(edge);
      totalWeight += weight;
    }
  }

  return { mstEdges, totalWeight };
};
