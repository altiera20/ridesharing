
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L, { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Predefined color palette for drivers - each color is distinct and vibrant
const DRIVER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
  '#E63946', // Crimson
  '#06FFA5', // Bright Green
];

// Get a color for a driver based on their ID
const getDriverColor = (driverId: string, index: number): string => {
  // Use index for color selection to ensure sequential different colors
  return DRIVER_COLORS[index % DRIVER_COLORS.length];
};

// Prop types
interface Node {
  id: string;
  lat: number;
  lng: number;
}

interface Assignment {
  driver: string;
  passenger: string;
}

interface MstEdge {
  u: string;
  v: string;
  weight: number;
}

interface MapViewProps {
  drivers: Node[];
  passengers: Node[];
  assignments: Assignment[];
  mstEdges: MstEdge[];
}

// Custom colored markers
const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to auto-fit map bounds when there are nodes
const AutoFitBounds: React.FC<{ bounds: LatLngBounds }> = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    // Only fit bounds if there are actual nodes
    if (bounds.isValid() && !bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ drivers, passengers, assignments, mstEdges }) => {
  const allNodes = [...drivers, ...passengers];
  const nodeMap = new Map(allNodes.map(node => [node.id, node]));

  // Tiruchirappalli (Trichy) coordinates
  const trichyCenter: [number, number] = [10.7905, 78.7047];
  
  // Only create bounds if we have nodes
  const bounds = allNodes.length > 0 
    ? new LatLngBounds(allNodes.map(node => [node.lat, node.lng]))
    : new LatLngBounds([trichyCenter]);

  // Generate colors for each driver using index-based selection
  const driverColors = useMemo(() => {
    const colors = new Map<string, string>();
    const uniqueDrivers = Array.from(new Set(assignments.map(a => a.driver)));
    
    uniqueDrivers.forEach((driverId, index) => {
      colors.set(driverId, getDriverColor(driverId, index));
    });
    
    return colors;
  }, [assignments]);

  return (
    <MapContainer 
      center={trichyCenter} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {allNodes.length > 0 && <AutoFitBounds bounds={bounds} />}

      {/* Driver Markers */}
      {drivers.map(driver => (
        <Marker key={`driver-${driver.id}`} position={[driver.lat, driver.lng]} icon={blueIcon} />
      ))}

      {/* Passenger Markers */}
      {passengers.map(passenger => (
        <Marker key={`passenger-${passenger.id}`} position={[passenger.lat, passenger.lng]} icon={greenIcon} />
      ))}

      {/* Assignment Polylines - Each driver gets a unique color */}
      {(() => {
        // Create a mapping of drivers to colors outside the map
        const uniqueDrivers = Array.from(new Set(assignments.map(a => a.driver)));
        const driverToColor = new Map<string, string>();
        uniqueDrivers.forEach((driverId, idx) => {
          driverToColor.set(driverId, DRIVER_COLORS[idx % DRIVER_COLORS.length]);
        });
        
        return assignments.map((assignment, index) => {
          const driverNode = nodeMap.get(assignment.driver);
          const passengerNode = nodeMap.get(assignment.passenger);
          const color = driverToColor.get(assignment.driver) || '#FF0000';
          
          if (driverNode && passengerNode) {
            return (
              <Polyline
                key={`assignment-${assignment.driver}-${assignment.passenger}`}
                positions={[[driverNode.lat, driverNode.lng], [passengerNode.lat, passengerNode.lng]]}
                pathOptions={{
                  color: color,
                  weight: 5,
                  opacity: 0.9,
                }}
              />
            );
          }
          return null;
        });
      })()}

      {/* MST Edge Polylines */}
      {mstEdges.map((edge, index) => {
        const uNode = nodeMap.get(edge.u);
        const vNode = nodeMap.get(edge.v);
        if (uNode && vNode) {
          return (
            <Polyline
              key={`mst-${index}`}
              positions={[[uNode.lat, uNode.lng], [vNode.lat, vNode.lng]]}
              color="crimson"
              weight={5}
              opacity={0.7}
            />
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default MapView;
