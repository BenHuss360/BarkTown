import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import LocationHeader from "@/components/location-header";
import { useAuth } from "@/contexts/AuthContext";
import { FiLogIn, FiLogOut, FiUser } from "react-icons/fi";
import { Settings, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { toast } = useToast();
  const { user, signIn, signOut, isLoading } = useAuth();
  const [_, navigate] = useLocation();
  
  // Fetch user's paw points if logged in - ensure we're using the actual user ID
  const { data: pointsData = { pawPoints: 0 } } = useQuery<{ pawPoints: number }>({
    queryKey: [`/api/users/${user?.id}/points`],
    enabled: !!user && !!user.id, // Only run query if user exists and has an ID
  });
  
  // Fetch user's current suggestions if logged in - ensure we're using the actual user ID
  const { data: suggestionsData = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${user?.id}/suggestions`],
    enabled: !!user && !!user.id, // Only run query if user exists and has an ID
  });
  
  const pawPoints = pointsData.pawPoints;
  const pendingSuggestions = suggestionsData.filter((s: any) => s.status === "pending").length;
  const approvedSuggestions = suggestionsData.filter((s: any) => s.status === "approved").length;
  
  // Only user ID 1 has admin access
  const ADMIN_ID = 1; // Only this specific user has admin access
  const isAdmin = user && user.id === ADMIN_ID;
  
  const handleSignIn = async () => {
    try {
      await signIn();
      toast({
        title: "Signed In",
        description: "Successfully signed in with Google",
      });
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      let errorMessage = "There was a problem signing in with Google";
      if (error?.code === "auth/unauthorized-domain") {
        errorMessage = "You need to add the current domain to your Firebase authorized domains";
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out",
      });
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "There was a problem signing out",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader title="Profile" onAccessibilityClick={() => {}} />
      
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Your Profile</h2>
        
        {user ? (
          <>
            <div className="bg-card rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-4">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="rounded-full w-16 h-16 object-cover"
                  />
                ) : (
                  <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl font-bold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user.displayName || "Dog Lover"}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 mt-2 text-sm text-primary"
                  >
                    <FiLogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-lg mb-3">Paw Points</h3>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-3xl mr-2 text-orange-500">🐾</span>
                  <div>
                    <div className="text-2xl font-bold">{pawPoints}</div>
                    <div className="text-xs text-muted-foreground">Total points</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">{approvedSuggestions}</div>
                  <div className="text-xs text-muted-foreground">Approved locations</div>
                </div>
              </div>
              
              {pendingSuggestions > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                  <span className="font-medium">You have {pendingSuggestions} pending suggestion{pendingSuggestions !== 1 ? 's' : ''}!</span>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                    Each approved suggestion earns you 5 paw points.
                  </p>
                </div>
              )}
            </div>
            
            {/* App Settings */}
            <h3 className="font-semibold text-lg mt-6 mb-4">App Settings</h3>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/settings')}
              >
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  <span>Accessibility Settings</span>
                </div>
                <span className="text-muted-foreground">→</span>
              </Button>
              
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate('/admin')}
                >
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    <span>Admin Panel</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="bg-card rounded-xl p-4 mb-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center text-muted-foreground text-2xl mb-3">
                <FiUser size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-1">Not Signed In</h3>
              <p className="text-muted-foreground mb-4">Sign in to save your favorite places</p>
              <button
                onClick={handleSignIn}
                className="ios-button bg-primary text-white flex items-center justify-center gap-2 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <FiLogIn size={18} /> Sign in with Google
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}