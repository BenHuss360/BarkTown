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
    { id: "all", label: "All", icon: <FiCompass size={18} /> },
    { id: "restaurant", label: "Restaurants", icon: <MdOutlineRestaurant size={18} /> },
    { id: "cafe", label: "Cafés", icon: <FiCoffee size={18} /> },
    { id: "park", label: "Parks", icon: <MdOutlinePark size={18} /> },
    { id: "shop", label: "Shops", icon: <FiShoppingBag size={18} /> }
  ];
  
  return (
    <div className="flex overflow-x-auto hide-scrollbar whitespace-nowrap pb-2 gap-3">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id || (category.id === "all" && selectedCategory === null);
        
        return (
          <div 
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              flex-shrink-0 rounded-full px-4 py-2.5 flex items-center gap-2 
              transition-all duration-200 shadow-sm
              ${isSelected 
                ? "bg-primary text-primary-foreground font-medium shadow-md scale-105" 
                : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
