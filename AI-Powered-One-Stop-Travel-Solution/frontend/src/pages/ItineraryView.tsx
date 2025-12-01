import { useState } from 'react';
import { itinerary } from '../api/traveler';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from '../components/ui/use-toast';

interface DayPlan {
  day: number;
  title: string;
  blocks: { time: string; activity: string; location: string }[];
}

export default function ItineraryView() {
  const [destination, setDestination] = useState('');
  const [daysCount, setDaysCount] = useState(3);
  const [budget, setBudget] = useState('Moderate');
  const [interests, setInterests] = useState('');
  const [generatedDays, setGeneratedDays] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!destination) {
      toast({ title: 'Missing Information', description: 'Please enter a destination.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await itinerary({ 
        destination, 
        days: daysCount, 
        budget, 
        interests 
      });
      setGeneratedDays(response.days as DayPlan[]);
      toast({ title: 'Success', description: 'Itinerary generated successfully!' });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">Travel Agent</p>
        <h2 className="text-3xl font-semibold">AI Travel Planner</h2>
        <p className="text-sm text-slate-300">
          Enter your destination and preferences, and our AI will craft a personalized day-by-day plan.
        </p>
      </div>

      <div className="glass-panel p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="space-y-2">
            <Label>Destination</Label>
            <Input 
              placeholder="e.g., Paris, Tokyo, Bali" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (Days)</Label>
            <Input
              type="number"
              min={1}
              max={14}
              value={daysCount}
              onChange={(e) => setDaysCount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Budget</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Budget">Budget Friendly</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interests (Optional)</Label>
            <Input 
              placeholder="e.g., History, Food, Adventure"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => {
            setDestination('');
            setDaysCount(3);
            setInterests('');
            setGeneratedDays([]);
          }}>
            Clear
          </Button>
          <Button onClick={generate} disabled={loading} className="min-w-[140px]">
            {loading ? 'Generating...' : 'Generate Plan'}
          </Button>
        </div>
      </div>

      {generatedDays.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Your Itinerary for {destination}</h3>
            <Button variant="secondary" onClick={downloadPdf}>
              Download / Print PDF
            </Button>
          </div>

          <div className="grid gap-6">
            {generatedDays.map((day) => (
              <div key={day.day} className="glass-panel p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold select-none pointer-events-none">
                  {day.day}
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-baseline gap-4 mb-6 border-b border-white/10 pb-4">
                    <span className="text-xl font-bold text-brand-400">Day {day.day}</span>
                    <h4 className="text-lg font-medium">{day.title}</h4>
                  </div>

                  <div className="space-y-4">
                    {day.blocks.map((block, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-brand-500/30 transition-colors">
                        <div className="w-24 flex-shrink-0 pt-1 text-brand-200 font-mono text-sm">
                          {block.time}
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-white">{block.activity}</p>
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            📍 {block.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}