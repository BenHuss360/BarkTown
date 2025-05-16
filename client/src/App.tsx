import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Saved from "@/pages/saved";
import Profile from "@/pages/profile";
import Detail from "@/pages/detail";
import SuggestLocation from "@/pages/suggest";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import AccessibilityPanel from "@/components/accessibility-panel";
import AppNavigation from "@/components/app-navigation";
import SplashScreen from "@/components/splash-screen";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationProvider } from "./contexts/LocationContext";

function App() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Add event listener for keyboard (for accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A to toggle accessibility panel
      if (e.altKey && e.key === 'a') {
        setShowAccessibility(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <AuthProvider>
      <LocationProvider>
        <TooltipProvider>
          <div className="flex flex-col h-full w-full">
            {showSplash ? (
              <SplashScreen onFinish={() => setShowSplash(false)} />
            ) : (
              <>
                <main className="flex-1 flex flex-col h-full overflow-hidden">
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/saved" component={Saved} />
                    <Route path="/profile" component={Profile} />
                    <Route path="/location/:id" component={Detail} />
                    <Route path="/suggest" component={SuggestLocation} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/admin" component={Admin} />
                    <Route component={NotFound} />
                  </Switch>
                </main>
                
                <AppNavigation />
              </>
            )}
            
            <Toaster />
            
            <AccessibilityPanel 
              isOpen={showAccessibility} 
              onClose={() => setShowAccessibility(false)} 
            />
          </div>
        </TooltipProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
