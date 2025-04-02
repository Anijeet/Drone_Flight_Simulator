
import React, { useEffect, useRef, useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { loadGoogleMapsScript } from '@/lib/googleMaps';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MapProps {
  apiKey: string;
}

// Renamed from Map to MapComponent to avoid naming conflict with JavaScript's Map
const MapComponent: React.FC<MapProps> = ({ apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const pathsRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  const { 
    paths, 
    drones, 
    addPath,
    simulation
  } = useSimulation();

  // Load Google Maps API
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsScript(apiKey);
        setIsLoaded(true);
        toast({
          title: "Map loaded successfully",
          description: "Google Maps API has been initialized",
        });
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        toast({
          title: "Error loading map",
          description: "Failed to initialize Google Maps API",
          variant: "destructive",
        });
      }
    };

    initMap();
  }, [apiKey, toast]);

  // Initialize map when Google Maps API is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 0, lng: 0 },
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }]
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }]
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }]
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }]
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }]
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }]
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }]
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }]
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }]
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }]
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }]
        }
      ]
    };

    googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

    // Initialize search box
    const searchInputElement = document.createElement('input');
    searchInputElement.placeholder = 'Search for locations';
    searchInputElement.className = 'controls bg-background text-foreground border rounded p-2 shadow-lg';
    searchInputElement.style.margin = '10px';
    searchInputElement.style.width = '250px';

    googleMapRef.current.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInputElement);

    const searchBox = new google.maps.places.SearchBox(searchInputElement);

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) return;

      const bounds = new google.maps.LatLngBounds();
      places.forEach(place => {
        if (!place.geometry || !place.geometry.location) return;

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });

      googleMapRef.current?.fitBounds(bounds);
    });

    // Listen for map click to add waypoints
    googleMapRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      
      toast({
        title: "Waypoint added",
        description: `Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`,
      });
      
      // Implement logic to add waypoint to a path
    });

  }, [isLoaded, toast]);

  // Update paths on the map
  useEffect(() => {
    if (!isLoaded || !googleMapRef.current) return;

    // Clear old paths
    pathsRef.current.forEach((polyline) => {
      polyline.setMap(null);
    });
    pathsRef.current.clear();

    // Add new paths
    paths.forEach((path) => {
      if (path.coordinates.length < 2) return;

      const polyline = new google.maps.Polyline({
        path: path.coordinates,
        geodesic: true,
        strokeColor: path.color,
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: googleMapRef.current
      });

      pathsRef.current.set(path.id, polyline);
    });
  }, [isLoaded, paths]);

  // Update drone markers
  useEffect(() => {
    if (!isLoaded || !googleMapRef.current) return;

    // Update existing markers and add new ones
    drones.forEach((drone) => {
      let marker = markersRef.current.get(drone.id);

      if (!marker) {
        // Create new marker
        marker = new google.maps.Marker({
          position: drone.position,
          map: googleMapRef.current,
          title: drone.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: drone.color,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#ffffff'
          }
        });
        markersRef.current.set(drone.id, marker);
      } else {
        // Update marker position
        marker.setPosition(drone.position);
      }
    });

    // Remove markers for deleted drones
    markersRef.current.forEach((marker, id) => {
      if (!drones.some(drone => drone.id === id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });
  }, [isLoaded, drones]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
      <div 
        ref={mapRef} 
        className="h-full w-full" 
        style={{ minHeight: '500px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
