import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import LocationHeader from "@/components/location-header";
import { useAuth } from "@/contexts/AuthContext";
import { FiLogIn, FiLogOut, FiUser } from "react-icons/fi";
import { getCurrentUser } from "@/lib/firebase";

// Settings that would be stored in local storage in a real app
interface AccessibilitySettings {
  textSize: number;
  highContrast: boolean;
  colorBlindMode: boolean;
  reduceMotion: boolean;
  darkMode: "light" | "dark" | "system";
}

export default function Profile() {
  const { toast } = useToast();
  const { user, signIn, signOut, isLoading } = useAuth();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSize: 2,
    highContrast: false,
    colorBlindMode: true,
    reduceMotion: false,
    darkMode: "system"
  });
  
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
  
  const handleSaveSettings = () => {
    // In a real app, save to localStorage
    toast({
      title: "Settings Saved",
      description: "Your accessibility preferences have been updated."
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader title="Profile" onAccessibilityClick={() => {}} />
      
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Your Profile</h2>
        
        {user ? (
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
              <div>
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
        
        <h3 className="font-semibold text-lg mt-6 mb-4">Accessibility Settings</h3>
        
        {/* Text Size */}
        <div className="bg-card rounded-xl p-4 mb-4">
          <div className="mb-4">
            <Label htmlFor="textSize" className="block font-medium mb-2">Text Size</Label>
            <div className="flex items-center">
              <span className="text-sm mr-3">A</span>
              <Slider 
                id="textSize"
                value={[settings.textSize]} 
                min={1} 
                max={5} 
                step={1}
                onValueChange={(value) => setSettings({...settings, textSize: value[0]})}
                className="flex-1"
              />
              <span className="text-lg ml-3">A</span>
            </div>
          </div>
        </div>
        
        {/* Contrast */}
        <div className="bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="highContrast" className="font-medium">High Contrast</Label>
            <Switch 
              id="highContrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => setSettings({...settings, highContrast: checked})}
            />
          </div>
        </div>
        
        {/* Color Blind Mode */}
        <div className="bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="colorBlindMode" className="font-medium">Color Blind Mode</Label>
            <Switch 
              id="colorBlindMode"
              checked={settings.colorBlindMode}
              onCheckedChange={(checked) => setSettings({...settings, colorBlindMode: checked})}
            />
          </div>
        </div>
        
        {/* Reduce Motion */}
        <div className="bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reduceMotion" className="font-medium">Reduce Motion</Label>
            <Switch 
              id="reduceMotion"
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => setSettings({...settings, reduceMotion: checked})}
            />
          </div>
        </div>
        
        {/* Dark Mode */}
        <div className="bg-card rounded-xl p-4 mb-4">
          <Label className="block font-medium mb-2">Dark Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setSettings({...settings, darkMode: "light"})}
              className={`ios-button ${settings.darkMode === "light" ? "bg-primary text-white" : "bg-muted text-foreground"}`}
            >
              Light
            </button>
            <button 
              onClick={() => setSettings({...settings, darkMode: "dark"})}
              className={`ios-button ${settings.darkMode === "dark" ? "bg-primary text-white" : "bg-muted text-foreground"}`}
            >
              Dark
            </button>
            <button 
              onClick={() => setSettings({...settings, darkMode: "system"})}
              className={`ios-button ${settings.darkMode === "system" ? "bg-primary text-white" : "bg-muted text-foreground"}`}
            >
              Auto
            </button>
          </div>
        </div>
        
        {/* Save Button */}
        <button 
          onClick={handleSaveSettings}
          className="w-full ios-button bg-primary text-white mt-4"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
