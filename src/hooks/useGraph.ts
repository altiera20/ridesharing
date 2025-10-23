
import { useState, useCallback, useEffect, useMemo } from 'react';
import { dijkstra } from '../algorithms/dijkstra';
import { hungarian } from '../algorithms/hungarian';
import { kruskal } from '../algorithms/kruskal';

// --- Type Definitions --- //

interface Node {
  id: string;
  lat: number;
  lng: number;
}

interface UseGraphOptions {
  autoRun?: boolean;
}

interface UseGraphResult {
  costMatrix: number[][];
  assignments: Array<{ driverId: string; passengerId: string; cost: number }>;
  totalNaiveTime: number;
  totalAssignedTime: number;
  mstEdges: Array<{ u: string; v: string; weight: number }>;
  totalMSTWeight: number;
  run: () => void;
  lastUpdated: number;
  isCalculating: boolean;
}

// --- Helper Functions --- //

/**
 * Calculates the Haversine distance between two points on Earth.
 * @returns Distance in kilometers.
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const KM_TO_MINUTES_FACTOR = 2.0;
const distanceToTime = (distanceInKm: number) => distanceInKm * KM_TO_MINUTES_FACTOR;

// --- The Custom Hook --- //

export default function useGraph(
  drivers: Node[],
  passengers: Node[],
  options: UseGraphOptions = {}
): UseGraphResult {
  const { autoRun = false } = options;

  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [result, setResult] = useState<Omit<UseGraphResult, 'run' | 'lastUpdated' | 'isCalculating'>>({
    costMatrix: [],
    assignments: [],
    totalNaiveTime: 0,
    totalAssignedTime: 0,
    mstEdges: [],
    totalMSTWeight: 0,
  });

  const run = useCallback(async () => {
    if (drivers.length === 0 || passengers.length === 0) return;

    setIsCalculating(true);

    // --- Step 1: Build Cost Matrix ---
    // Calculate travel time (cost) between every driver and passenger.
    const costMatrix = drivers.map(driver =>
      passengers.map(passenger => {
        const dist = haversineDistance(driver.lat, driver.lng, passenger.lat, passenger.lng);
        return distanceToTime(dist);
      })
    );

    // --- Step 2: Calculate Naive Total Time ---
    // A simple 1-to-1 assignment for comparison.
    let totalNaiveTime = 0;
    const naiveCount = Math.min(drivers.length, passengers.length);
    for (let i = 0; i < naiveCount; i++) {
      totalNaiveTime += costMatrix[i][i];
    }

    // --- Step 3: Run Hungarian Algorithm for Optimal Assignment ---
    const { assignments: assignedIndices, totalCost: totalAssignedTime } = hungarian(costMatrix);
    const assignments = assignedIndices.map(({ driver, passenger }) => ({
      driverId: drivers[driver].id,
      passengerId: passengers[passenger].id,
      cost: costMatrix[driver][passenger],
    }));

    // --- Step 4: Run Kruskal's MST on the graph of all nodes ---
    // This shows the most efficient "backbone" network structure between all entities.
    const allNodes = [...drivers, ...passengers];
    const allNodeIds = allNodes.map(n => n.id);
    const allEdges = [];
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const u = allNodes[i];
        const v = allNodes[j];
        const weight = distanceToTime(haversineDistance(u.lat, u.lng, v.lat, v.lng));
        allEdges.push({ u: u.id, v: v.id, weight });
      }
    }
    const { mstEdges, totalWeight: totalMSTWeight } = kruskal(allNodeIds, allEdges);

    // --- Step 5: Update State ---
    setResult({
      costMatrix,
      assignments,
      totalNaiveTime,
      totalAssignedTime,
      mstEdges,
      totalMSTWeight,
    });
    setLastUpdated(Date.now());
    setIsCalculating(false);

  }, [drivers, passengers]);

  // Effect to trigger autorun when inputs change
  useEffect(() => {
    if (autoRun) {
      run();
    }
  }, [run, autoRun]);

  return useMemo(() => ({
    ...result,
    run,
    lastUpdated,
    isCalculating,
  }), [result, run, lastUpdated, isCalculating]);
}
