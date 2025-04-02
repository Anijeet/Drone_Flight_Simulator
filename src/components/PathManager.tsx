
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSimulation } from '@/context/SimulationContext';
import { Coordinate, DronePathData } from '@/types';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const PathManager: React.FC = () => {
  const { paths, addPath, updatePath, deletePath, selectedPathId, selectPath } = useSimulation();
  const { toast } = useToast();
  const [newPathName, setNewPathName] = useState('');
  const [isAddingPath, setIsAddingPath] = useState(false);
  const [coordinatesText, setCoordinatesText] = useState('');
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editPathName, setEditPathName] = useState('');

  const generateRandomColor = () => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#FF33F5', 
      '#33FFF5', '#F5FF33', '#FF3333', '#33FF33'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddPath = () => {
    if (newPathName.trim() === '') {
      toast({
        title: "Error",
        description: "Path name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse coordinates from text input
      const coordinates: Coordinate[] = parseCoordinates(coordinatesText);
      
      if (coordinates.length < 2) {
        toast({
          title: "Error",
          description: "At least 2 coordinates are required for a path",
          variant: "destructive",
        });
        return;
      }

      const newPath: DronePathData = {
        id: Date.now().toString(),
        name: newPathName,
        coordinates,
        color: generateRandomColor(),
      };

      addPath(newPath);
      setNewPathName('');
      setCoordinatesText('');
      setIsAddingPath(false);
      
      toast({
        title: "Success",
        description: `Path "${newPathName}" added with ${coordinates.length} waypoints`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const parseCoordinates = (text: string): Coordinate[] => {
    // Split by new lines
    const lines = text.trim().split('\n');
    
    const coordinates: Coordinate[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Try to match "lat,lng" format
      const match = trimmedLine.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
      
      if (match) {
        coordinates.push({
          lat: parseFloat(match[1]),
          lng: parseFloat(match[3]),
        });
      } else {
        throw new Error(`Invalid coordinate format: ${trimmedLine}`);
      }
    }
    
    return coordinates;
  };

  const handleEditPath = (path: DronePathData) => {
    setEditingPathId(path.id);
    setEditPathName(path.name);
  };

  const saveEditedPath = () => {
    if (editingPathId && editPathName.trim() !== '') {
      updatePath(editingPathId, { name: editPathName });
      setEditingPathId(null);
      setEditPathName('');
      
      toast({
        title: "Success",
        description: "Path name updated",
      });
    }
  };

  const cancelEditing = () => {
    setEditingPathId(null);
    setEditPathName('');
  };

  const handleDeletePath = (pathId: string) => {
    deletePath(pathId);
    if (selectedPathId === pathId) {
      selectPath(null);
    }
    
    toast({
      title: "Path deleted",
      description: "The path and its associated drones have been removed",
    });
  };

  const handlePathClick = (pathId: string) => {
    selectPath(pathId === selectedPathId ? null : pathId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Try to parse JSON
        try {
          const jsonData = JSON.parse(content);
          
          // Check if it's an array of coordinates
          if (Array.isArray(jsonData) && jsonData.length > 0 && 'lat' in jsonData[0] && 'lng' in jsonData[0]) {
            setCoordinatesText(jsonData.map(coord => `${coord.lat},${coord.lng}`).join('\n'));
            toast({
              title: "File loaded",
              description: `${jsonData.length} coordinates imported`,
            });
          } else {
            toast({
              title: "Invalid format",
              description: "The JSON file doesn't contain valid coordinates",
              variant: "destructive",
            });
          }
        } catch (jsonError) {
          // Try CSV format
          const lines = content.split('\n');
          const coords = lines.map(line => {
            const [lat, lng] = line.split(',');
            return { lat: parseFloat(lat), lng: parseFloat(lng) };
          }).filter(coord => !isNaN(coord.lat) && !isNaN(coord.lng));
          
          if (coords.length > 0) {
            setCoordinatesText(coords.map(coord => `${coord.lat},${coord.lng}`).join('\n'));
            toast({
              title: "File loaded",
              description: `${coords.length} coordinates imported`,
            });
          } else {
            toast({
              title: "Invalid format",
              description: "The file doesn't contain valid coordinates",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse the file",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Flight Paths</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingPath(!isAddingPath)}
        >
          {isAddingPath ? 'Cancel' : 'Add Path'}
        </Button>
      </div>

      {isAddingPath && (
        <div className="space-y-4 mb-6 p-4 border rounded-md bg-card/50">
          <div className="space-y-2">
            <label htmlFor="pathName" className="text-sm font-medium">
              Path Name
            </label>
            <Input
              id="pathName"
              value={newPathName}
              onChange={(e) => setNewPathName(e.target.value)}
              placeholder="Enter path name"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="coordinates" className="text-sm font-medium">
              Coordinates (lat,lng - one per line)
            </label>
            <textarea
              id="coordinates"
              value={coordinatesText}
              onChange={(e) => setCoordinatesText(e.target.value)}
              placeholder="37.7749,-122.4194
37.7750,-122.4190
37.7752,-122.4185"
              className="w-full min-h-[100px] p-2 rounded-md border bg-background text-foreground"
            />
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.csv,.json"
                className="hidden"
                onChange={handleFileUpload}
              />
              Upload File
            </Button>
            
            <Button onClick={handleAddPath}>Add Path</Button>
          </div>
        </div>
      )}

      {paths.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Waypoints</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paths.map((path) => (
                <TableRow 
                  key={path.id}
                  className={selectedPathId === path.id ? "bg-accent/40" : ""}
                  onClick={() => handlePathClick(path.id)}
                >
                  <TableCell>
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: path.color }}
                    ></div>
                  </TableCell>
                  <TableCell>
                    {editingPathId === path.id ? (
                      <Input
                        value={editPathName}
                        onChange={(e) => setEditPathName(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      path.name
                    )}
                  </TableCell>
                  <TableCell>{path.coordinates.length}</TableCell>
                  <TableCell className="text-right">
                    {editingPathId === path.id ? (
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={saveEditedPath}
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
                          onClick={() => handleEditPath(path)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePath(path.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>No paths added yet. Add your first flight path to start.</p>
        </div>
      )}
    </div>
  );
};

export default PathManager;
