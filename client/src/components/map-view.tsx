import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "wouter";
import { Location } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus, Locate, Coffee, UtensilsCrossed, Trees, ShoppingBag } from "lucide-react";
import L from 'leaflet';

// Import leaflet CSS directly
import 'leaflet/dist/leaflet.css';

// Define marker icons
const defaultIcon = L.icon({
  iconUrl: '/marker-icon.svg',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40]
});

// Function to create category-specific markers
const createMarkerIcon = (category: string) => {
  switch(category) {
    case "restaurant":
      return L.icon({
        iconUrl: '/marker-restaurant.svg',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
      });
    case "cafe":
      return L.icon({
        iconUrl: '/marker-cafe.svg',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
      });
    case "park":
      return L.icon({
        iconUrl: '/marker-park.svg',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
      });
    case "shop":
      return L.icon({
        iconUrl: '/marker-shop.svg',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
      });
    default:
      return defaultIcon;
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
        
        {/* User location marker with clear icon */}
        <Marker 
          position={position}
          icon={L.icon({
            iconUrl: '/user-location-marker.svg',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
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
