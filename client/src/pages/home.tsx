import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/search-bar";
import CategoryFilters from "@/components/category-filters";
import MapView from "@/components/map-view";
import LocationCard from "@/components/location-card";
import LocationHeader from "@/components/location-header";
import { useLocation } from "@/contexts/LocationContext";
import { Location } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [displayCount, setDisplayCount] = useState<number>(8); // Initial display count
  
  // Reference for infinite scroll detection
  const listEndRef = useRef<HTMLDivElement>(null);
  
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
  
  // Filter locations based on search and category
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
      
      return matchesSearch && matchesCategory;
    });
  }, [sortedLocations, searchQuery, selectedCategory]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === "all" ? null : category);
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === "map" ? "list" : "map");
    // Reset display count when switching back to list view
    if (viewMode === "map") {
      setDisplayCount(8);
    }
  };
  
  // Handle scroll event to load more items
  const handleScroll = useCallback(() => {
    if (viewMode === 'list' && filteredLocations && displayCount < filteredLocations.length) {
      const scrollContainer = document.querySelector('.location-scroll-container');
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        
        // When user is near the bottom (within 200px), load more items
        if (scrollHeight - scrollTop - clientHeight < 200) {
          console.log("Loading more locations...", displayCount, "->", displayCount + 8);
          setDisplayCount(prevCount => prevCount + 8);
        }
      }
    }
  }, [viewMode, filteredLocations, displayCount]);
  
  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = document.querySelector('.location-scroll-container');
    if (scrollContainer && viewMode === 'list') {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, viewMode]);
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader 
        onAccessibilityClick={() => {}} 
        onSearch={handleSearch}
      />
      
      <div className="px-4 py-2 bg-background sticky top-0 z-50">
        <div className="pt-2 pb-2 overflow-x-auto">
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
          <div className="location-scroll-container px-4 pt-2 pb-4 overflow-y-auto" style={{ height: "calc(100% - 40px)" }}>
            <h2 className="text-xl font-bold mb-4">Nearby Dog-Friendly Places</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredLocations?.length ? (
              <>
                {/* Display only a portion of locations for better performance */}
                {filteredLocations.slice(0, displayCount).map((location: Location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
                
                {/* Display a "Load More" button instead of infinite scroll */}
                {displayCount < filteredLocations.length && (
                  <div className="flex justify-center items-center py-4">
                    <button 
                      onClick={() => setDisplayCount(prev => prev + 8)}
                      className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      Load More
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    </button>
                  </div>
                )}
              </>
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
