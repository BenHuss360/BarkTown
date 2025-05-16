import { Review } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Trash, Edit, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReviewForm from "./review-form";
import { getRatingStars } from "@/lib/utils";

interface ReviewListProps {
  locationId: number;
}

export default function ReviewList({ locationId }: ReviewListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  // Fetch reviews for this location
  const { data: reviews, isLoading } = useQuery({
    queryKey: [`/api/locations/${locationId}/reviews`],
    retry: 1
  });

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => {
      return apiRequest(`/api/reviews/${reviewId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/reviews`] });
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Unable to delete review. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (reviewId: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleEdit = (reviewId: number) => {
    setEditingReviewId(reviewId);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this location!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
      
      {reviews.map((review: Review) => (
        <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          {editingReviewId === review.id ? (
            <ReviewForm
              locationId={locationId}
              existingReview={{
                id: review.id,
                content: review.content,
                rating: review.rating,
                photoUrl: review.photoUrl || undefined
              }}
              onSuccess={() => setEditingReviewId(null)}
            />
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                    <User size={18} className="text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <div className="font-medium">User {review.userId}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(review.createdAt.toString())}
                    </div>
                  </div>
                </div>
                
                {user && user.id === review.userId && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(review.id)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-2 flex">
                {getRatingStars(review.rating).map((type, index) => (
                  <span key={index} className="text-yellow-500">
                    {type === 'filled' ? '★' : type === 'half' ? '★' : '☆'}
                  </span>
                ))}
              </div>
              
              <p className="mt-2 text-gray-600 dark:text-gray-300">{review.content}</p>
              
              {review.photoUrl && (
                <div className="mt-3">
                  <img 
                    src={review.photoUrl} 
                    alt="Review"
                    className="rounded-lg max-h-48 object-cover" 
                  />
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}