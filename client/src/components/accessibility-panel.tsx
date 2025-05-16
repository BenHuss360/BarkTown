import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccessibilitySettings {
  textSize: number;
  highContrast: boolean;
  colorBlindMode: boolean;
  reduceMotion: boolean;
  darkMode: "light" | "dark" | "auto";
}

export default function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSize: 3,
    highContrast: false,
    colorBlindMode: true,
    reduceMotion: false,
    darkMode: "auto"
  });
  
  // Apply settings when they change
  useEffect(() => {
    // Apply text size
    const htmlEl = document.documentElement;
    const baseFontSize = 16;
    const newFontSize = baseFontSize + (settings.textSize - 3) * 2;
    htmlEl.style.fontSize = `${newFontSize}px`;
    
    // Apply high contrast
    if (settings.highContrast) {
      htmlEl.classList.add("high-contrast");
    } else {
      htmlEl.classList.remove("high-contrast");
    }
    
    // Apply reduce motion
    if (settings.reduceMotion) {
      htmlEl.classList.add("reduce-motion");
    } else {
      htmlEl.classList.remove("reduce-motion");
    }
    
    // Apply dark mode
    if (settings.darkMode === "light") {
      htmlEl.classList.remove("dark");
    } else if (settings.darkMode === "dark") {
      htmlEl.classList.add("dark");
    } else {
      // Auto - based on system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        htmlEl.classList.add("dark");
      } else {
        htmlEl.classList.remove("dark");
      }
    }
    
    // Save settings to localStorage in a real app
  }, [settings]);
  
  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibilityTitle"
    >
      <div 
        className="w-full max-w-md bg-background rounded-t-xl p-6 transition-transform duration-300 transform"
        aria-describedby="accessibilityDesc"
      >
        <div className="mx-auto w-12 h-1 bg-muted rounded-full mb-4"></div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 id="accessibilityTitle" className="text-xl font-bold">Accessibility Options</h2>
          <button 
            onClick={onClose}
            aria-label="Close accessibility panel"
            className="p-1 rounded-full hover:bg-muted"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <p id="accessibilityDesc" className="sr-only">
          Adjust settings to make the app more accessible for your needs.
        </p>
        
        {/* Text Size */}
        <div className="mb-6">
          <label htmlFor="textSize" className="block font-medium mb-2">Text Size</label>
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
        
        {/* High Contrast */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label htmlFor="highContrast" className="font-medium">High Contrast</label>
            <Switch 
              id="highContrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => setSettings({...settings, highContrast: checked})}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Increases contrast between text and background
          </p>
        </div>
        
        {/* Color Blind Mode */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label htmlFor="colorBlindMode" className="font-medium">Color Blind Mode</label>
            <Switch 
              id="colorBlindMode"
              checked={settings.colorBlindMode}
              onCheckedChange={(checked) => setSettings({...settings, colorBlindMode: checked})}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Uses colorblind-friendly color palette
          </p>
        </div>
        
        {/* Reduce Motion */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label htmlFor="reduceMotion" className="font-medium">Reduce Motion</label>
            <Switch 
              id="reduceMotion"
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => setSettings({...settings, reduceMotion: checked})}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Minimizes animation effects
          </p>
        </div>
        
        {/* Dark Mode */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Dark Mode</label>
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
              onClick={() => setSettings({...settings, darkMode: "auto"})}
              className={`ios-button ${settings.darkMode === "auto" ? "bg-primary text-white" : "bg-muted text-foreground"}`}
            >
              Auto
            </button>
          </div>
        </div>
        
        {/* Close button */}
        <Button 
          onClick={onClose}
          className="w-full ios-button bg-primary text-white mt-4"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
