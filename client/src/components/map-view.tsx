import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "wouter";
import { Location } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus, Locate } from "lucide-react";
import L from 'leaflet';

// Define custom marker icon
const markerIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background-color: #007AFF; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [20, 20]
});

interface MapViewProps {
  locations: Location[];
  isLoading?: boolean;
}

// Component to handle location button functionality
function LocationButton() {
  const map = useMap();
  
  const handleClick = () => {
    map.locate({ setView: true, maxZoom: 15 });
  };
  
  return (
    <button 
      onClick={handleClick}
      aria-label="Show my current location"
      className="w-10 h-10 bg-white dark:bg-neutral-700 rounded-full shadow-md flex items-center justify-center"
    >
      <Locate className="h-6 w-6 text-primary" />
    </button>
  );
}

// Component to handle zoom controls
function ZoomControls() {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  return (
    <div className="flex flex-col">
      <button 
        onClick={handleZoomIn}
        aria-label="Zoom in"
        className="mb-2 w-10 h-10 bg-white dark:bg-neutral-700 rounded-full shadow-md flex items-center justify-center"
      >
        <Plus className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
      </button>
      <button 
        onClick={handleZoomOut}
        aria-label="Zoom out"
        className="w-10 h-10 bg-white dark:bg-neutral-700 rounded-full shadow-md flex items-center justify-center"
      >
        <Minus className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
      </button>
    </div>
  );
}

export default function MapView({ locations, isLoading = false }: MapViewProps) {
  const [position, setPosition] = useState<[number, number]>([37.7749, -122.4194]);
  
  // Get user's location on component mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, []);
  
  if (isLoading) {
    return (
      <div className="map-container bg-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="map-container">
      <MapContainer 
        center={position as [number, number]} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker position={position}>
          <Popup>
            Your current location
          </Popup>
        </Marker>
        
        {/* Location markers */}
        {locations.map((location) => (
          <Marker 
            key={location.id}
            position={[location.latitude, location.longitude] as [number, number]}
            icon={markerIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">{location.name}</h3>
                <p className="text-xs">{location.category}</p>
                <div className="mt-2">
                  <Link href={`/location/${location.id}`}>
                    <a className="block w-full bg-primary text-white py-1 px-2 rounded text-sm font-medium">
                      View Details
                    </a>
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Map controls */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <ZoomControls />
        </div>
        
        {/* Current location button */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <LocationButton />
        </div>
      </MapContainer>
    </div>
  );
}
