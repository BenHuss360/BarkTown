import { useEffect, useState } from "react";

export default function StatusBar() {
  const [time, setTime] = useState(getCurrentTime());
  
  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  return (
    <div className="ios-status-bar bg-background flex items-center justify-between px-4">
      <span className="text-xs font-medium">{time}</span>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v1h-16v-1zm1 4a1 1 0 011-1h12a1 1 0 011 1v1h-14v-1zm14 3a1 1 0 01-1 1h-12a1 1 0 01-1-1v-1h14v1zm-15 3a1 1 0 011-1h14a1 1 0 011 1v1h-16v-1z" />
        </svg>
      </div>
    </div>
  );
}
