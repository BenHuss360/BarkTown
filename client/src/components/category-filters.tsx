import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilters({ 
  selectedCategory, 
  onSelectCategory 
}: CategoryFiltersProps) {
  const categories = [
    { id: "all", label: "All" },
    { id: "restaurant", label: "Restaurants" },
    { id: "cafe", label: "Cafés" },
    { id: "park", label: "Parks" },
    { id: "shop", label: "Shops" }
  ];
  
  return (
    <div className="flex overflow-x-auto whitespace-nowrap pb-2">
      {categories.map((category) => (
        <Button 
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          aria-label={`Show ${category.label.toLowerCase()} only`}
          aria-pressed={selectedCategory === category.id || (category.id === "all" && selectedCategory === null)}
          className={`mr-2 ios-button flex-shrink-0 ${
            selectedCategory === category.id || (category.id === "all" && selectedCategory === null)
              ? "bg-primary text-white"
              : "bg-muted text-foreground"
          }`}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
