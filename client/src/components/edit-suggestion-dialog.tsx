import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertLocationSuggestionSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { MapPin } from "lucide-react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMapEvents 
} from "react-leaflet";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form validation schema based on the suggestion schema
const suggestionSchema = insertLocationSuggestionSchema.extend({
  id: z.number().optional(),
  photoUrl: z.string().optional().nullable(),
});

type SuggestionFormValues = z.infer<typeof suggestionSchema>;

// Map marker component for EditSuggestionDialog
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

interface EditSuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: any;
  onSuccess: () => void;
}

export default function EditSuggestionDialog({ 
  isOpen, 
  onClose, 
  suggestion,
  onSuccess
}: EditSuggestionDialogProps) {
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  
  // Default map center (London)
  const defaultCenter: [number, number] = [51.505, -0.09];

  // Form setup
  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      id: suggestion.id,
      name: suggestion.name,
      description: suggestion.description,
      address: suggestion.address,
      category: suggestion.category,
      features: suggestion.features,
      latitude: suggestion.latitude || undefined,
      longitude: suggestion.longitude || undefined,
      userId: suggestion.userId,
      photoUrl: suggestion.photoUrl || undefined,
    },
  });
  
  // Initialize map position from suggestion coordinates
  useEffect(() => {
    if (suggestion.latitude && suggestion.longitude) {
      setMapPosition([suggestion.latitude, suggestion.longitude]);
    }
  }, [suggestion]);
  
  // Update form when map position changes
  useEffect(() => {
    if (mapPosition) {
      form.setValue("latitude", mapPosition[0]);
      form.setValue("longitude", mapPosition[1]);
    }
  }, [mapPosition, form]);

  // Mutation for updating suggestion
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SuggestionFormValues) => {
      const response = await apiRequest("PUT", `/api/suggestions/${suggestion.id}/edit`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Suggestion updated successfully.",
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error updating suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to update suggestion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SuggestionFormValues) => {
    // Submit the form data
    mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Suggestion</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Textarea {...field} />
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
                    <Input {...field} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="park">Park</SelectItem>
                      <SelectItem value="shop">Shop</SelectItem>
                      <SelectItem value="pub">Pub</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Water bowls, treats, outdoor seating, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        type="number"
                        step="any"
                        value={field.value?.toString() || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                          field.onChange(value);
                          if (value !== null && mapPosition && typeof value === 'number') {
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
                        type="number"
                        step="any"
                        value={field.value?.toString() || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                          field.onChange(value);
                          if (value !== null && mapPosition && typeof value === 'number') {
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
            
            {/* Map toggle button */}
            <div className="mt-2">
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
            </div>
            
            {/* Map for location selection */}
            {showMap && (
              <div className="mt-2 border rounded-md overflow-hidden" style={{ height: "250px" }}>
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

            {suggestion.photoUrl && (
              <div className="mt-2">
                <FormLabel>Current Photo</FormLabel>
                <div className="mt-1">
                  <img 
                    src={suggestion.photoUrl} 
                    alt={suggestion.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}