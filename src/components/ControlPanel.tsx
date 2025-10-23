
/*
 * Example Usage:
 * <ControlPanel
 *   driversCount={10}
 *   passengersCount={20}
 *   onDriversChange={(n) => console.log(`Drivers: ${n}`)}
 *   onPassengersChange={(n) => console.log(`Passengers: ${n}`)}
 *   onRegenerate={() => console.log('Regenerate')}
 *   onRunAlgorithms={() => console.log('Run Algorithms')}
 *   autoRun={true}
 *   onToggleAutoRun={(enabled) => console.log(`Auto-run: ${enabled}`)}
 * />
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

// --- Component Props ---
interface ControlPanelProps {
  driversCount: number;
  passengersCount: number;
  onDriversChange: (n: number) => void;
  onPassengersChange: (n: number) => void;
  onRegenerate: () => void;
  onRunAlgorithms: () => void;
  autoRun: boolean;
  onToggleAutoRun: (enabled: boolean) => void;
  maxDrivers?: number;
  maxPassengers?: number;
  debounceMs?: number;
}

// --- Main Component ---
export default function ControlPanel({
  driversCount,
  passengersCount,
  onDriversChange,
  onPassengersChange,
  onRegenerate,
  onRunAlgorithms,
  autoRun,
  onToggleAutoRun,
  maxDrivers = 12,
  maxPassengers = 30,
  debounceMs = 300,
}: ControlPanelProps) {

  // --- Debounced Slider Logic ---
  // We manage an internal state for the slider to give immediate UI feedback,
  // while debouncing the expensive callback to the parent component.
  const useDebouncedSlider = (
    externalValue: number,
    callback: (n: number) => void
  ) => {
    const [internalValue, setInternalValue] = useState(externalValue);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      setInternalValue(externalValue);
    }, [externalValue]);

    const commitChange = useCallback((value: number) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      callback(value);
    }, [callback]);

    const handleDebouncedChange = useCallback((value: number) => {
      setInternalValue(value);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        callback(value);
      }, debounceMs);
    }, [callback, debounceMs]);

    return {
      value: internalValue,
      setValue: handleDebouncedChange,
      commit: commitChange,
      increment: () => {
          const newValue = Math.min(internalValue + 1, internalValue === driversCount ? maxDrivers : maxPassengers);
          setInternalValue(newValue);
          commitChange(newValue);
      },
      decrement: () => {
          const newValue = Math.max(internalValue - 1, 1);
          setInternalValue(newValue);
          commitChange(newValue);
      }
    };
  };

  const driversSlider = useDebouncedSlider(driversCount, onDriversChange);
  const passengersSlider = useDebouncedSlider(passengersCount, onPassengersChange);

  // --- Render ---
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 space-y-8 w-full shadow-lg border border-gray-100">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">Simulation Controls</h2>
        <p className="text-sm text-gray-500">Adjust the parameters and run the algorithm</p>
      </div>
      <h2 className="text-lg font-semibold text-gray-800">Controls</h2>

      {/* --- Sliders Section --- */}
      <div className="space-y-4">
        {/* Drivers Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <span className="w-6 h-6 mr-2 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                {driversSlider.value}
              </span>
              Drivers
            </label>
            <div className="flex space-x-1">
              <button 
                onClick={driversSlider.decrement}
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                disabled={driversSlider.value <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button 
                onClick={driversSlider.increment}
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                disabled={driversSlider.value >= maxDrivers}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          <input
            id="drivers-slider"
            type="range"
            min="1"
            max={maxDrivers}
            value={driversSlider.value}
            onChange={(e) => driversSlider.setValue(Number(e.target.value))}
            onMouseUp={() => driversSlider.commit(driversSlider.value)}
            onTouchEnd={() => driversSlider.commit(driversSlider.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-valuetext={`${driversSlider.value} drivers`}
          />
        </div>

        {/* Passengers Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <span className="w-6 h-6 mr-2 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                {passengersSlider.value}
              </span>
              Passengers
            </label>
            <div className="flex space-x-1">
              <button 
                onClick={passengersSlider.decrement}
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                disabled={passengersSlider.value <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button 
                onClick={passengersSlider.increment}
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                disabled={passengersSlider.value >= maxPassengers}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          <input
            id="passengers-slider"
            type="range"
            min="1"
            max={maxPassengers}
            value={passengersSlider.value}
            onChange={(e) => passengersSlider.setValue(Number(e.target.value))}
            onMouseUp={() => passengersSlider.commit(passengersSlider.value)}
            onTouchEnd={() => passengersSlider.commit(passengersSlider.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-valuetext={`${passengersSlider.value} passengers`}
          />
        </div>
      </div>

      {/* --- Buttons Section --- */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onRegenerate}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Regenerate Positions
        </button>
        <div className="flex space-x-3">
          <button
            onClick={onRunAlgorithms}
            disabled={autoRun}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Run
          </button>
          {/* Auto-run Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Auto-run Simulation</p>
                <p className="text-xs text-gray-500">Automatically run on changes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => onToggleAutoRun(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="p-3 bg-indigo-50 rounded-lg">
        <div className="flex items-center">
          <div className="p-1.5 bg-white rounded-lg shadow-sm mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Simulation Ready</p>
            <p className="text-xs text-gray-500">{driversCount} drivers • {passengersCount} passengers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
