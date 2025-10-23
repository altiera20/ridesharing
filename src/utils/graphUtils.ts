
// --- Type Definitions --- //

interface Node {
  id: string;
  lat: number;
  lng: number;
}

interface BuildCostMatrixOptions {
  method?: 'euclidean' | 'haversine';
  timePerKm?: number;
}

// --- Distance Functions --- //

/**
 * Calculates the distance between two points using the Haversine formula.
 * @param lat1 Latitude of the first point.
 * @param lng1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lng2 Longitude of the second point.
 * @returns The distance in kilometers.
 * @example haversineDistance(40.7128, -74.0060, 34.0522, -118.2437) // ~3935 km
 */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  // Haversine formula: a = sin²(Δφ/2) + cos(φ1)⋅cos(φ2)⋅sin²(Δλ/2)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  // Central angle: c = 2⋅atan2(√a, √(1−a))
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance: d = R⋅c
  return R * c;
}

/**
 * Calculates the simple Euclidean distance between two coordinate pairs.
 * Useful for synthetic maps where lat/lng are treated as cartesian coordinates.
 * @returns The unitless distance in coordinate space.
 * @example euclideanDistance(0, 0, 3, 4) // 5
 */
export function euclideanDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const deltaLat = lat2 - lat1;
  const deltaLng = lng2 - lng1;
  return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
}

// --- Cost Matrix & Assignment Helpers --- //

/**
 * Builds a cost matrix for assigning drivers to passengers.
 * @param drivers Array of driver nodes.
 * @param passengers Array of passenger nodes.
 * @param options Configuration for distance calculation.
 * @returns An object containing the cost matrix and a flat list of all possible pairs.
 */
export function buildCostMatrix(
  drivers: Node[],
  passengers: Node[],
  options: BuildCostMatrixOptions = {}
): { matrix: number[][]; pairs: Array<{ driverId: string; passengerId: string; cost: number }> } {
  const { method = 'euclidean', timePerKm = 2 } = options;
  const distanceFunc = method === 'haversine' ? haversineDistance : euclideanDistance;

  const matrix: number[][] = [];
  const pairs: Array<{ driverId: string; passengerId: string; cost: number }> = [];

  drivers.forEach((driver) => {
    const row: number[] = [];
    passengers.forEach((passenger) => {
      const distance = distanceFunc(driver.lat, driver.lng, passenger.lat, passenger.lng);
      const cost = distance * timePerKm;
      row.push(cost);
      pairs.push({ driverId: driver.id, passengerId: passenger.id, cost });
    });
    matrix.push(row);
  });

  return { matrix, pairs };
}

/**
 * Calculates the total travel time for a naive 1-to-1 assignment.
 * Assigns driver[i] to passenger[i].
 * @returns The total summed cost.
 */
export function sumNaiveAssignments(
  drivers: Node[],
  passengers: Node[],
  method: 'euclidean' | 'haversine' = 'euclidean'
): number {
  const timePerKm = 2;
  const distanceFunc = method === 'haversine' ? haversineDistance : euclideanDistance;
  let totalCost = 0;

  const assignmentCount = Math.min(drivers.length, passengers.length);

  for (let i = 0; i < assignmentCount; i++) {
    const driver = drivers[i];
    const passenger = passengers[i];
    const distance = distanceFunc(driver.lat, driver.lng, passenger.lat, passenger.lng);
    totalCost += distance * timePerKm;
  }

  return totalCost;
}
