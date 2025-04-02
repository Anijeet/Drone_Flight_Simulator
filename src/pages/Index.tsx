
import React from 'react';
import { SimulationProvider } from '@/context/SimulationContext';
import Map from '@/components/Map';
import SimulationControls from '@/components/SimulationControls';
import PathManager from '@/components/PathManager';
import DroneManager from '@/components/DroneManager';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  // Google Maps API key from environment variable
  const apiKey = 'AIzaSyCWXJT43Guqkb61phUlsMNwiNW1IKapMFA';

  return (
    <SimulationProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b shadow-sm bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Drone Flight Simulator</h1>
            <p className="text-muted-foreground">Visualize and simulate drone flight paths</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-[600px] bg-card rounded-lg shadow-lg overflow-hidden">
                <Map apiKey={apiKey} />
              </div>
              
              <SimulationControls />
            </div>
            
            <div className="space-y-6">
              <PathManager />
              <Separator />
              <DroneManager />
            </div>
          </div>
        </main>

        <footer className="mt-10 py-4 border-t">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>Drone Flight Simulator &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </SimulationProvider>
  );
};

export default Index;
