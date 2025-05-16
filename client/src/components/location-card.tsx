import { Link } from "wouter";
import { Star, MapPin, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Location } from "@shared/schema";
import { useLocation } from "@/contexts/LocationContext";

interface LocationCardProps {
  location: Location;
  isSaved?: boolean;
}

export default function LocationCard({ location, isSaved = false }: LocationCardProps) {
  const { toast } = useToast();
  const { calculateDistance, userLocation, isLocating } = useLocation();
  
  // In a real app, this would use the actual user ID
  const userId = 1;
  
  const {
    id,
    name,
    category,
    imageUrl,
    rating,
    reviewCount,
    features,
    distanceMiles,
  } = location;
  
  const featuresList = features.split(',');
  const displayFeatures = featuresList.slice(0, 3).join(' • ');
  
  // Toggle favorite status
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isSaved) {
        await apiRequest('DELETE', `/api/favorites/${userId}/${id}`);
        toast({
          title: "Removed from favorites",
          description: "This location has been removed from your saved places."
        });
      } else {
        await apiRequest('POST', '/api/favorites', { userId, locationId: id });
        toast({
          title: "Added to favorites",
          description: "This location has been added to your saved places."
        });
      }
      
      // Force hard refresh all queries that might be affected by this change
      setTimeout(() => {
        queryClient.resetQueries({ queryKey: [`/api/favorites/${userId}`] });
        queryClient.resetQueries({ queryKey: [`/api/favorites/${userId}/${id}`] });
        // If we're on the saved page, cause a page reload
        if (window.location.pathname === '/saved') {
          window.location.reload();
        }
      }, 100);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorites. Please try again."
      });
    }
  };
  
  // Get directions using Google Maps
  const getDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use Google Maps for directions
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`, '_blank');
  };
  
  return (
    <Link href={`/location/${id}`}>
      <Card className="mb-4 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">{name}</h3>
            
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {userLocation ? 
                `${calculateDistance(location.latitude, location.longitude).toFixed(1)} miles away` : 
                isLocating ? 
                  "Calculating distance..." : 
                  `${distanceMiles.toFixed(1)} miles away (estimated)`
              }
            </div>
            
            <div className="flex items-center mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(rating) ? "text-secondary fill-secondary" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm ml-2">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
            
            <div className="text-sm mt-2 text-muted-foreground">
              <p>{category.charAt(0).toUpperCase() + category.slice(1)} • {displayFeatures}</p>
            </div>
            
            <div className="flex mt-3 space-x-2">
              <button 
                onClick={toggleFavorite}
                aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
                className={`flex-1 ios-button flex items-center justify-center text-sm ${
                  isSaved ? "bg-secondary text-foreground" : "bg-muted text-foreground"
                }`}
              >
                <Star className={`h-5 w-5 mr-1 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </button>
              
              <button 
                onClick={getDirections}
                aria-label={`Get directions to ${name}`}
                className="flex-1 ios-button bg-primary text-white flex items-center justify-center text-sm"
              >
                <MapPin className="h-5 w-5 mr-1" />
                Directions
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
