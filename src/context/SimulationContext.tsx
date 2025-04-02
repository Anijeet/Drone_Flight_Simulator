
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Drone, DronePathData, SimulationState } from '../types';

interface SimulationContextProps {
  paths: DronePathData[];
  drones: Drone[];
  simulation: SimulationState;
  selectedPathId: string | null;
  selectedDroneId: string | null;
  addPath: (path: DronePathData) => void;
  updatePath: (pathId: string, updatedPath: Partial<DronePathData>) => void;
  deletePath: (pathId: string) => void;
  addDrone: (drone: Drone) => void;
  updateDrone: (droneId: string, updatedDrone: Partial<Drone>) => void;
  deleteDrone: (droneId: string) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  setSimulationProgress: (progress: number) => void;
  selectPath: (pathId: string | null) => void;
  selectDrone: (droneId: string | null) => void;
}

const SimulationContext = createContext<SimulationContextProps | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children }) => {
  const [paths, setPaths] = useState<DronePathData[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    currentTime: 0,
    speed: 1,
    progress: 0,
  });
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);

  // Animation frame for simulation
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;

    const updateSimulation = (timestamp: number) => {
      if (!simulation.isRunning) return;

      if (!lastTime) {
        lastTime = timestamp;
      }

      const deltaTime = (timestamp - lastTime) * simulation.speed;
      lastTime = timestamp;

      setSimulation((prev) => {
        // Calculate the new time and progress
        const newTime = prev.currentTime + deltaTime;
        const totalDuration = 10000; // Example: 10 seconds total duration
        const newProgress = Math.min(newTime / totalDuration, 1);

        // Update drone positions based on progress
        updateDronePositions(newProgress);

        return {
          ...prev,
          currentTime: newTime,
          progress: newProgress,
        };
      });

      animationFrameId = requestAnimationFrame(updateSimulation);
    };

    if (simulation.isRunning) {
      animationFrameId = requestAnimationFrame(updateSimulation);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [simulation.isRunning, simulation.speed]);

  // Update drone positions based on progress
  const updateDronePositions = (progress: number) => {
    setDrones((currentDrones) => {
      return currentDrones.map((drone) => {
        const path = paths.find((p) => p.id === drone.pathId);
        if (!path || path.coordinates.length < 2) return drone;

        // Calculate position based on progress
        const index = Math.min(
          Math.floor(progress * (path.coordinates.length - 1)),
          path.coordinates.length - 2
        );
        
        const segmentProgress = (progress * (path.coordinates.length - 1)) % 1;
        
        // Interpolate between points
        const start = path.coordinates[index];
        const end = path.coordinates[index + 1];
        
        const newPosition = {
          lat: start.lat + (end.lat - start.lat) * segmentProgress,
          lng: start.lng + (end.lng - start.lng) * segmentProgress,
        };

        return {
          ...drone,
          position: newPosition,
        };
      });
    });
  };

  const addPath = (path: DronePathData) => {
    setPaths((prev) => [...prev, path]);
  };

  const updatePath = (pathId: string, updatedPath: Partial<DronePathData>) => {
    setPaths((prev) =>
      prev.map((path) => (path.id === pathId ? { ...path, ...updatedPath } : path))
    );
  };

  const deletePath = (pathId: string) => {
    setPaths((prev) => prev.filter((path) => path.id !== pathId));
    // Also delete any drones assigned to this path
    setDrones((prev) => prev.filter((drone) => drone.pathId !== pathId));
  };

  const addDrone = (drone: Drone) => {
    setDrones((prev) => [...prev, drone]);
  };

  const updateDrone = (droneId: string, updatedDrone: Partial<Drone>) => {
    setDrones((prev) =>
      prev.map((drone) => (drone.id === droneId ? { ...drone, ...updatedDrone } : drone))
    );
  };

  const deleteDrone = (droneId: string) => {
    setDrones((prev) => prev.filter((drone) => drone.id !== droneId));
  };

  const startSimulation = () => {
    setSimulation((prev) => ({ ...prev, isRunning: true }));
  };

  const pauseSimulation = () => {
    setSimulation((prev) => ({ ...prev, isRunning: false }));
  };

  const resetSimulation = () => {
    setSimulation({
      isRunning: false,
      currentTime: 0,
      speed: 1,
      progress: 0,
    });
    
    // Reset all drones to their starting positions
    setDrones((currentDrones) => {
      return currentDrones.map((drone) => {
        const path = paths.find((p) => p.id === drone.pathId);
        return {
          ...drone,
          position: path?.coordinates[0] || drone.position,
        };
      });
    });
  };

  const setSimulationSpeed = (speed: number) => {
    setSimulation((prev) => ({ ...prev, speed }));
  };

  const setSimulationProgress = (progress: number) => {
    setSimulation((prev) => ({ 
      ...prev, 
      progress,
      currentTime: progress * 10000 // Assuming total duration is 10 seconds
    }));
    updateDronePositions(progress);
  };

  const selectPath = (pathId: string | null) => {
    setSelectedPathId(pathId);
  };

  const selectDrone = (droneId: string | null) => {
    setSelectedDroneId(droneId);
  };

  const value = {
    paths,
    drones,
    simulation,
    selectedPathId,
    selectedDroneId,
    addPath,
    updatePath,
    deletePath,
    addDrone,
    updateDrone,
    deleteDrone,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    setSimulationProgress,
    selectPath,
    selectDrone,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};
