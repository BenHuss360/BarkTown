import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/search-bar";
import CategoryFilters from "@/components/category-filters";
import MapView from "@/components/map-view";
import LocationCard from "@/components/location-card";
import LocationHeader from "@/components/location-header";
import { useLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  MapPin, 
  Coffee, 
  UtensilsCrossed, 
  Star, 
  Trees,
  Filter
} from "lucide-react";
import { Location } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [maxDistance, setMaxDistance] = useState<number>(10); // Max distance in miles
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  
  // Get user location from context
  const { userLocation, calculateDistance } = useLocation();
  
  // Fetch all locations
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    retry: 1
  });
  
  // Sort locations by distance if user location is available
  const sortedLocations = useMemo(() => {
    if (!locations || !userLocation) return locations;
    
    return [...locations].sort((a, b) => {
      const distanceA = calculateDistance(a.latitude, a.longitude);
      const distanceB = calculateDistance(b.latitude, b.longitude);
      return distanceA - distanceB;
    });
  }, [locations, userLocation, calculateDistance]);
  
  // Filter locations based on search, category, distance, and quick filters
  const filteredLocations = useMemo(() => {
    return sortedLocations?.filter((location: Location) => {
      // Text search filter
      const matchesSearch = searchQuery === "" || 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.features.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter  
      const matchesCategory = selectedCategory === null || 
        selectedCategory === "all" || 
        location.category === selectedCategory;
      
      // Distance filter
      let matchesDistance = true;
      if (userLocation) {
        const distance = calculateDistance(location.latitude, location.longitude);
        matchesDistance = distance <= maxDistance;
      }
      
      // Quick filters
      let matchesQuickFilter = true;
      if (quickFilter === "topRated") {
        matchesQuickFilter = location.rating >= 4.5;
      } else if (quickFilter === "nearMe") {
        if (userLocation) {
          const distance = calculateDistance(location.latitude, location.longitude);
          matchesQuickFilter = distance <= 2; // Within 2 miles
        } else {
          matchesQuickFilter = false;
        }
      } else if (quickFilter === "cafe") {
        matchesQuickFilter = location.category === "cafe";
      } else if (quickFilter === "restaurant") {
        matchesQuickFilter = location.category === "restaurant";
      } else if (quickFilter === "park") {
        matchesQuickFilter = location.category === "park";
      }
      
      return matchesSearch && matchesCategory && matchesDistance && matchesQuickFilter;
    });
  }, [sortedLocations, searchQuery, selectedCategory, maxDistance, quickFilter, userLocation, calculateDistance]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === "all" ? null : category);
    // Clear the quick filter when a category is selected
    if (quickFilter === "cafe" || quickFilter === "restaurant" || quickFilter === "park") {
      setQuickFilter(null);
    }
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === "map" ? "list" : "map");
  };
  
  const handleQuickFilterClick = (filter: string) => {
    if (quickFilter === filter) {
      // Toggle off the filter if it's already active
      setQuickFilter(null);
      // Also clear the category if this quick filter set one
      if (filter === "cafe" || filter === "restaurant" || filter === "park") {
        setSelectedCategory(null);
      }
    } else {
      setQuickFilter(filter);
      // Set category filter if this is a category-based quick filter
      if (filter === "cafe") setSelectedCategory("cafe");
      else if (filter === "restaurant") setSelectedCategory("restaurant");
      else if (filter === "park") setSelectedCategory("park");
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader onAccessibilityClick={() => {}} />
      
      <div className="px-4 py-2 bg-background sticky top-0 z-50">
        <SearchBar onSearch={handleSearch} />
      
        {/* Quick Filters Row */}
        <div className="flex overflow-x-auto gap-2 py-2 scrollbar-hide">
          <Button
            size="sm"
            variant={quickFilter === "nearMe" ? "default" : "outline"}
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => handleQuickFilterClick("nearMe")}
            disabled={!userLocation}
          >
            <MapPin className="h-4 w-4" />
            Near Me
          </Button>
          
          <Button
            size="sm"
            variant={quickFilter === "topRated" ? "default" : "outline"}
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => handleQuickFilterClick("topRated")}
          >
            <Star className="h-4 w-4" />
            Top Rated
          </Button>
          
          <Button
            size="sm"
            variant={quickFilter === "cafe" ? "default" : "outline"}
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => handleQuickFilterClick("cafe")}
          >
            <Coffee className="h-4 w-4" />
            Cafes
          </Button>
          
          <Button
            size="sm"
            variant={quickFilter === "restaurant" ? "default" : "outline"}
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => handleQuickFilterClick("restaurant")}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Restaurants
          </Button>
          
          <Button
            size="sm"
            variant={quickFilter === "park" ? "default" : "outline"}
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => handleQuickFilterClick("park")}
          >
            <Trees className="h-4 w-4" />
            Parks
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => setShowDistanceFilter(!showDistanceFilter)}
          >
            <Filter className="h-4 w-4" />
            Distance
          </Button>
        </div>
        
        {/* Distance Filter */}
        {showDistanceFilter && userLocation && (
          <div className="pb-3 pt-1">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Distance: {maxDistance} miles</span>
            </div>
            <Slider
              value={[maxDistance]}
              min={1}
              max={20}
              step={1}
              onValueChange={(values) => setMaxDistance(values[0])}
              className="py-1"
            />
          </div>
        )}
      
        <div className="pt-1 pb-2 overflow-x-auto">
          <CategoryFilters 
            selectedCategory={selectedCategory} 
            onSelectCategory={handleCategorySelect} 
          />
        </div>
      </div>
      
      {viewMode === "map" ? (
        <div className="relative flex-1 overflow-hidden flex flex-col" style={{ marginBottom: "0", height: "calc(100vh - 148px)" }}>
          <MapView 
            locations={filteredLocations || []} 
            isLoading={isLoading} 
          />
          <div className="absolute top-4 right-4 z-[9999]">
            <button 
              onClick={toggleViewMode}
              aria-label="Switch to list view"
              className="bg-white dark:bg-neutral-700 shadow-md px-4 py-2 rounded-xl font-medium text-neutral-800 dark:text-neutral-100 text-sm"
            >
              List View
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex-1" style={{ height: "calc(100vh - 205px)" }}>
          <div className="sticky top-0 pt-2 pr-4 z-40 flex justify-end bg-background">
            <button 
              onClick={toggleViewMode}
              aria-label="Switch to map view"
              className="bg-white dark:bg-neutral-700 shadow-md px-4 py-2 rounded-xl font-medium text-neutral-800 dark:text-neutral-100 text-sm"
            >
              Map View
            </button>
          </div>
          <div className="px-4 pt-2 pb-4 overflow-y-auto" style={{ height: "calc(100% - 40px)" }}>
            <h2 className="text-xl font-bold mb-4">Nearby Dog-Friendly Places</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredLocations?.length ? (
              filteredLocations.map((location: Location) => (
                <LocationCard key={location.id} location={location} />
              ))
            ) : (
              <div className="text-center py-8">
                <p>No locations found. Try a different search or category.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
