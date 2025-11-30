import { useEffect, useState } from 'react';
import { listEvents, createEvent, bookEvent } from '../api/events';
import { EventMeta } from '../components/EventCard';
import EventCard from '../components/EventCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/use-toast';

interface EventForm {
  title: string;
  date: string;
  capacity: number;
  price: number;
  city: string;
  tags: string;
}

const defaultForm: EventForm = {
  title: '',
  date: '',
  capacity: 20,
  price: 2500,
  city: '',
  tags: 'Culture,Music'
};

export default function AgencyEvents() {
  const [events, setEvents] = useState<EventMeta[]>([]);
  const [form, setForm] = useState(defaultForm);

  const loadEvents = async () => {
    try {
      const response = await listEvents();
      setEvents(
        (response.events as any[])?.map((evt) => ({
          id: evt.id ?? `local-${Math.random().toString(36).slice(2)}`,
          title: evt.title,
          city: evt.city ?? 'Unknown',
          date: evt.date ?? new Date().toISOString(),
          price: `₹${evt.price ?? 2000}`,
          summary: evt.summary ?? 'Community-led event',
          tags: evt.tags ?? ['Local', 'Culture']
        })) ?? []
      );
    } catch (error) {
      toast({
        title: 'Unable to load events',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async () => {
    try {
      await createEvent({
        title: form.title,
        date: form.date,
        capacity: form.capacity,
        price: form.price,
        city: form.city,
        tags: form.tags.split(',').map((t) => t.trim())
      });
      toast({ title: 'Event created', description: 'Streamed to agencies.' });
      setForm(defaultForm);
      loadEvents();
    } catch (error) {
      toast({
        title: 'Failed to create event',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  const handleBook = async (id: string) => {
    try {
      await bookEvent(id, { name: 'Demo agency', guests: 2 });
      toast({ title: 'Booked', description: 'Slots reserved.' });
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">Agency</p>
        <h2 className="text-3xl font-semibold">Events & Bookings</h2>
      </div>
      <div className="glass-panel grid gap-4 md:grid-cols-3">
        {(['title', 'city', 'date'] as const).map((field) => (
          <div key={field}>
            <Label className="capitalize">{field}</Label>
            <Input
              type={field === 'date' ? 'datetime-local' : 'text'}
              className="mt-2"
              value={form[field]}
              onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
            />
          </div>
        ))}
        <div>
          <Label>Capacity</Label>
          <Input
            type="number"
            className="mt-2"
            value={form.capacity}
            onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label>Price</Label>
          <Input
            type="number"
            className="mt-2"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
          />
        </div>
        <div className="md:col-span-3">
          <Label>Tags</Label>
          <Input
            className="mt-2"
            value={form.tags}
            onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
          />
        </div>
        <Button className="md:col-span-3" onClick={handleCreate}>
          Create Event
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onBook={handleBook}
            onDetails={() => toast({ title: event.title, description: event.summary })}
          />
        ))}
      </div>
      {!events.length && <p className="text-center text-slate-400">No events yet.</p>}
    </div>
  );
}

