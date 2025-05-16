import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import LocationCard from "@/components/location-card";
import LocationHeader from "@/components/location-header";
import { Location } from "@shared/schema";

export default function Saved() {
  const { toast } = useToast();
  
  // In a real app, this would use the actual user ID
  const userId = 1;
  
  // Fetch user's favorite locations
  const { data: favorites, isLoading, error } = useQuery({
    queryKey: [`/api/favorites/${userId}`],
    retry: 1,
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your saved locations"
      });
    }
  });
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader title="Saved Places" onAccessibilityClick={() => {}} />
      
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Your Saved Places</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>Something went wrong. Please try again later.</p>
          </div>
        ) : favorites?.length ? (
          favorites.map((location: Location) => (
            <LocationCard key={location.id} location={location} isSaved={true} />
          ))
        ) : (
          <div className="text-center py-8">
            <p>You haven't saved any locations yet.</p>
            <p className="mt-2 text-muted-foreground">
              Explore dog-friendly places and save your favorites!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
