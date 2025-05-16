import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "wouter";
import { Location } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus, Locate, Coffee, UtensilsCrossed, Trees, ShoppingBag } from "lucide-react";
import L from 'leaflet';

// Import leaflet CSS directly
import 'leaflet/dist/leaflet.css';

// Function to create category-specific marker icons
const createMarkerIcon = (category: string) => {
  let bgColor = "#007AFF"; // Default blue for unknown categories
  let icon = `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>`;
  
  switch(category) {
    case "restaurant":
      bgColor = "#FF9500"; // Orange
      icon = `<path d="M16 2H8v2h8zM3 6h18v2H3z"></path><path d="M4 10v10h4V10zM16 10v10h4V10zM8 10v10h8V10z"></path>`;
      break;
    case "cafe":
      bgColor = "#AF52DE"; // Purple
      icon = `<path d="M18 5H4a2 2 0 00-2 2v8a4 4 0 004 4h8a4 4 0 004-4V7a2 2 0 00-2-2z"></path><line x1="4" y1="5" x2="4" y2="2"></line><line x1="12" y1="5" x2="12" y2="2"></line><line x1="20" y1="5" x2="20" y2="2"></line>`;
      break;
    case "park":
      bgColor = "#34C759"; // Green
      icon = `<path d="M8 9l4-4 4 4"></path><path d="M12 5v14"></path><path d="M4 14h16"></path><path d="M4 17h16"></path>`;
      break;
    case "shop":
      bgColor = "#5856D6"; // Indigo
      icon = `<path d="M20 10a4 4 0 01-4 4H8a4 4 0 01-4-4"></path><path d="M20 10v10H4V10"></path><path d="M18 10V7a6 6 0 00-12 0v3"></path>`;
      break;
  }
  
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${bgColor}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></div>`,
    iconSize: [24, 24]
  });
};

interface MapViewProps {
  locations: Location[];
  isLoading?: boolean;
}

// Component to handle location button functionality
function LocationButton() {
  const map = useMap();
  
  const handleClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Set view to user's current location with animation
          map.flyTo(
            [position.coords.latitude, position.coords.longitude],
            15,
            { animate: true, duration: 1 }
          );
        },
        (error) => {
          console.error("Error getting current location:", error);
          // Fallback to London if location access fails
          map.flyTo([51.5074, -0.1278], 13, { animate: true });
          alert("Could not get your location. Please check your location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
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
  // Default to London coordinates
  const [position, setPosition] = useState<[number, number]>([51.5074, -0.1278]);
  
  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep London as default if there's an error
        }
      );
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className="map-container bg-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="map-container relative" style={{ height: "100%", flex: 1 }}>
      <MapContainer 
        center={position as [number, number]} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
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
            icon={createMarkerIcon(location.category)}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">{location.name}</h3>
                <p className="text-xs capitalize">{location.category}</p>
                <div className="mt-2">
                  <Link href={`/location/${location.id}`}>
                    <div className="block w-full bg-primary text-white py-1 px-2 rounded text-sm font-medium">
                      View Details
                    </div>
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Map controls */}
        <div className="absolute bottom-4 right-4 z-[9999]">
          <ZoomControls />
        </div>
        
        {/* Current location button */}
        <div className="absolute bottom-4 left-4 z-[9999]">
          <LocationButton />
        </div>
      </MapContainer>
    </div>
  );
}
