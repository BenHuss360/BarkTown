import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    // Clear search when closing
    if (isSearchOpen) {
      setQuery("");
      onSearch("");
    }
  };
  
  return (
    <div className="relative">
      {!isSearchOpen ? (
        // Search icon button when search is closed
        <button
          type="button"
          onClick={toggleSearch}
          aria-label="Open search"
          className="p-2 rounded-full bg-muted dark:bg-neutral-800"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </button>
      ) : (
        // Full search form when search is open
        <form onSubmit={handleSubmit} className="relative w-full flex items-center animate-in fade-in slide-in-from-right-5 duration-200">
          <input 
            type="search" 
            placeholder="Search for dog-friendly places" 
            aria-label="Search for dog-friendly places" 
            value={query}
            onChange={handleChange}
            autoFocus
            className="ios-input w-full bg-muted dark:bg-neutral-800 dark:text-neutral-100 text-foreground pl-10 pr-10"
          />
          <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={toggleSearch}
            aria-label="Close search"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </form>
      )}
    </div>
  );
}
