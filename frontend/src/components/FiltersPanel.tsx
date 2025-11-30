import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';

export interface FiltersState {
  budget: number[];
  region: string;
  radius: number;
  interests: string[];
  season: string;
}

interface Props {
  open: boolean;
  onChange: (filters: FiltersState) => void;
}

const interestOptions = ['Food', 'Trekking', 'Wellness', 'Festivals', 'Culture', 'Water'];

export default function FiltersPanel({ open, onChange }: Props) {
  const [filters, setFilters] = useState<FiltersState>({
    budget: [50, 300],
    region: '',
    radius: 25,
    interests: [],
    season: ''
  });

  const updateFilters = (patch: Partial<FiltersState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange(next);
  };

  const toggleInterest = (tag: string) => {
    const interests = filters.interests.includes(tag)
      ? filters.interests.filter((t) => t !== tag)
      : [...filters.interests, tag];
    updateFilters({ interests });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-panel mt-4 space-y-6 overflow-hidden p-6"
        >
          <div>
            <Label>Budget (₹)</Label>
            <Slider
              value={filters.budget}
              onValueChange={(value) => updateFilters({ budget: value })}
              min={20}
              max={500}
              step={10}
              className="mt-4"
            />
            <div className="mt-2 text-xs text-slate-300">
              {filters.budget[0]} - {filters.budget[1]} per day
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Region / City</Label>
              <Input
                placeholder="Konkan, Kumaon, Old Goa..."
                className="mt-2"
                value={filters.region}
                onChange={(e) => updateFilters({ region: e.target.value })}
              />
            </div>
            <div>
              <Label>Radius (km)</Label>
              <Input
                type="number"
                className="mt-2"
                value={filters.radius}
                onChange={(e) => updateFilters({ radius: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>Interests</Label>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {interestOptions.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={filters.interests.includes(tag)}
                    onCheckedChange={() => toggleInterest(tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Date / Season</Label>
            <Input
              type="month"
              className="mt-2"
              value={filters.season}
              onChange={(e) => updateFilters({ season: e.target.value })}
            />
          </div>
          <Button variant="secondary" onClick={() => updateFilters(filters)}>
            Apply Filters
          </Button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

