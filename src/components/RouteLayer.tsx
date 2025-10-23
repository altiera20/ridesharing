
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { LatLngExpression, PathOptions } from 'leaflet';

// Generate a consistent color from a string (driverId)
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a color with good contrast and saturation
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 80%, 50%)`;
};

// Generate a slightly darker color for the line
const darkenColor = (color: string, amount: number): string => {
  // Simple implementation for HSL colors
  if (color.startsWith('hsl')) {
    const [h, s, l] = color.match(/\d+/g)!.map(Number);
    return `hsl(${h}, ${s}%, ${Math.max(30, l - amount)}%)`;
  }
  return color;
};

// --- Prop Types --- //

interface Line {
  id: string;
  coords: [number, number][];
}

export interface AssignmentLine extends Line {
  driverId: string;
  passengerId: string;
  cost: number;
}

export interface MstLine extends Line {
  u: string;
  v: string;
  weight: number;
}

interface RouteLayerProps {
  assignmentLines: AssignmentLine[];
  mstLines: MstLine[];
  showAssignments?: boolean;
  showMST?: boolean;
  assignmentOptions?: PathOptions;
  mstOptions?: PathOptions;
  onSegmentHover?: (info: { id: string; meta: any } | null) => void;
  onSegmentClick?: (info: { id: string; meta: any }) => void;
  hoverDebounceMs?: number;
}

// --- Default Styling --- //
// Default options (will be overridden by driver-specific colors)
const DEFAULT_ASSIGNMENT_OPTIONS: PathOptions = { 
  weight: 3, 
  opacity: 0.7,
  lineCap: 'round',
  lineJoin: 'round'
};
// MST: red, thick, dashed
const DEFAULT_MST_OPTIONS: PathOptions = { 
  color: '#DC2626', 
  weight: 5, 
  opacity: 0.8, 
  dashArray: '10, 10' 
};
// Highlight: thicker and opaque
const HIGHLIGHT_OPTIONS: PathOptions = { 
  weight: 8, 
  opacity: 1 
};

// --- Main Component --- //

const RouteLayer: React.FC<RouteLayerProps> = ({
  assignmentLines,
  mstLines,
  showAssignments = true,
  showMST = true,
  assignmentOptions = {},
  mstOptions = {},
  onSegmentHover,
  onSegmentClick,
  hoverDebounceMs = 50,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- Event Handlers with Debouncing --- //
  /*
   * How to connect hover events to other components (e.g., MetricsPanel):
   * 1. Parent component (e.g., App.tsx) manages a `hoveredAssignmentId` state.
   * 2. Pass a callback to `onSegmentHover` that updates this state.
   *    <RouteLayer onSegmentHover={({ id }) => setHoveredAssignmentId(id)} />
   * 3. Pass the `hoveredAssignmentId` to the MetricsPanel.
   * 4. The MetricsPanel uses this ID to apply a highlight style to the matching list item.
  */
  const handleHover = useCallback((info: { id: string; meta: any } | null) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current as unknown as number);
    }
    hoverTimeout.current = setTimeout(() => {
      onSegmentHover?.(info);
    }, hoverDebounceMs) as unknown as NodeJS.Timeout;
  }, [onSegmentHover, hoverDebounceMs]);

  const createEventHandlers = useCallback((id: string, meta: any) => ({
    mouseover: () => {
      setHoveredId(id);
      handleHover({ id, meta });
    },
    mouseout: () => {
      setHoveredId(null);
      handleHover(null);
    },
    click: () => {
      onSegmentClick?.({ id, meta });
    },
  }), [handleHover, onSegmentClick]);

  // --- Memoized Polyline Rendering --- //

  // Use useRef to maintain the same colors between renders
  const driverColorsRef = useRef(new Map<string, string>());
  
  const assignmentPolylines = useMemo(() => {
    if (!showAssignments) return null;
    
    return assignmentLines.map((line) => {
      // Get or create a color for this driver
      if (!driverColorsRef.current.has(line.driverId)) {
        driverColorsRef.current.set(line.driverId, stringToColor(line.driverId));
      }
      const driverColor = driverColorsRef.current.get(line.driverId)!;
      
      const isHovered = line.id === hoveredId;
      
      // Create base options with color first, then apply defaults
      const baseOptions = {
        color: driverColor,
        weight: isHovered ? 6 : 4,
        ...DEFAULT_ASSIGNMENT_OPTIONS,  // These will be overridden by the above
        ...assignmentOptions,           // These will override everything
      };
      
      // For hover state, apply highlight options
      const options = isHovered 
        ? { 
            ...baseOptions,
            color: darkenColor(driverColor, 10),
            weight: 8,
            ...HIGHLIGHT_OPTIONS,  // Apply highlight last to ensure it takes precedence
          } 
        : baseOptions;
        
      const meta = { 
        driverId: line.driverId, 
        passengerId: line.passengerId, 
        cost: line.cost 
      };

      return (
        <Polyline
          key={line.id}
          positions={line.coords as LatLngExpression[]}
          pathOptions={options}
          eventHandlers={createEventHandlers(line.id, meta)}
        >
          <Tooltip sticky>Cost: {line.cost.toFixed(2)}</Tooltip>
        </Polyline>
      );
    });
  }, [showAssignments, assignmentLines, assignmentOptions, hoveredId, createEventHandlers]);

  const mstPolylines = useMemo(() => {
    if (!showMST) return null;

    const baseOptions = { ...DEFAULT_MST_OPTIONS, ...mstOptions };

    return mstLines.map((line) => {
      const isHovered = line.id === hoveredId;
      const options = isHovered ? { ...baseOptions, ...HIGHLIGHT_OPTIONS } : baseOptions;
      const meta = { u: line.u, v: line.v, weight: line.weight };

      return (
        <Polyline
          key={line.id}
          positions={line.coords as LatLngExpression[]}
          pathOptions={options}
          eventHandlers={createEventHandlers(line.id, meta)}
        >
          <Tooltip sticky>Weight: {line.weight.toFixed(2)}</Tooltip>
        </Polyline>
      );
    });
  }, [showMST, mstLines, mstOptions, hoveredId, createEventHandlers]);

  return (
    <>
      {assignmentPolylines}
      {mstPolylines}
    </>
  );
};

export default React.memo(RouteLayer);
