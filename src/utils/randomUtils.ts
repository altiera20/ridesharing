
// --- Type Definitions --- //

interface Node {
  id: string;
  lat: number;
  lng: number;
}

interface Bounds {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

// --- Exported Functions --- //

/**
 * Generates a random floating-point number within a specified range.
 * @param min The minimum value of the range (inclusive).
 * @param max The maximum value of the range (exclusive).
 * @returns A random number between min and max.
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generates an array of random nodes of a specific type within given boundaries.
 * @param count The number of nodes to generate.
 * @param type The type of nodes ('driver' or 'passenger').
 * @param bounds The geographical boundaries for node generation.
 * @returns An array of generated nodes.
 */
export function generateRandomNodes(
  count: number,
  type: 'driver' | 'passenger',
  bounds: Bounds = { 
    latMin: 10.75,  // Slightly north of Trichy
    latMax: 10.85,  // Slightly south of Trichy
    lngMin: 78.65,  // Slightly west of Trichy
    lngMax: 78.75   // Slightly east of Trichy
  }
): Array<Node & { type: 'driver' | 'passenger' }> {
  const nodes: Array<Node & { type: 'driver' | 'passenger' }> = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `${type}-${i}`,
      lat: randomInRange(bounds.latMin, bounds.latMax),
      lng: randomInRange(bounds.lngMin, bounds.lngMax),
      type: type,
    });
  }
  return nodes;
}

/**
 * A convenience function to generate new sets of both drivers and passengers.
 * This can be called from a UI component like ControlPanel when a slider changes
 * or a 'Regenerate' button is clicked.
 * 
 * Example in a React component:
 * const { setDrivers, setPassengers } = useAppContext();
 * const handleRegenerate = () => {
 *   const { drivers, passengers } = regenerateDriversAndPassengers(10, 20);
 *   setDrivers(drivers);
 *   setPassengers(passengers);
 * };
 */
export function regenerateDriversAndPassengers(
  driverCount: number,
  passengerCount: number,
  bounds?: Bounds
): { drivers: Node[]; passengers: Node[] } {
  const drivers = generateRandomNodes(driverCount, 'driver', bounds).map(({ id, lat, lng }) => ({ id, lat, lng }));
  const passengers = generateRandomNodes(passengerCount, 'passenger', bounds).map(({ id, lat, lng }) => ({ id, lat, lng }));
  return { drivers, passengers };
}
