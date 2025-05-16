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
              className="ios-button flex items-center gap-2 px-4 py-2 text-sm bg-white bg-opacity-90 dark:bg-neutral-700 dark:bg-opacity-90"
            >
              <span className="w-4 h-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </span>
              List View
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex-1" style={{ height: "calc(100vh - 205px)" }}>
          <div className="sticky top-0 z-40 flex justify-between items-center bg-background px-4 py-2">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">Nearby Places</h2>
              {selectedCategory && selectedCategory !== "all" && (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                  {selectedCategory}
                </span>
              )}
            </div>
            
            <button 
              onClick={toggleViewMode}
              aria-label="Switch to map view"
              className="ios-button flex items-center gap-2 px-4 py-2 text-sm"
            >
              <span className="w-4 h-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              Map View
            </button>
          </div>
          <div className="location-scroll-container px-4 pt-2 pb-4 overflow-y-auto" style={{ height: "calc(100% - 40px)" }}>
            
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
