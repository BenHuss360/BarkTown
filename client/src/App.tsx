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
import AccessibilityPanel from "@/components/accessibility-panel";
import StatusBar from "@/components/status-bar";
import AppNavigation from "@/components/app-navigation";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  
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
      <TooltipProvider>
        <div className="flex flex-col h-full w-full">
          <StatusBar />
          
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/saved" component={Saved} />
              <Route path="/profile" component={Profile} />
              <Route path="/location/:id" component={Detail} />
              <Route component={NotFound} />
            </Switch>
          </main>
          
          <AppNavigation />
          
          <Toaster />
          
          <AccessibilityPanel 
            isOpen={showAccessibility} 
            onClose={() => setShowAccessibility(false)} 
          />
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
