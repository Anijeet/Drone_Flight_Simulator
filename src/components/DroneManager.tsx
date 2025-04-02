
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSimulation } from '@/context/SimulationContext';
import { Drone } from '@/types';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DroneManager: React.FC = () => {
  const { drones, paths, addDrone, updateDrone, deleteDrone, selectedDroneId, selectDrone } = useSimulation();
  const { toast } = useToast();
  const [newDroneName, setNewDroneName] = useState('');
  const [selectedPathId, setSelectedPathId] = useState('');
  const [isAddingDrone, setIsAddingDrone] = useState(false);
  const [editingDroneId, setEditingDroneId] = useState<string | null>(null);
  const [editDroneName, setEditDroneName] = useState('');

  const generateRandomColor = () => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#FF33F5', 
      '#33FFF5', '#F5FF33', '#FF3333', '#33FF33'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddDrone = () => {
    if (newDroneName.trim() === '') {
      toast({
        title: "Error",
        description: "Drone name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPathId) {
      toast({
        title: "Error",
        description: "Please select a path for the drone",
        variant: "destructive",
      });
      return;
    }

    const path = paths.find(p => p.id === selectedPathId);
    if (!path || path.coordinates.length === 0) {
      toast({
        title: "Error",
        description: "Selected path has no coordinates",
        variant: "destructive",
      });
      return;
    }

    const newDrone: Drone = {
      id: Date.now().toString(),
      name: newDroneName,
      pathId: selectedPathId,
      position: path.coordinates[0],
      color: generateRandomColor()
    };

    addDrone(newDrone);
    setNewDroneName('');
    setSelectedPathId('');
    setIsAddingDrone(false);
    
    toast({
      title: "Success",
      description: `Drone "${newDroneName}" added to the path`,
    });
  };

  const handleEditDrone = (drone: Drone) => {
    setEditingDroneId(drone.id);
    setEditDroneName(drone.name);
  };

  const saveEditedDrone = () => {
    if (editingDroneId && editDroneName.trim() !== '') {
      updateDrone(editingDroneId, { name: editDroneName });
      setEditingDroneId(null);
      setEditDroneName('');
      
      toast({
        title: "Success",
        description: "Drone name updated",
      });
    }
  };

  const cancelEditing = () => {
    setEditingDroneId(null);
    setEditDroneName('');
  };

  const handleDeleteDrone = (droneId: string) => {
    deleteDrone(droneId);
    if (selectedDroneId === droneId) {
      selectDrone(null);
    }
    
    toast({
      title: "Drone deleted",
      description: "The drone has been removed from the simulation",
    });
  };

  const handleDroneClick = (droneId: string) => {
    selectDrone(droneId === selectedDroneId ? null : droneId);
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Drones</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingDrone(!isAddingDrone)}
          disabled={paths.length === 0}
        >
          {isAddingDrone ? 'Cancel' : 'Add Drone'}
        </Button>
      </div>

      {paths.length === 0 && !isAddingDrone && (
        <div className="text-center p-4 text-muted-foreground">
          <p>Create at least one flight path before adding drones.</p>
        </div>
      )}

      {isAddingDrone && (
        <div className="space-y-4 mb-6 p-4 border rounded-md bg-card/50">
          <div className="space-y-2">
            <label htmlFor="droneName" className="text-sm font-medium">
              Drone Name
            </label>
            <Input
              id="droneName"
              value={newDroneName}
              onChange={(e) => setNewDroneName(e.target.value)}
              placeholder="Enter drone name"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="path" className="text-sm font-medium">
              Flight Path
            </label>
            <Select value={selectedPathId} onValueChange={setSelectedPathId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a path" />
              </SelectTrigger>
              <SelectContent>
                {paths.map((path) => (
                  <SelectItem key={path.id} value={path.id}>
                    {path.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleAddDrone}>Add Drone</Button>
          </div>
        </div>
      )}

      {drones.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drones.map((drone) => {
                const path = paths.find(p => p.id === drone.pathId);
                return (
                  <TableRow 
                    key={drone.id}
                    className={selectedDroneId === drone.id ? "bg-accent/40" : ""}
                    onClick={() => handleDroneClick(drone.id)}
                  >
                    <TableCell>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: drone.color }}
                      ></div>
                    </TableCell>
                    <TableCell>
                      {editingDroneId === drone.id ? (
                        <Input
                          value={editDroneName}
                          onChange={(e) => setEditDroneName(e.target.value)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        drone.name
                      )}
                    </TableCell>
                    <TableCell>{path?.name || "Unknown"}</TableCell>
                    <TableCell className="text-right">
                      {editingDroneId === drone.id ? (
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={saveEditedDrone}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditDrone(drone)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteDrone(drone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>No drones added yet. Add your first drone to start the simulation.</p>
        </div>
      )}
    </div>
  );
};

export default DroneManager;
