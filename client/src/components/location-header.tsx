import { MapPin, ChevronDown, Settings } from "lucide-react";

interface LocationHeaderProps {
  title?: string;
  location?: string;
  onAccessibilityClick: () => void;
}

export default function LocationHeader({ 
  title = "PawSpots", 
  location = "Nearby",
  onAccessibilityClick
}: LocationHeaderProps) {
  return (
    <header className="px-4 py-3 flex items-center justify-between bg-background shadow-sm z-10">
      {/* Location selector or Title */}
      <div className="flex items-center">
        {title === "PawPlaces" ? (
          <>
            <span className="text-primary font-semibold">{location}</span>
            <ChevronDown className="h-4 w-4 ml-1 text-primary" />
          </>
        ) : (
          <h1 className="font-semibold">{title}</h1>
        )}
      </div>
      
      {/* Accessibility Controls */}
      <div className="flex">
        <button 
          onClick={onAccessibilityClick}
          aria-label="Accessibility Options" 
          className="p-2 rounded-full hover:bg-muted"
        >
          <Settings className="h-6 w-6 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
