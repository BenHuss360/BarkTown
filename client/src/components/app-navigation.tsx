import { Link, useLocation } from "wouter";
import { MapPin, Heart, User, PlusCircle } from "lucide-react";

export default function AppNavigation() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <footer className="bg-background border-t border-border shadow-sm z-10">
      <nav className="flex justify-around" role="navigation" aria-label="Main navigation">
        {/* Explore tab */}
        <Link href="/">
          <div 
            aria-label="Explore locations" 
            aria-current={isActive("/") ? "page" : undefined}
            className="flex flex-col items-center px-4 py-2 cursor-pointer"
          >
            <MapPin className={`h-6 w-6 ${isActive("/") ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium mt-1 ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
              Explore
            </span>
            {isActive("/") && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
          </div>
        </Link>
        
        {/* Saved tab */}
        <Link href="/saved">
          <div 
            aria-label="View saved locations" 
            aria-current={isActive("/saved") ? "page" : undefined}
            className="flex flex-col items-center px-4 py-2 cursor-pointer"
          >
            <Heart className={`h-6 w-6 ${isActive("/saved") ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium mt-1 ${isActive("/saved") ? "text-primary" : "text-muted-foreground"}`}>
              Saved
            </span>
            {isActive("/saved") && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
          </div>
        </Link>
        
        {/* Suggest tab */}
        <Link href="/suggest">
          <div 
            aria-label="Suggest new location" 
            aria-current={isActive("/suggest") ? "page" : undefined}
            className="flex flex-col items-center px-4 py-2 cursor-pointer"
          >
            <PlusCircle className={`h-6 w-6 ${isActive("/suggest") ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium mt-1 ${isActive("/suggest") ? "text-primary" : "text-muted-foreground"}`}>
              Suggest
            </span>
            {isActive("/suggest") && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
          </div>
        </Link>
        
        {/* Profile tab */}
        <Link href="/profile">
          <div 
            aria-label="View profile settings" 
            aria-current={isActive("/profile") ? "page" : undefined}
            className="flex flex-col items-center px-4 py-2 cursor-pointer"
          >
            <User className={`h-6 w-6 ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium mt-1 ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`}>
              Profile
            </span>
            {isActive("/profile") && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
          </div>
        </Link>
      </nav>
    </footer>
  );
}
