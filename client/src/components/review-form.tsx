import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { insertReviewSchema } from "@shared/schema";

// Form validation schema with Zod
const reviewSchema = z.object({
  content: z.string().min(3, "Review must be at least 3 characters"),
  rating: z.number().min(1).max(5),
  photoUrl: z.string().optional(),
  userId: z.number(),
  locationId: z.number()
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  locationId: number;
  onSuccess?: () => void;
  existingReview?: {
    id: number;
    content: string;
    rating: number;
    photoUrl?: string;
  };
}

export default function ReviewForm({ locationId, onSuccess, existingReview }: ReviewFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(existingReview?.photoUrl || null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!existingReview;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      content: existingReview?.content || "",
      rating: existingReview?.rating || 5,
      photoUrl: existingReview?.photoUrl || "",
      userId: user?.id || 1, // Default to 1 for mock implementation
      locationId
    }
  });

  const currentRating = watch("rating");

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to cloud storage
      // For this demo, we'll create a local URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setPhotoPreview(photoUrl);
        setValue("photoUrl", photoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const createReviewMutation = useMutation({
    mutationFn: (data: ReviewFormValues) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id || 1}/locations/${locationId}/review`] });
      toast({
        title: "Review submitted",
        description: "Thank you for sharing your experience!",
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: (data: ReviewFormValues) => {
      return apiRequest("PUT", `/api/reviews/${existingReview?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/reviews`] });
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully!",
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem updating your review. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ReviewFormValues) => {
    if (isEditing) {
      updateReviewMutation.mutate(data);
    } else {
      createReviewMutation.mutate(data);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">
        {isEditing ? "Edit your review" : "Write a review"}
      </h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Rating</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue("rating", star)}
                className="text-2xl focus:outline-none"
              >
                {star <= currentRating ? (
                  <span className="text-yellow-500">★</span>
                ) : (
                  <span className="text-gray-300">★</span>
                )}
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-sm text-red-500">{errors.rating.message}</p>
          )}
        </div>

        {/* Review Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium">
            Your Review
          </label>
          <textarea
            id="content"
            rows={4}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Share your experience with this place..."
            {...register("content")}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content.message}</p>
          )}
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Add a Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full text-sm"
          />
          {photoPreview && (
            <div className="mt-2">
              <img
                src={photoPreview}
                alt="Preview"
                className="h-24 w-auto object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
          >
            {createReviewMutation.isPending || updateReviewMutation.isPending
              ? "Submitting..."
              : isEditing
              ? "Update Review"
              : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
}