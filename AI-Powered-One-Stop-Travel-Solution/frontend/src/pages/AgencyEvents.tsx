import { useEffect, useState } from 'react';
import { listEvents, createEvent, bookEvent } from '../api/events';
import { uploadMedia } from '../api/media';
import { EventMeta } from '../components/EventCard';
import EventCard from '../components/EventCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import { Loader2, ImagePlus } from 'lucide-react';

interface EventForm {
  title: string;
  date: string;
  capacity: number;
  price: number;
  city: string;
  description: string;
  tags: string;
  coverImage: File | null;
}

const defaultForm: EventForm = {
  title: '',
  date: '',
  capacity: 20,
  price: 2500,
  city: '',
  description: '',
  tags: 'Culture,Music',
  coverImage: null
};

export default function AgencyEvents() {
  const [events, setEvents] = useState<EventMeta[]>([]);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    try {
      const response = await listEvents();
      setEvents(
        (response.events as any[])?.map((evt) => ({
          id: evt.id,
          title: evt.title,
          city: evt.city || 'Unknown',
          date: evt.date,
          price: `₹${evt.price}`,
          summary: evt.summary,
          tags: evt.tags,
          coverImage: evt.coverImage // Bind new field
        })) ?? []
      );
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load events', variant: 'destructive' });
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.date) {
        toast({ title: 'Missing fields', description: 'Please fill in required fields.', variant: 'destructive' });
        return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (form.coverImage) {
        imageUrl = await uploadMedia(form.coverImage);
      }

      await createEvent({
        title: form.title,
        date: form.date,
        capacity: form.capacity,
        price: form.price,
        city: form.city,
        description: form.description,
        tags: form.tags.split(',').map((t) => t.trim()),
        coverImage: imageUrl // Send URL to backend
      });

      toast({ title: 'Success', description: 'Event created successfully.' });
      setForm(defaultForm);
      loadEvents();
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, coverImage: e.target.files![0] }));
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <p className="text-sm font-bold tracking-widest text-brand-400 uppercase">Agency Dashboard</p>
        <h2 className="text-4xl font-extrabold tracking-tight">Manage Events</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Create exclusive travel experiences and manage bookings seamlessly.</p>
      </div>

      {/* Create Event Form */}
      <Card className="glass-panel border-white/10 overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/10">
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>Fill in the details to publish a new event.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label>Event Title</Label>
                <Input placeholder="e.g. Sunset Yoga by the Beach" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            
            <div className="space-y-2">
                <Label>City / Location</Label>
                <Input placeholder="e.g. Goa" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            </div>

            <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />
                </div>
            </div>

            <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the event..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>

            <div className="md:col-span-2 space-y-2">
                 <Label>Cover Image</Label>
                 <div className="flex items-center gap-4 p-4 border border-dashed border-white/20 rounded-lg bg-black/20">
                    <ImagePlus className="text-brand-400 h-6 w-6" />
                    <Input type="file" accept="image/*" onChange={handleFileChange} className="bg-transparent border-0 p-0 h-auto text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-600"/>
                 </div>
                 {form.coverImage && <p className="text-xs text-brand-300">Selected: {form.coverImage.name}</p>}
            </div>

            <div className="md:col-span-2 space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input placeholder="Adventure, Food, Culture" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
            </div>

            <Button className="md:col-span-2 w-full mt-4 bg-brand-500 hover:bg-brand-600" onClick={handleCreate} disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : 'Publish Event'}
            </Button>
        </CardContent>
      </Card>

      {/* Explore Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-2xl font-semibold">Explore Events</h3>
            <span className="text-sm text-slate-400">{events.length} active events</span>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
            <EventCard
                key={event.id}
                event={event}
                onBook={(id) => bookEvent(id, { name: 'Demo', guests: 1 })}
                onDetails={() => toast({ title: event.title, description: event.summary })}
            />
            ))}
            {!events.length && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <p>No events found. Create your first event above.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}