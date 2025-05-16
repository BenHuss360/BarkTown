import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "wouter";
import { Location } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus, Locate, Coffee, UtensilsCrossed, Trees, ShoppingBag } from "lucide-react";
import L from 'leaflet';

// Import leaflet CSS directly
import 'leaflet/dist/leaflet.css';

// Define paw marker icon
const pawIcon = L.icon({
  iconUrl: '/paw-marker.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Function to create category-specific paw markers
const createMarkerIcon = (category: string) => {
  // Use different colors for the SVG filters to colorize the paw markers
  let filterColor = "";
  
  switch(category) {
    case "restaurant":
      // Orange-brown paw
      return L.divIcon({
        className: "custom-marker",
        html: `<div class="paw-marker" style="filter: sepia(100%) saturate(300%) brightness(70%) hue-rotate(350deg);"><img src="/paw-marker.svg" alt="Restaurant" width="32" height="32"/></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    case "cafe":
      // Purple-brown paw
      return L.divIcon({
        className: "custom-marker",
        html: `<div class="paw-marker" style="filter: sepia(50%) saturate(300%) hue-rotate(230deg);"><img src="/paw-marker.svg" alt="Cafe" width="32" height="32"/></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    case "park":
      // Green-brown paw
      return L.divIcon({
        className: "custom-marker",
        html: `<div class="paw-marker" style="filter: sepia(90%) saturate(200%) hue-rotate(50deg);"><img src="/paw-marker.svg" alt="Park" width="32" height="32"/></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    case "shop":
      // Blue-brown paw
      return L.divIcon({
        className: "custom-marker",
        html: `<div class="paw-marker" style="filter: sepia(80%) saturate(300%) hue-rotate(170deg);"><img src="/paw-marker.svg" alt="Shop" width="32" height="32"/></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    default:
      // Default brown paw
      return pawIcon;
  }
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
        
        {/* User location marker - with custom paw icon */}
        <Marker 
          position={position}
          icon={L.divIcon({
            className: "user-location-marker",
            html: `<div class="paw-marker" style="filter: brightness(130%) saturate(150%);"><img src="/paw-marker-selected.svg" alt="Your location" width="42" height="42"/></div>`,
            iconSize: [42, 42],
            iconAnchor: [21, 42],
            popupAnchor: [0, -42]
          })}
        >
          <Popup>
            <div className="text-center">
              <strong>Your current location</strong>
              <p className="text-xs mt-1">This is where you are now</p>
            </div>
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
