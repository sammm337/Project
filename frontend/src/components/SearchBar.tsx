import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onToggleFilters?: () => void;
}

export default function SearchBar({ onSearch, onToggleFilters }: SearchBarProps) {
  const [query, setQuery] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel flex flex-col gap-3 p-5 md:flex-row md:items-center"
    >
      <div className="flex-1">
        <label className="text-xs uppercase tracking-wider text-slate-400">
          Explore micro adventures
        </label>
        <Input
          aria-label="Search travel experiences"
          placeholder="Search by vibe, festival, food, or region..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
          className="mt-2"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onToggleFilters}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button onClick={() => onSearch(query)}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </motion.div>
  );
}

