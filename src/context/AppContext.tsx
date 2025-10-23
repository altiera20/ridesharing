
/*
 * Example Usage:
 * 
 * // In your main App component:
 * <AppProvider>
 *   <YourComponents />
 * </AppProvider>
 * 
 * // In any child component:
 * const { state, setDrivers, toggleLayer } = useAppContext();
 * const handleToggle = () => toggleLayer('mst');
*/

import React, { createContext, useReducer, useContext, ReactNode, useMemo, useCallback } from 'react';

// --- Type Definitions --- //

export interface Driver { id: string; lat: number; lng: number; }
export interface Passenger { id: string; lat: number; lng: number; }
export interface Assignment { driverId: string; passengerId: string; cost: number; }
export interface MSTEdge { u: string; v: string; weight: number; }

interface AppState {
  drivers: Driver[];
  passengers: Passenger[];
  assignments: Assignment[];
  mstEdges: MSTEdge[];
  totalNaiveTime: number;
  totalAssignedTime: number;
  totalMSTWeight: number;
  layers: { assignments: boolean; mst: boolean };
  autoRun: boolean;
  lastUpdated: number;
}

// --- Reducer Actions (Discriminated Union) --- //

type Action =
  | { type: 'SET_DRIVERS'; payload: Driver[] }
  | { type: 'SET_PASSENGERS'; payload: Passenger[] }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'SET_MST_EDGES'; payload: MSTEdge[] }
  | { type: 'SET_TOTALS'; payload: { naive: number; assigned: number; mst: number } }
  | { type: 'TOGGLE_LAYER'; payload: 'assignments' | 'mst' }
  | { type: 'SET_AUTORUN'; payload: boolean }
  | { type: 'UPDATE_TIMESTAMP' }
  | { type: 'RESET' };

// --- Context API Shape --- //

interface AppContextType {
  state: AppState;
  setDrivers: (drivers: Driver[]) => void;
  setPassengers: (passengers: Passenger[]) => void;
  setAssignments: (assignments: Assignment[]) => void;
  setMstEdges: (mstEdges: MSTEdge[]) => void;
  setTotals: (totals: { naive: number; assigned: number; mst: number }) => void;
  toggleLayer: (layer: 'assignments' | 'mst') => void;
  setAutoRun: (enabled: boolean) => void;
  updateTimestamp: () => void;
  reset: () => void;
}

// --- Initial State & Reducer --- //

const initialState: AppState = {
  drivers: [],
  passengers: [],
  assignments: [],
  mstEdges: [],
  totalNaiveTime: 0,
  totalAssignedTime: 0,
  totalMSTWeight: 0,
  layers: { assignments: true, mst: true },
  autoRun: false,
  lastUpdated: Date.now(),
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_DRIVERS': return { ...state, drivers: action.payload };
    case 'SET_PASSENGERS': return { ...state, passengers: action.payload };
    case 'SET_ASSIGNMENTS': return { ...state, assignments: action.payload };
    case 'SET_MST_EDGES': return { ...state, mstEdges: action.payload };
    case 'SET_TOTALS': return { ...state, totalNaiveTime: action.payload.naive, totalAssignedTime: action.payload.assigned, totalMSTWeight: action.payload.mst };
    case 'TOGGLE_LAYER': return { ...state, layers: { ...state.layers, [action.payload]: !state.layers[action.payload] } };
    case 'SET_AUTORUN': return { ...state, autoRun: action.payload };
    case 'UPDATE_TIMESTAMP': return { ...state, lastUpdated: Date.now() };
    case 'RESET': return initialState;
    default: return state;
  }
};

// --- Context & Provider --- //

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Memoized action creators to provide a stable API to consumers
  const setDrivers = useCallback((drivers: Driver[]) => dispatch({ type: 'SET_DRIVERS', payload: drivers }), []);
  const setPassengers = useCallback((passengers: Passenger[]) => dispatch({ type: 'SET_PASSENGERS', payload: passengers }), []);
  const setAssignments = useCallback((assignments: Assignment[]) => dispatch({ type: 'SET_ASSIGNIMENTS', payload: assignments }), []);
  const setMstEdges = useCallback((mstEdges: MSTEdge[]) => dispatch({ type: 'SET_MST_EDGES', payload: mstEdges }), []);
  const setTotals = useCallback((totals: { naive: number; assigned: number; mst: number }) => dispatch({ type: 'SET_TOTALS', payload: totals }), []);
  const toggleLayer = useCallback((layer: 'assignments' | 'mst') => dispatch({ type: 'TOGGLE_LAYER', payload: layer }), []);
  const setAutoRun = useCallback((enabled: boolean) => dispatch({ type: 'SET_AUTORUN', payload: enabled }), []);
  const updateTimestamp = useCallback(() => dispatch({ type: 'UPDATE_TIMESTAMP' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const value = useMemo(() => ({
    state,
    setDrivers,
    setPassengers,
    setAssignments,
    setMstEdges,
    setTotals,
    toggleLayer,
    setAutoRun,
    updateTimestamp,
    reset,
  }), [state, setDrivers, setPassengers, setAssignments, setMstEdges, setTotals, toggleLayer, setAutoRun, updateTimestamp, reset]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Consumer Hook --- //

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
