import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertLocationSuggestionSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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