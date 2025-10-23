
/*
 * Example Usage:
 * // Time values are in minutes.
 * <MetricsPanel
 *   totalNaiveTime={150.5}
 *   totalAssignedTime={95.2}
 *   totalMSTWeight={80.0}
 *   assignments={[{ driverId: 'D1', passengerId: 'P1', cost: 10 }]}
 *   mstEdges={[{ u: 'D1', v: 'P2', weight: 5 }]}
 *   layers={{ assignments: true, mst: false }}
 *   onToggleLayer={(layer, enabled) => console.log(`${layer}: ${enabled}`)}
 *   onHighlightAssignment={(driverId, pId) => console.log(`Highlight: ${driverId}-${pId}`)}
 *   onExportCSV={() => console.log('Exporting CSV...')}
 * />
*/
import React, { useState, useMemo, useCallback } from 'react';

// --- Prop Types --- //
interface MetricsPanelProps {
  totalNaiveTime: number;
  totalAssignedTime: number;
  totalMSTWeight?: number;
  assignments: Array<{ driverId: string; passengerId: string; cost: number }>;
  mstEdges: Array<{ u: string; v: string; weight: number }>;
  layers: { assignments: boolean; mst: boolean };
  onToggleLayer: (layer: 'assignments' | 'mst', enabled: boolean) => void;
  onHighlightAssignment?: (driverId: string, passengerId: string) => void;
  onExportCSV?: () => void;
  compact?: boolean;
}

// --- Main Component --- //
const MetricsPanel: React.FC<MetricsPanelProps> = ({
  totalNaiveTime,
  totalAssignedTime,
  totalMSTWeight,
  assignments,
  mstEdges,
  layers,
  onToggleLayer,
  onHighlightAssignment,
  onExportCSV,
  compact = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMstExpanded, setIsMstExpanded] = useState(false);

  const timeSaved = totalNaiveTime - totalAssignedTime;

  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments;
    return assignments.filter(
      (a) =>
        a.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.passengerId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignments, searchTerm]);

  const handleHighlight = useCallback((driverId: string, passengerId: string) => {
    onHighlightAssignment?.(driverId, passengerId);
  }, [onHighlightAssignment]);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-md max-w-sm w-full ${compact ? 'space-y-2' : 'space-y-4'}`}>
      
      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <KpiCard title="Naive Time" value={totalNaiveTime} unit="mins" />
        <KpiCard title="Assigned Time" value={totalAssignedTime} unit="mins" />
        <KpiCard
          title="Time Saved"
          value={timeSaved}
          unit="mins"
          className={timeSaved > 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* --- Layer Toggles --- */}
      <div className="pt-2 space-y-2">
        <h3 className="text-sm font-semibold text-gray-600">Map Layers</h3>
        <LayerToggle label="Assignments" color="navy" checked={layers.assignments} onToggle={(e) => onToggleLayer('assignments', e)} />
        <LayerToggle label="MST" color="crimson" checked={layers.mst} onToggle={(e) => onToggleLayer('mst', e)} />
      </div>

      {/* --- Assignment List --- */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Assignments ({assignments.length})</h3>
        <input
          type="text"
          placeholder="Filter by ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md mb-2"
        />
        <ul role="list" className="h-48 overflow-y-auto border rounded-md divide-y divide-gray-200">
          {filteredAssignments.map(({ driverId, passengerId, cost }) => (
            <li
              key={`${driverId}-${passengerId}`}
              onMouseEnter={() => handleHighlight(driverId, passengerId)}
              onMouseLeave={() => handleHighlight('', '')}
              className="px-3 py-2 flex justify-between items-center text-xs hover:bg-gray-100 cursor-pointer"
              tabIndex={0}
            >
              <span>{driverId} &rarr; {passengerId}</span>
              <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{cost.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* --- MST Edge List --- */}
      {totalMSTWeight !== undefined && (
        <div className="pt-2">
          <button onClick={() => setIsMstExpanded(!isMstExpanded)} className="w-full text-left text-sm font-semibold text-gray-600 mb-2">
            MST Edges (Total: {totalMSTWeight.toFixed(1)}) {isMstExpanded ? '\u25B2' : '\u25BC'}
          </button>
          {isMstExpanded && (
            <ul role="list" className="h-32 overflow-y-auto border rounded-md divide-y divide-gray-200 text-xs">
              {mstEdges.map(({ u, v, weight }, i) => (
                <li key={i} className="px-3 py-2 flex justify-between items-center">
                  <span>{u} &mdash; {v}</span>
                  <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{weight.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* --- Export Button --- */}
      {onExportCSV && (
        <div className="pt-2">
          <button onClick={onExportCSV} className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
};

// --- Child Components --- //

const KpiCard: React.FC<{ title: string; value: number; unit: string; className?: string }> = ({ title, value, unit, className = 'text-gray-800' }) => (
  <div className="bg-gray-100 p-2 rounded-lg">
    <span className="text-xs text-gray-500 block">{title}</span>
    <span aria-live="polite" className={`text-xl font-bold ${className}`}>
      {value.toFixed(1)}
    </span>
    <span className="text-xs text-gray-500 block">{unit}</span>
  </div>
);

const LayerToggle: React.FC<{ label: string; color: string; checked: boolean; onToggle: (enabled: boolean) => void; }> = ({ label, color, checked, onToggle }) => (
  <label className="flex items-center justify-between cursor-pointer text-sm">
    <div className="flex items-center">
      <div style={{ backgroundColor: color }} className="w-4 h-4 rounded mr-2"></div>
      <span>{label}</span>
    </div>
    <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </div>
  </label>
);

export default React.memo(MetricsPanel);
