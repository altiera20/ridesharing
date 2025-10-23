
import React, { useMemo, useCallback } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// --- Component Props --- //
interface NodeMarkerProps {
  id: string;
  lat: number;
  lng: number;
  type: 'driver' | 'passenger';
  label?: string;
  popupContent?: React.ReactNode;
  onClick?: (id: string) => void;
  onMouseOver?: (id: string) => void;
  onMouseOut?: (id: string) => void;
  zIndexOffset?: number;
}

// --- Icon Creation Helper --- //
// This function builds a custom L.divIcon using inline SVG.
// Using inline SVG in a string is a reliable way to create custom, data-driven icons in Leaflet
// without needing external files or complex build steps.
const createVehicleIcon = (type: 'driver' | 'passenger', label: string) => {
  const color = type === 'driver' ? '#3B82F6' : '#16A34A'; // Tailwind's blue-500 and green-600
  const iconLabel = label.substring(0, 2).toUpperCase();

  // Simple SVG for a person icon (head and shoulders)
  const passengerSvg = '<circle cx="14" cy="11" r="4" fill="white" /><path d="M7,22 a1,1 0,0,1 14,0" fill="white" />';
  // Simple SVG for a car icon (top-down view)
  const driverSvg = '<path d="M7 10 L 21 10 L 23 14 L 21 18 L 7 18 L 5 14 Z" fill="white" />';

  const html = `
    <div style="position: relative; display: flex; justify-content: center; align-items: center; width: 28px; height: 28px;">
      <svg width="28" height="28" viewBox="0 0 28 28" style="position: absolute; top: 0; left: 0;">
        <circle cx="14" cy="14" r="14" fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="2" />
        ${type === 'driver' ? driverSvg : passengerSvg}
      </svg>
      <span style="color: white; font-size: 10px; font-weight: bold; z-index: 1; font-family: sans-serif;">
        ${iconLabel}
      </span>
    </div>`;

  return L.divIcon({
    html: html,
    className: 'custom-node-marker', // Use a class for potential global overrides, but styles are inline
    iconSize: [28, 28],
    iconAnchor: [14, 14], // Center of the icon
    popupAnchor: [0, -14] // Anchor popup just above the icon
  });
};

// --- Main Component --- //
const NodeMarker: React.FC<NodeMarkerProps> = ({
  id,
  lat,
  lng,
  type,
  label = id,
  popupContent,
  onClick,
  onMouseOver,
  onMouseOut,
  zIndexOffset,
}) => {

  // Memoize the icon creation to avoid re-computing on every render
  const icon = useMemo(() => createVehicleIcon(type, label), [type, label]);

  // Memoize event handlers
  const eventHandlers = useMemo(() => ({
    click: () => onClick?.(id),
    mouseover: () => onMouseOver?.(id),
    mouseout: () => onMouseOut?.(id),
  }), [id, onClick, onMouseOver, onMouseOut]);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={eventHandlers}
      zIndexOffset={zIndexOffset ?? (type === 'driver' ? 1000 : 0)}
    >
      {popupContent ? (
        <Popup>{popupContent}</Popup>
      ) : (
        <Popup>
          <div className="p-1">
            <h3 className="font-bold text-md">{label}</h3>
            <p className="text-gray-500 text-sm">ID: {id}</p>
            <p className="text-gray-500 text-sm">Type: {type}</p>
          </div>
        </Popup>
      )}
      <Tooltip>{label}</Tooltip>
    </Marker>
  );
};

export default React.memo(NodeMarker);
