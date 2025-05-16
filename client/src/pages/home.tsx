import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/search-bar";
import CategoryFilters from "@/components/category-filters";
import MapView from "@/components/map-view";
import LocationCard from "@/components/location-card";
import LocationHeader from "@/components/location-header";
import { Location } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  
  // Fetch all locations
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    retry: 1
  });
  
  // Filter locations based on search and category
  const filteredLocations = locations?.filter((location: Location) => {
    const matchesSearch = searchQuery === "" || 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.features.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === null || 
      selectedCategory === "all" || 
      location.category === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === "all" ? null : category);
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === "map" ? "list" : "map");
  };
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader onAccessibilityClick={() => {}} />
      
      <div className="px-4 py-2 bg-background sticky top-0 z-50">
        <SearchBar onSearch={handleSearch} />
      
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
