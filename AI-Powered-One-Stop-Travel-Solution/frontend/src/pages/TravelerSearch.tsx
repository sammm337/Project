import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import SearchBar from '../components/SearchBar';
import FiltersPanel, { FiltersState } from '../components/FiltersPanel';
import PackageCard from '../components/PackageCard';
import EventCard from '../components/EventCard';
import { semanticSearch } from '../api/search';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';

export default function TravelerSearch() {
  const [mode, setMode] = useState<'via_vendor' | 'via_agency'>('via_vendor');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FiltersState | null>(null);

  const runSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await semanticSearch(
        {
          q: query,
          mode,
          filters: {
            ...filters,
            budget: filters?.budget,
            radius_km: filters?.radius
          }
        },
        false // Keep this false for real backend
      );
      
      // FIX: Use response.data and fallback to empty array if undefined
      setResults(response.data || []);
      
    } catch (error) {
      console.error("Search Error:", error); // Helpful for debugging
      toast({
        title: 'Search failed',
        description: (error as Error).message,
        variant: 'destructive'
      });
      setResults([]); // Ensure results is an array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">Traveler Search</p>
        <h2 className="text-3xl font-semibold">Two pathways to find the right micro experience</h2>
        <p className="text-sm text-slate-300">
          Search directly with vendors or via agency-curated events. Dual agent modes ensure contextual matches.
        </p>
      </div>
      <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
        <TabsList className="w-full max-w-lg mx-auto">
          <TabsTrigger value="via_vendor" className="flex-1">
            Via Vendor
          </TabsTrigger>
          <TabsTrigger value="via_agency" className="flex-1">
            Via Agency
          </TabsTrigger>
        </TabsList>
        <TabsContent value="via_vendor">
          <SearchBar
            onSearch={runSearch}
            onToggleFilters={() => setFiltersOpen((prev) => !prev)}
          />
        </TabsContent>
        <TabsContent value="via_agency">
          <SearchBar
            onSearch={runSearch}
            onToggleFilters={() => setFiltersOpen((prev) => !prev)}
          />
        </TabsContent>
      </Tabs>
      <FiltersPanel open={filtersOpen} onChange={setFilters} />
      <div className="flex items-center justify-between text-sm text-slate-300">
        {/* Safety check: ensure results is defined before accessing length */}
        <span>{(results || []).length} results</span>
        <Button variant="ghost" onClick={() => runSearch('')}>
          Refresh
        </Button>
      </div>
      {loading && <p className="text-center text-slate-400">Searching...</p>}
      <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Safety check: ensure results is an array before mapping */}
        {Array.isArray(results) && results.map((item) =>
          mode === 'via_vendor' ? (
            <PackageCard
              key={item.id}
              pkg={{
                id: item.id,
                title: item.title,
                description: item.description,
                price: `₹${item.price}`,
                tags: item.tags ?? [],
                score: item.score ?? 0.8,
                vendorName: item.vendorName ?? 'Local Host',
                images: item.images?.length ? item.images : ['/assets/mock-konkan-1.jpg']
              }}
            />
          ) : (
            <EventCard
              key={item.id}
              event={{
                id: item.id,
                title: item.title,
                city: item.city ?? 'Flexible',
                date: item.date ?? new Date().toISOString(),
                price: `₹${item.price ?? 2000}`,
                summary: item.description,
                tags: item.tags ?? []
              }}
            />
          )
        )}
      </motion.div>
      {!loading && (!results || results.length === 0) && (
        <p className="text-center text-slate-400">No experiences yet — try another vibe.</p>
      )}
    </div>
  );
}