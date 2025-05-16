import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import LocationHeader from "@/components/location-header";

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
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSize: 2,
    highContrast: false,
    colorBlindMode: true,
    reduceMotion: false,
    darkMode: "system"
  });
  
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
        
        <div className="bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl font-bold">
              D
            </div>
            <div>
              <h3 className="font-semibold text-lg">DogLover</h3>
              <p className="text-muted-foreground">Dog owner since 2020</p>
            </div>
          </div>
        </div>
        
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
