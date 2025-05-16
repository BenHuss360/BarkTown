import { MapPin, ChevronDown, Settings } from "lucide-react";
import { Link } from "wouter";

interface LocationHeaderProps {
  title?: string;
  location?: string;
  onAccessibilityClick?: () => void;
}

export default function LocationHeader({ 
  title = "Poodle Maps", 
  location = "Nearby",
  onAccessibilityClick
}: LocationHeaderProps) {
  return (
    <header className="px-4 py-3 flex items-center justify-between shadow-sm z-10 poodle-header">
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
      
      {/* Settings Link */}
      <div className="flex">
        <Link to="/settings">
          <button 
            aria-label="Settings" 
            className="p-2 rounded-full hover:bg-muted"
          >
            <Settings className="h-6 w-6 text-muted-foreground" />
          </button>
        </Link>
      </div>
    </header>
  );
}
