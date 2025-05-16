import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import LocationHeader from "@/components/location-header";
import { Settings as SettingsIcon, Shield, BookOpen, VolumeX, ZoomIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Settings that would be stored in local storage in a real app
interface AccessibilitySettings {
  textSize: number;
  highContrast: boolean;
  colorBlindMode: boolean;
  reduceMotion: boolean;
  darkMode: "light" | "dark" | "system";
}

export default function Settings() {
  const { toast } = useToast();
  const { user, makeAdmin } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSize: 2,
    highContrast: false,
    colorBlindMode: true,
    reduceMotion: false,
    darkMode: "system"
  });
  
  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
    
    // Check if user is admin
    setIsAdmin(user?.id === 1);
  }, [user]);
  
  // Apply text size settings
  useEffect(() => {
    // Update the document root with a CSS variable for text size
    document.documentElement.style.setProperty('--text-size-factor', `${settings.textSize * 0.25 + 0.75}`);
    
    // Apply high contrast class if enabled
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply colorblind mode if enabled
    if (settings.colorBlindMode) {
      document.documentElement.classList.add('colorblind-mode');
    } else {
      document.documentElement.classList.remove('colorblind-mode');
    }
    
    // Apply reduced motion if enabled
    if (settings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Apply dark mode setting
    if (settings.darkMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.darkMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Use system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings]);
  
  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));
    
    toast({
      title: "Settings Saved",
      description: "Your accessibility preferences have been updated."
    });
  };
  
  // Toggle admin status
  const toggleAdminStatus = () => {
    const newStatus = !isAdmin;
    makeAdmin(newStatus);
    setIsAdmin(newStatus);
    
    toast({
      title: newStatus ? "Admin Mode Enabled" : "Admin Mode Disabled",
      description: newStatus 
        ? "You now have access to the admin panel." 
        : "Admin access has been revoked.",
      variant: newStatus ? "default" : "destructive"
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <LocationHeader title="Settings" onAccessibilityClick={() => {}} />
      
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-full">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
        
        {/* Admin Controls Section - only visible when logged in */}
        {user && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">Admin Controls</h3>
            </div>
            
            <div className="bg-card rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="adminMode" className="font-medium block">Admin Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Toggle admin privileges to access the admin panel
                  </p>
                </div>
                <Switch 
                  id="adminMode"
                  checked={isAdmin}
                  onCheckedChange={toggleAdminStatus}
                />
              </div>
            </div>
            
            <Separator className="my-6" />
          </>
        )}
        
        {/* Accessibility Settings Section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
            <ZoomIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold">Accessibility Settings</h3>
        </div>
        
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
              <span className="text-xl ml-3" style={{fontWeight: 'bold'}}>A</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Adjust the size of text throughout the app
            </p>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="highContrast" className="font-medium block">High Contrast</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Increases contrast for better readability
              </p>
            </div>
            <Switch 
              id="highContrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => setSettings({...settings, highContrast: checked})}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="colorBlindMode" className="font-medium block">Color Blind Mode</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Optimizes colors for different types of color blindness
              </p>
            </div>
            <Switch 
              id="colorBlindMode"
              checked={settings.colorBlindMode}
              onCheckedChange={(checked) => setSettings({...settings, colorBlindMode: checked})}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reduceMotion" className="font-medium block">Reduce Motion</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Decreases animations and transitions
              </p>
            </div>
            <Switch 
              id="reduceMotion"
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => setSettings({...settings, reduceMotion: checked})}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 mb-6">
          <Label className="block font-medium mb-2">Display Theme</Label>
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
          <p className="text-xs text-muted-foreground mt-2">
            Choose a display theme or use your system settings
          </p>
        </div>
        
        <button 
          onClick={handleSaveSettings}
          className="w-full ios-button bg-primary text-white mt-4 mb-8"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}