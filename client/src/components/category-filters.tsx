import { Button } from "@/components/ui/button";
import { FiCoffee, FiShoppingBag, FiCompass } from "react-icons/fi";
import { MdOutlineRestaurant, MdOutlinePark } from "react-icons/md";

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilters({ 
  selectedCategory, 
  onSelectCategory 
}: CategoryFiltersProps) {
  const categories = [
    { id: "park", label: "Parks", icon: <MdOutlinePark size={18} /> },
    { id: "cafe", label: "Cafés", icon: <FiCoffee size={18} /> },
    { id: "restaurant", label: "Restaurants", icon: <MdOutlineRestaurant size={18} /> },
    { id: "shop", label: "Shops", icon: <FiShoppingBag size={18} /> },
    { id: "all", label: "All", icon: <FiCompass size={18} /> }
  ];
  
  return (
    <div className="flex overflow-x-auto hide-scrollbar whitespace-nowrap pb-2 gap-3 px-4" style={{ WebkitOverflowScrolling: 'touch', paddingLeft: '1rem', paddingRight: '1rem' }}>
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id || (category.id === "all" && selectedCategory === null);
        
        return (
          <div 
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              flex-shrink-0 dog-tag px-4 py-2 flex items-center gap-2 
              transition-all duration-200
              ${isSelected 
                ? "dog-tag-selected" 
                : "dog-tag-normal"
              }
              cursor-pointer
            `}
            role="button"
            aria-label={`Show ${category.label.toLowerCase()} only`}
            aria-pressed={isSelected}
          >
            <span className={`transition-transform ${isSelected ? "scale-110" : ""}`}>
              {category.icon}
            </span>
            <span className="text-sm font-medium">{category.label}</span>
          </div>
        );
      })}
    </div>
  );
}
