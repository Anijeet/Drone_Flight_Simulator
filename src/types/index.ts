
export interface Coordinate {
  lat: number;
  lng: number;
  timestamp?: number;
}

export interface DronePathData {
  id: string;
  name: string;
  coordinates: Coordinate[];
  color: string;
}

export interface Drone {
  id: string;
  name: string;
  pathId: string;
  position: Coordinate;
  icon?: string;
  color: string;
}

export interface SimulationState {
  isRunning: boolean;
  currentTime: number;
  speed: number;
  progress: number;
}
