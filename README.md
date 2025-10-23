#  Ridesharing Algorithm Visualizer

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

> A web-based simulation demonstrating optimal driver-passenger assignment using classical graph algorithms.

<!-- 
TODO: Add a high-quality GIF of the application in action here! 
<p align="center">
  <img src="./demo.gif" alt="Application Demo" width="800"/>
</p>
-->

This project provides an interactive visualization of a ridesharing system, allowing users to generate drivers and passengers on a map and compute the most efficient matching between them. It's a practical demonstration of how foundational computer science algorithms can be applied to solve real-world logistics problems.

---

##  Key Features

-   ** Interactive Map**: Uses Leaflet to display driver and passenger nodes in a configurable geographic area.
-   ** Dynamic Controls**: Easily adjust the number of drivers and passengers with sliders.
-   ** Optimal Assignment**: Employs the **Hungarian (Kuhn-Munkres) algorithm** to find the assignment with the minimum total travel time.
-   ** Network Analysis**: Calculates a **Minimum Spanning Tree (MST)** using Kruskal's algorithm to visualize the most efficient network backbone connecting all nodes.
-   ** Live Metrics**: A real-time dashboard shows the total travel time for a naive assignment vs. the optimized assignment, clearly displaying the time and cost saved.
-   ** Pure Frontend**: Runs entirely in the browser—no backend required. All logic is self-contained in TypeScript.

##  Technology Stack

| Category      | Technology                                                                              |
| :------------ | :-------------------------------------------------------------------------------------- |
| **Framework**   | [React](https://reactjs.org/), [Vite](https://vitejs.dev/)                               |
| **Language**    | [TypeScript](https://www.typescriptlang.org/)                                           |
| **Styling**     | [TailwindCSS](https://tailwindcss.com/)                                                 |
| **Map**         | [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)        |
| **State Mgmt**  | React Context API with `useReducer`                                                     |

##  Core Algorithms

This project is built around three classical algorithms:

1.  **Dijkstra's Algorithm**: While not directly used in the final cost calculation (which uses direct distance for simplicity), the module is included as it represents the standard way to find the shortest path in a real-world road network.
2.  **Hungarian Algorithm**: The core of the assignment logic. It solves the assignment problem in polynomial time, guaranteeing the most efficient pairing of drivers to passengers to minimize total travel time.
3.  **Kruskal's Algorithm**: Used to find the Minimum Spanning Tree of all nodes in the system. This demonstrates how one might analyze the most efficient way to connect all participants for potential pooled rides or infrastructure planning.

##  Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18.x or later)
-   [npm](https://www.npmjs.com/) (or yarn/pnpm)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/tia-ridesharing.git
    cd tia-ridesharing
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser** and navigate to `http://localhost:5173`.

##  Project Structure

The codebase is organized logically to separate concerns:

```
/src
├── algorithms/       # Standalone algorithm implementations
├── components/       # Reusable React components
├── context/          # Global state management (AppContext)
├── hooks/            # Custom React hooks for complex logic
├── styles/           # Global CSS and Tailwind setup
├── utils/            # Helper functions (math, random data)
├── App.tsx           # Main application component/layout
└── main.tsx          # React entry point
```
