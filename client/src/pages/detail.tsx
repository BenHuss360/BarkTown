import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { MapContainer as Map, Marker, TileLayer } from "react-leaflet";
import { Star, MapPin, ArrowLeft } from "lucide-react";
import { Location } from "@shared/schema";
import L from 'leaflet';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // In a real app, this would use the actual user ID
  const userId = 1;
  
  // Fetch location details
  const { data: location, isLoading } = useQuery({
    queryKey: [`/api/locations/${id}`],
    retry: 1
  });
  
  // Check if location is in user's favorites
  const { data: favoriteData, refetch: refetchFavorite } = useQuery({
    queryKey: [`/api/favorites/${userId}/${id}`],
    retry: 1
  });
  
  const isFavorite = favoriteData?.isFavorite || false;
  
  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await apiRequest('DELETE', `/api/favorites/${userId}/${id}`);
        toast({
          title: "Removed from favorites",
          description: "This location has been removed from your saved places."
        });
      } else {
        await apiRequest('POST', '/api/favorites', { userId, locationId: parseInt(id) });
        toast({
          title: "Added to favorites",
          description: "This location has been added to your saved places."
        });
      }
      refetchFavorite();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorites. Please try again."
      });
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate("/");
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render error state if location not found
  if (!location) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Location not found</p>
        <Button onClick={handleBack} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }
  
  const { 
    name, description, category, address, imageUrl, 
    rating, reviewCount, features, latitude, longitude 
  } = location as Location;
  
  const featuresList = features.split(',');
  
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      {/* Header with back button */}
      <div className="px-4 py-3 flex items-center bg-background">
        <button 
          onClick={handleBack}
          aria-label="Go back"
          className="mr-2 p-2 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold flex-1 truncate">{name}</h1>
      </div>
      
      {/* Location image */}
      <div className="relative h-48">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center text-white">
            <h2 className="text-xl font-bold">{name}</h2>
          </div>
        </div>
      </div>
      
      {/* Rating and category */}
      <div className="px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "text-secondary fill-secondary" : "text-muted"}`}
              />
            ))}
          </div>
          <span className="text-sm ml-2">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>
        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
      </div>
      
      {/* Description */}
      <div className="px-4 py-2">
        <p className="text-sm text-foreground">{description}</p>
      </div>
      
      {/* Address */}
      <div className="px-4 py-2 flex items-start">
        <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
        <span className="text-sm">{address}</span>
      </div>
      
      {/* Features */}
      <div className="px-4 py-2">
        <h3 className="font-semibold mb-2">Dog-Friendly Features</h3>
        <div className="flex flex-wrap gap-2">
          {featuresList.map((feature, index) => (
            <span 
              key={index}
              className="bg-muted px-3 py-1 rounded-full text-xs"
            >
              {feature.trim()}
            </span>
          ))}
        </div>
      </div>
      
      {/* Map */}
      <div className="px-4 py-2">
        <h3 className="font-semibold mb-2">Location</h3>
        <div className="h-40 rounded-xl overflow-hidden">
          {latitude && longitude && (
            <Map 
              center={[latitude, longitude] as [number, number]} 
              zoom={15} 
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude] as [number, number]} />
            </Map>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-4 py-4 flex space-x-4 mt-auto">
        <button 
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
          className={`flex-1 ios-button flex items-center justify-center ${
            isFavorite ? "bg-secondary text-foreground" : "bg-muted text-foreground"
          }`}
        >
          <Star className={`h-5 w-5 mr-2 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "Saved" : "Save"}
        </button>
        <a 
          href={`https://maps.apple.com/?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get directions"
          className="flex-1 ios-button bg-primary text-white flex items-center justify-center"
        >
          <MapPin className="h-5 w-5 mr-2" />
          Directions
        </a>
      </div>
    </div>
  );
}
