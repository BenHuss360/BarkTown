import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

// Form validation schema
const locationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  features: z.string().min(3, "Please include at least one feature"),
  userId: z.number()
});

type LocationFormValues = z.infer<typeof locationSchema>;

// TypeScript type guard to check if user exists and has an id
const userHasId = (user: any): user is { id: number } => {
  return user && typeof user.id === 'number';
};

export default function SuggestLocationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      address: '',
      features: '',
      userId: userHasId(user) ? user.id : 1
    }
  });

  // Watch category for UI updates
  const category = watch("category");

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setValue('latitude', latitude);
          setValue('longitude', longitude);
          toast({
            title: "Location detected",
            description: "Your current coordinates have been added to the form."
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Could not detect your location. Please try again or enter coordinates manually."
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation."
      });
    }
  };

  // Categories for selection
  const categories = [
    { id: "cafe", label: "Café", icon: "☕" },
    { id: "restaurant", label: "Restaurant", icon: "🍽️" },
    { id: "park", label: "Park", icon: "🌳" },
    { id: "shop", label: "Shop", icon: "🛍️" },
    { id: "hotel", label: "Hotel", icon: "🏨" },
    { id: "beach", label: "Beach", icon: "🏖️" },
  ];

  // Submit location suggestion
  const submitLocationMutation = useMutation({
    mutationFn: (data: LocationFormValues) => {
      return apiRequest("POST", "/api/locations/suggest", data);
    },
    onSuccess: () => {
      toast({
        title: "Location suggested!",
        description: "Thank you for your contribution! You'll earn 5 paw points if approved."
      });
      // Reset form and go back to step 1
      setCurrentStep(1);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your location. Please try again."
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: LocationFormValues) => {
    // Make sure to include all features as comma-separated string
    submitLocationMutation.mutate(data);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Suggest a Dog-Friendly Location</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g. Pawsome Café"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setValue("category", cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-md border transition-colors ${
                      category === cat.id
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={() => setCurrentStep(2)}
                disabled={!watch("name") || !watch("category")}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g. 123 Main St, City"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Location (Optional)</label>
              <div className="flex items-center space-x-2 mb-2">
                <Button type="button" variant="outline" size="sm" onClick={getUserLocation}>
                  Use My Location
                </Button>
                {coordinates && (
                  <span className="text-xs text-gray-500">
                    Lat: {coordinates.lat.toFixed(6)}, Long: {coordinates.lng.toFixed(6)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentStep(3)}>
                Next
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                rows={3}
                placeholder="What makes this place dog-friendly? What can visitors expect?"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dog-Friendly Features</label>
              <textarea
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                rows={2}
                placeholder="e.g. Water bowls, Dog treats, Outdoor seating (separate with commas)"
                {...register("features")}
              />
              {errors.features && (
                <p className="text-sm text-red-500 mt-1">{errors.features.message}</p>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={submitLocationMutation.isPending}
              >
                {submitLocationMutation.isPending ? "Submitting..." : "Suggest Location"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}