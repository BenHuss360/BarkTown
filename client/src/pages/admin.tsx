import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import LocationHeader from "@/components/location-header";
import EditSuggestionDialog from "@/components/edit-suggestion-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Edit } from "lucide-react";

// Only user ID 1 has admin access
const ADMIN_ID = 1;

export default function AdminPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  
  // Check if current user is admin - must be exactly user ID 1
  const isAdmin = user && user.id === ADMIN_ID;
  
  // Fetch all suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading, refetch: refetchSuggestions } = useQuery<any[]>({
    queryKey: ["/api/suggestions"],
    enabled: !!isAdmin,
  });
  
  // Fetch all locations from database
  const { data: allLocations = [], isLoading: locationsLoading } = useQuery<any[]>({
    queryKey: ["/api/locations"],
    enabled: !!isAdmin,
  });
  
  // Filter suggestions based on active tab
  const filteredSuggestions = suggestions.filter(
    (suggestion) => suggestion.status === activeTab
  );
  
  // Set up mutation to update suggestion status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/suggestions/${id}/status`, { status });
    },
    onSuccess: (data, variables) => {
      // Refetch suggestions to update the list
      refetch();
      
      // Also invalidate the locations cache to refresh the main map view
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      
      // Show a different message based on status
      let actionMessage = "updated";
      if (variables.status === "approved") actionMessage = "approved";
      if (variables.status === "rejected") actionMessage = "rejected";
      
      toast({
        title: `Suggestion ${actionMessage}`,
        description: `The suggestion has been ${actionMessage} successfully.`,
      });
      
      // Navigate to the appropriate tab based on the new status
      setActiveTab(variables.status);
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the suggestion status.",
        variant: "destructive",
      });
    },
  });
  
  // Handle status update
  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  // If user is not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <LocationHeader title="Admin Panel" onAccessibilityClick={() => {}} />
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to access the admin panel. User ID 1 has admin access in the demo.
            </p>
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader title="Admin Panel" onAccessibilityClick={() => {}} />
      
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Manage Suggestions</h2>
        </div>
        
        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Admin Instructions</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-5 mb-2">
            <li>Review new location suggestions submitted by users</li>
            <li>Approve quality submissions to add them to the app</li>
            <li>Reject submissions that don't meet guidelines</li>
            <li>Users earn 5 paw points for each approved submission</li>
          </ul>
        </div>
        
        {/* Tabs for filtering suggestions */}
        <Tabs defaultValue="pending" onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pending">
              Pending
              <Badge variant="outline" className="ml-2">
                {suggestions.filter(s => s.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              <Badge variant="outline" className="ml-2">
                {suggestions.filter(s => s.status === "approved").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <Badge variant="outline" className="ml-2">
                {suggestions.filter(s => s.status === "rejected").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No pending suggestions to review.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion) => (
                  <SuggestionCard 
                    key={suggestion.id}
                    suggestion={suggestion}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-4">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No approved suggestions yet.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion) => (
                  <SuggestionCard 
                    key={suggestion.id}
                    suggestion={suggestion}
                    onStatusUpdate={handleStatusUpdate}
                    showReject={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-4">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No rejected suggestions.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion) => (
                  <SuggestionCard 
                    key={suggestion.id}
                    suggestion={suggestion}
                    onStatusUpdate={handleStatusUpdate}
                    showApprove={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Suggestion card component
interface SuggestionCardProps {
  suggestion: any;
  onStatusUpdate: (id: number, status: string) => void;
  showApprove?: boolean;
  showReject?: boolean;
}

function SuggestionCard({ 
  suggestion, 
  onStatusUpdate, 
  showApprove = false, 
  showReject = false 
}: SuggestionCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium">{suggestion.name}</h3>
        <Badge className="capitalize">
          {suggestion.category}
        </Badge>
      </div>
      
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        Submitted on {formatDate(suggestion.createdAt)} • User ID: {suggestion.userId}
      </div>
      
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description:</div>
        <p className="text-sm">{suggestion.description}</p>
      </div>
      
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address:</div>
        <p className="text-sm">{suggestion.address}</p>
      </div>
      
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features:</div>
        <p className="text-sm">{suggestion.features}</p>
      </div>
      
      {/* Show coordinates if available */}
      {(suggestion.latitude !== null && suggestion.longitude !== null) && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location:</div>
          <p className="text-sm">
            {suggestion.latitude.toFixed(6)}, {suggestion.longitude.toFixed(6)}
          </p>
        </div>
      )}
      
      {/* Optional photo preview */}
      {suggestion.photoUrl && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo:</div>
          <img 
            src={suggestion.photoUrl} 
            alt={suggestion.name}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2 mt-2">
        {/* Edit button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
        
        {(suggestion.status === "pending" || showApprove) && (
          <Button 
            size="sm" 
            variant="default" 
            onClick={() => onStatusUpdate(suggestion.id, "approved")}
          >
            Approve
          </Button>
        )}
        
        {(suggestion.status === "pending" || showReject) && (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => onStatusUpdate(suggestion.id, "rejected")}
          >
            Reject
          </Button>
        )}
      </div>
      
      {/* Edit Suggestion Dialog */}
      <EditSuggestionDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        suggestion={suggestion}
        onSuccess={() => {
          // Refetch suggestions to update the list with edited content
          queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
        }}
      />
    </Card>
  );
}