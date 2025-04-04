"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// SearchBar Component
function SearchBar({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (filter: string) => void;
}) {
  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search conversations..."
          className="pl-8"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
    </div>
  );
}

export default SearchBar;
