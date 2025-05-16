import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Dialog,
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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

// Schema for validation
const suggestionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  features: z.string().min(3, "Features must be at least 3 characters"),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  photoUrl: z.string().optional(),
});

type SuggestionFormValues = z.infer<typeof suggestionSchema>;

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(suggestion.photoUrl || null);
  
  // Create form
  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      name: suggestion.name,
      description: suggestion.description,
      category: suggestion.category,
      address: suggestion.address,
      features: suggestion.features,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      photoUrl: suggestion.photoUrl || "",
    },
  });
  
  // Set up mutation
  const updateMutation = useMutation({
    mutationFn: (data: SuggestionFormValues) => {
      return apiRequest("PUT", `/api/suggestions/${suggestion.id}/edit`, data);
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onClose();
      
      // Show success message
      toast({
        title: "Suggestion Updated",
        description: "The suggestion has been updated successfully.",
      });
      
      // Refresh suggestion data
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error updating suggestion:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the suggestion. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: SuggestionFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Suggestion</DialogTitle>
          <DialogDescription>
            Make changes to the suggestion before approving or rejecting it.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
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
                    <Input {...field} />
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.000001"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                        value={field.value === null ? '' : field.value}
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
                        type="number" 
                        step="0.000001"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                        value={field.value === null ? '' : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Photo preview */}
            {photoPreview && (
              <div className="mt-2">
                <FormLabel className="block mb-2">Photo Preview</FormLabel>
                <img 
                  src={photoPreview} 
                  alt="Location preview" 
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}