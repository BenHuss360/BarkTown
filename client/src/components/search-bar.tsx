import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input 
        type="search" 
        placeholder="Search for dog-friendly places" 
        aria-label="Search for dog-friendly places" 
        value={query}
        onChange={handleChange}
        className="ios-input w-full bg-muted dark:bg-neutral-800 dark:text-neutral-100 text-foreground pl-10"
      />
      <Search className="h-5 w-5 absolute left-3 top-3.5 text-muted-foreground" />
    </form>
  );
}
