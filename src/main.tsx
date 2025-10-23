
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import global styles
// TailwindCSS directives are handled by the postcss processor.
import './styles/index.css';
// Leaflet's CSS is required for the map to render correctly.
import 'leaflet/dist/leaflet.css';

// Get the root element from the HTML.
const rootElement = document.getElementById('root') as HTMLElement;

// Create a React root and render the main App component.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
