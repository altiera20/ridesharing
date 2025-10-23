
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import ControlPanel from './components/ControlPanel';
import MetricsPanel from './components/MetricsPanel';
import MapView from './components/MapView';
import useGraph from './hooks/useGraph';
import { regenerateDriversAndPassengers } from './utils/randomUtils';

// The App component wraps the entire application with the state provider.
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

// AppContent is the main layout and orchestrator component.
function AppContent() {
  // --- State and Hooks --- //
  const {
    state,
    setDrivers,
    setPassengers,
    setAutoRun,
    toggleLayer,
    setAssignments,
    setMstEdges,
    setTotals,
  } = useAppContext();

  const { drivers, passengers, autoRun, layers } = state;

  // The core graph computation hook.
  const graph = useGraph(drivers, passengers, { autoRun });

  // State to manage highlighting a route from the metrics panel.
  const [highlightedAssignmentId, setHighlightedAssignmentId] = useState<string | null>(null);

  // --- Effects --- //

  // 1. Generate initial nodes on component mount.
  useEffect(() => {
    const { drivers: initialDrivers, passengers: initialPassengers } = regenerateDriversAndPassengers(5, 10);
    setDrivers(initialDrivers);
    setPassengers(initialPassengers);
  }, [setDrivers, setPassengers]);

  // 2. When graph computations are finished, update the global state.
  useEffect(() => {
    if (graph.lastUpdated > 0) {
      setAssignments(graph.assignments);
      setMstEdges(graph.mstEdges);
      setTotals({ naive: graph.totalNaiveTime, assigned: graph.totalAssignedTime, mst: graph.totalMSTWeight });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph.lastUpdated]); // Only run when the graph hook produces new results.

  // --- Callbacks for Child Components --- //

  const handleRegenerate = useCallback(() => {
    const { drivers: newDrivers, passengers: newPassengers } = regenerateDriversAndPassengers(drivers.length, passengers.length);
    setDrivers(newDrivers);
    setPassengers(newPassengers);
  }, [drivers.length, passengers.length, setDrivers, setPassengers]);

  const handleCountChange = useCallback((count: number, type: 'drivers' | 'passengers') => {
    const driverCount = type === 'drivers' ? count : drivers.length;
    const passengerCount = type === 'passengers' ? count : passengers.length;
    const { drivers: newDrivers, passengers: newPassengers } = regenerateDriversAndPassengers(driverCount, passengerCount);
    setDrivers(newDrivers);
    setPassengers(newPassengers);
  }, [drivers.length, passengers.length, setDrivers, setPassengers]);

  // --- Render --- //

  return (
    <div className="flex h-screen font-sans bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-96 flex flex-col p-6 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-xl z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">RideShare Optimizer</h1>
            <p className="text-sm text-gray-500">Efficient ride matching in Trichy</p>
          </div>
        </div>
        <ControlPanel
          driversCount={drivers.length}
          passengersCount={passengers.length}
          onDriversChange={(n) => handleCountChange(n, 'drivers')}
          onPassengersChange={(n) => handleCountChange(n, 'passengers')}
          onRegenerate={handleRegenerate}
          onRunAlgorithms={graph.run}
          autoRun={autoRun}
          onToggleAutoRun={setAutoRun}
        />
        <div className="flex-grow mt-4 overflow-y-auto">
            <MetricsPanel
                totalNaiveTime={state.totalNaiveTime}
                totalAssignedTime={state.totalAssignedTime}
                totalMSTWeight={state.totalMSTWeight}
                assignments={state.assignments}
                mstEdges={state.mstEdges}
                layers={layers}
                onToggleLayer={toggleLayer}
                onHighlightAssignment={(driverId, passengerId) => {
                    setHighlightedAssignmentId(driverId && passengerId ? `${driverId}-${passengerId}`: null);
                }}
            />
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100">
          <MapView
            drivers={drivers}
            passengers={passengers}
            assignments={layers.assignments ? state.assignments.map(a => ({
              driver: a.driverId,
              passenger: a.passengerId
            })) : []}
            mstEdges={layers.mst ? state.mstEdges : []}
          />
        </div>
        <div className="absolute bottom-6 right-6 flex space-x-3">
          <button 
            onClick={handleRegenerate}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            title="Regenerate Points"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button 
            onClick={graph.run}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Run Algorithm</span>
          </button>
        </div>
      </main>
    </div>
  );
}
