import { useEffect, useState } from 'react';

const dogImages = [
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1335&q=80",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1394&q=80",
  "https://images.unsplash.com/photo-1583511655826-05700442982c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1349&q=80",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
];

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [randomDogImage] = useState(() => {
    // Pick a random dog image from the array
    const randomIndex = Math.floor(Math.random() * dogImages.length);
    return dogImages[randomIndex];
  });

  useEffect(() => {
    // Wait for 2 seconds then trigger the onFinish callback
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="w-64 h-64 overflow-hidden rounded-full mb-6 border-4 border-primary">
        <img
          src={randomDogImage}
          alt="Cute dog"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-3xl font-bold text-primary">Barktown</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Finding dog-friendly places nearby</p>
      <div className="mt-6 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}