import { useEffect, useState } from 'react';

// Poodle, Cavapoo and Bichon Images
const dogImages = [
  "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=736&q=80", // Poodle
  "https://images.unsplash.com/photo-1608096299210-db7e38487075?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=869&q=80", // Poodle
  "https://images.pexels.com/photos/5122188/pexels-photo-5122188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Cavapoo
  "https://images.pexels.com/photos/14553806/pexels-photo-14553806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Cavapoo
  "https://images.unsplash.com/photo-1587559070757-f72a388edbba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"  // Bichon
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
      <h1 className="text-3xl font-bold text-primary">Poodle Maps</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Finding poodle-friendly places in London</p>
      <div className="mt-6 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}