import { useState } from "react";
import { useLocation } from "wouter";
import LocationHeader from "@/components/location-header";
import SuggestLocationForm from "@/components/suggest-location-form";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function SuggestLocation() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Fetch user's current suggestions if logged in
  const { data: suggestionsData = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${user?.id || 1}/suggestions`],
    enabled: !!user,
  });

  const userSuggestions = suggestionsData;
  
  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <LocationHeader title="Suggest Location" onAccessibilityClick={() => {}} />
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to sign in to suggest new dog-friendly locations.
            </p>
            <Button onClick={() => navigate("/profile")}>
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader title="Suggest Location" onAccessibilityClick={() => {}} />
      
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Suggest a Location</h2>
        
        {showInstructions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">How Suggestions Work</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-5 mb-3">
              <li>Share new dog-friendly locations with the community</li>
              <li>Our team reviews each suggestion before publishing</li>
              <li><strong>Earn 5 paw points</strong> when your suggestion is approved</li>
              <li>Provide accurate details to help other dog owners</li>
            </ul>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowInstructions(false)}
              className="text-sm text-blue-600 dark:text-blue-400"
            >
              Hide Instructions
            </Button>
          </div>
        )}
        
        {userSuggestions.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Your Suggestions</h3>
            <div className="space-y-2">
              {userSuggestions.map((suggestion: any) => (
                <div 
                  key={suggestion.id}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{suggestion.name}</span>
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        suggestion.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                        suggestion.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)} • {suggestion.address.substring(0, 30)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <SuggestLocationForm />
      </div>
    </div>
  );
}