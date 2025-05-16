import React from 'react';

interface PawRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
}

// Create a paw print SVG as component
const PawPrint = ({ filled, size = 'md', onClick, onMouseEnter }: { 
  filled: boolean; 
  size?: 'sm' | 'md' | 'lg'; 
  onClick?: () => void;
  onMouseEnter?: () => void;
}) => {
  const dimensions = {
    sm: { width: 14, height: 14 },
    md: { width: 20, height: 20 },
    lg: { width: 24, height: 24 },
  };
  
  const { width, height } = dimensions[size];
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="2"
      className={`paw-print ${filled ? 'text-primary' : 'text-muted-foreground'} 
        ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <path d="M4,9 C2.343,9 1,7.657 1,6 C1,4.343 2.343,3 4,3 C5.657,3 7,4.343 7,6 C7,7.657 5.657,9 4,9 Z" />
      <path d="M20,9 C18.343,9 17,7.657 17,6 C17,4.343 18.343,3 20,3 C21.657,3 23,4.343 23,6 C23,7.657 21.657,9 20,9 Z" />
      <path d="M12,22 C8.686,22 6,19.314 6,16 C6,12.686 8.686,10 12,10 C15.314,10 18,12.686 18,16 C18,19.314 15.314,22 12,22 Z" />
      <path d="M3,16 C1.343,16 0,14.657 0,13 C0,11.343 1.343,10 3,10 C4.657,10 6,11.343 6,13 C6,14.657 4.657,16 3,16 Z" />
      <path d="M21,16 C19.343,16 18,14.657 18,13 C18,11.343 19.343,10 21,10 C22.657,10 24,11.343 24,13 C24,14.657 22.657,16 21,16 Z" />
    </svg>
  );
};

export default function PawRating({ 
  rating, 
  max = 5, 
  size = 'md',
  interactive = false,
  onChange
}: PawRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  // Create an array of length max
  const pawPrints = Array.from({ length: max }, (_, i) => i + 1);
  
  return (
    <div 
      className="flex items-center gap-1"
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {pawPrints.map((value) => (
        <PawPrint 
          key={value}
          filled={interactive ? value <= (hoverRating || rating) : value <= rating} 
          size={size}
          onClick={interactive && onChange ? () => onChange(value) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(value) : undefined}
        />
      ))}
    </div>
  );
}