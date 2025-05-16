import { useState, useEffect, useRef } from "react";
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
import { MapPin, Crosshair } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertLocationSuggestionSchema } from "@shared/schema";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMapEvents 
} from "react-leaflet";

// Extend the schema with additional validation
const locationSchema = insertLocationSuggestionSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  features: z.string().min(3, "Features must be at least 3 characters"),
  photoUrl: z.string().optional(),
});

// Type for form values
type LocationFormValues = z.infer<typeof locationSchema>;

// Map marker component
function LocationMarker({ position, setPosition }: { 
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  // Center map on selected position
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

export default function SuggestLocationForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userLocation } = useLocation();
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  
  // Map default center (London)
  const defaultCenter: [number, number] = [51.505, -0.09];
  
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
      photoUrl: "",
    },
  });
  
  // Set map position when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapPosition(userLocation);
    }
  }, [userLocation]);
  
  // Update form when map position changes
  useEffect(() => {
    if (mapPosition) {
      form.setValue("latitude", mapPosition[0]);
      form.setValue("longitude", mapPosition[1]);
    }
  }, [mapPosition, form]);
  
  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        // Store a placeholder URL in the form
        form.setValue("photoUrl", "temp-photo-url");
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Set up mutation
  const submitMutation = useMutation({
    mutationFn: (data: LocationFormValues) => {
      // In a real app, you would upload the photo to a storage service first
      // and then attach the URL to the data
      
      // Simulate photo URL in this demo
      if (photoFile) {
        // In a real app, this would be the URL returned from your image upload service
        data.photoUrl = photoPreview || "";
      } else {
        data.photoUrl = "";
      }
      
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
    const newState = !useCurrentLocation;
    setUseCurrentLocation(newState);
    
    if (newState && userLocation) {
      // When enabling current location:
      // 1. Set the form values for lat/lng
      form.setValue("latitude", userLocation[0]);
      form.setValue("longitude", userLocation[1]);
      
      // 2. Get address from coordinates via reverse geocoding
      // This is a simplified example - in a real app, you'd use a geocoding service
      const address = "Determined from your current location";
      form.setValue("address", address);
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
              <FormLabel>
                Address
                {useCurrentLocation && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                    (Using your location)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="123 Main St, City, State" 
                  {...field}
                  disabled={useCurrentLocation} 
                  className={useCurrentLocation ? "bg-gray-100 dark:bg-gray-800" : ""}
                />
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
        
        {/* Coordinates display */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value?.toString() || ''} 
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      field.onChange(value);
                      if (value !== null && mapPosition?.[1]) {
                        setMapPosition([value, mapPosition[1]]);
                      }
                    }}
                    readOnly={showMap}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value?.toString() || ''} 
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      field.onChange(value);
                      if (value !== null && mapPosition?.[0]) {
                        setMapPosition([mapPosition[0], value]);
                      }
                    }}
                    readOnly={showMap}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Map toggle and current location */}
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            type="button" 
            variant={showMap ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            {showMap ? "Hide Map" : "Select on Map"}
          </Button>
          
          <Button 
            type="button" 
            variant={useCurrentLocation ? "default" : "outline"} 
            size="sm"
            onClick={toggleUseCurrentLocation}
            disabled={!userLocation}
            className="flex items-center gap-1"
          >
            <Crosshair className="h-4 w-4" />
            {useCurrentLocation ? "✓ Using Current Location" : "Use My Current Location"}
          </Button>
          
          {!userLocation && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Enable location services to use this feature
            </p>
          )}
        </div>
        
        {/* Map for location selection */}
        {showMap && (
          <div className="mt-2 border rounded-md overflow-hidden" style={{ height: "300px" }}>
            <MapContainer 
              center={mapPosition || defaultCenter} 
              zoom={13} 
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker 
                position={mapPosition} 
                setPosition={setMapPosition} 
              />
            </MapContainer>
            <p className="text-xs text-center mt-1 text-muted-foreground">
              Click on the map to set the exact location
            </p>
          </div>
        )}
        
        {/* Photo Upload */}
        <div className="space-y-2 mt-4">
          <FormLabel className="block">Photo (Optional)</FormLabel>
          
          <div className="flex items-center space-x-3">
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => document.getElementById("photo")?.click()}
              className="flex-1"
            >
              Upload Photo
            </Button>
            
            {photoFile && (
              <Button 
                type="button" 
                variant="outline" 
                className="text-red-500"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  form.setValue("photoUrl", "");
                }}
              >
                Remove
              </Button>
            )}
          </div>
          
          {photoPreview && (
            <div className="mt-2">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-1">
            Adding a photo can help others recognize this location.
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-4"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Suggestion"}
        </Button>
      </form>
    </Form>
  );
}