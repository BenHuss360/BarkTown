import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertLocationSuggestionSchema } from "@shared/schema";

// Extend the schema with additional validation
const locationSchema = insertLocationSuggestionSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  features: z.string().min(3, "Features must be at least 3 characters"),
});

// Type for form values
type LocationFormValues = z.infer<typeof locationSchema>;

export default function SuggestLocationForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userLocation } = useLocation();
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  
  // Create form
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "cafe",
      address: "",
      features: "",
      latitude: null,
      longitude: null,
      userId: user?.id || 1,
    },
  });
  
  // Set up mutation
  const submitMutation = useMutation({
    mutationFn: (data: LocationFormValues) => {
      return apiRequest("POST", `/api/locations/suggest`, data);
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      
      // Show success message
      toast({
        title: "Location Suggested",
        description: "Thank you! Your suggestion has been submitted for review.",
      });
      
      // Invalidate user suggestions query to refresh list
      if (user) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/suggestions`] });
      }
    },
    onError: (error) => {
      console.error("Error submitting location:", error);
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your suggestion. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: LocationFormValues) => {
    // If using current location, override lat/lng
    if (useCurrentLocation && userLocation) {
      data.latitude = userLocation[0];
      data.longitude = userLocation[1];
    }
    
    // Submit data
    submitMutation.mutate(data);
  };
  
  // Toggle current location usage
  const toggleUseCurrentLocation = () => {
    setUseCurrentLocation(!useCurrentLocation);
    
    if (!useCurrentLocation && userLocation) {
      // Set the form values for lat/lng if using current location
      form.setValue("latitude", userLocation[0]);
      form.setValue("longitude", userLocation[1]);
    } else {
      // Clear the form values if not using current location
      form.setValue("latitude", null);
      form.setValue("longitude", null);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Doggy Cafe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="park">Park</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the dog-friendly aspects of this location..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City, State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dog-friendly Features</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g. Water bowls, treats, outdoor seating, dog menu..." 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Location toggle */}
        <div className="flex items-center space-x-2 pb-2">
          <Button 
            type="button" 
            variant={useCurrentLocation ? "default" : "outline"} 
            size="sm"
            onClick={toggleUseCurrentLocation}
            disabled={!userLocation}
            className="text-sm"
          >
            {useCurrentLocation ? "✓ Using Current Location" : "Use My Current Location"}
          </Button>
          
          {!userLocation && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Enable location services to use this feature
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Suggestion"}
        </Button>
      </form>
    </Form>
  );
}