import React from 'react';

interface PawRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
}

// Create a more recognizable paw print SVG as component
const PawPrint = ({ filled, size = 'md', onClick, onMouseEnter }: { 
  filled: boolean; 
  size?: 'sm' | 'md' | 'lg'; 
  onClick?: () => void;
  onMouseEnter?: () => void;
}) => {
  const dimensions = {
    sm: { width: 18, height: 18 },
    md: { width: 24, height: 24 },
    lg: { width: 30, height: 30 },
  };
  
  const { width, height } = dimensions[size];
  
  // Using the improved paw icon
  return (
    <div 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        display: 'inline-block',
        cursor: onClick ? 'pointer' : 'default'
      }}
      className={`${onClick ? 'hover:scale-110 transition-transform' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <img 
        src="/paw-icon.svg" 
        alt="Paw rating" 
        width={width} 
        height={height}
        className={`${filled ? 'paw-filled' : 'paw-empty'}`}
        style={{
          filter: filled ? 'none' : 'grayscale(1) opacity(0.4)'
        }}
      />
    </div>
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