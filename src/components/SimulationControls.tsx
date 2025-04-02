
import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus,
  FastForward,
  Rewind
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSimulation } from '@/context/SimulationContext';

const SimulationControls: React.FC = () => {
  const { 
    simulation,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    setSimulationProgress
  } = useSimulation();

  const handleProgressChange = (value: number[]) => {
    setSimulationProgress(value[0]);
  };

  const handleSpeedUp = () => {
    setSimulationSpeed(Math.min(simulation.speed * 2, 8));
  };

  const handleSpeedDown = () => {
    setSimulationSpeed(Math.max(simulation.speed / 2, 0.25));
  };

  return (
    <div className="p-4 bg-card rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {simulation.isRunning ? (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={pauseSimulation}
                title="Pause simulation"
              >
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={startSimulation}
                title="Start simulation"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={resetSimulation}
              title="Reset simulation"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSpeedDown}
              title="Decrease speed"
              disabled={simulation.speed <= 0.25}
            >
              <Rewind className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {simulation.speed}x
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSpeedUp}
              title="Increase speed"
              disabled={simulation.speed >= 8}
            >
              <FastForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="pt-2">
          <Slider
            value={[simulation.progress]}
            min={0}
            max={1}
            step={0.001}
            onValueChange={handleProgressChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
