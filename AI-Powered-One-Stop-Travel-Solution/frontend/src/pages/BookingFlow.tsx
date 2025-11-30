import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { bookEvent } from '../api/events';
import { toast } from '../components/ui/use-toast';
import { motion } from 'framer-motion';

export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    eventId: 'mock-1',
    name: '',
    guests: 2,
    notes: ''
  });

  const next = () => setStep((prev) => Math.min(3, prev + 1));
  const prev = () => setStep((prev) => Math.max(1, prev - 1));

  const confirm = async () => {
    try {
      await bookEvent(form.eventId, { name: form.name, guests: form.guests });
      toast({ title: 'Booking confirmed', description: 'Vendor notified locally.' });
    } catch (error) {
      toast({
        title: 'Booking error',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">Booking</p>
        <h2 className="text-3xl font-semibold">Agency booking flow</h2>
      </div>
      <div className="glass-panel space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-300">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex-1 rounded-full px-3 py-1 text-center ${step === i ? 'bg-brand-500 text-white' : 'bg-white/10'}`}>
              Step {i}
            </div>
          ))}
        </div>
        <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {step === 1 && (
            <>
              <Label>Select Event ID</Label>
              <Input value={form.eventId} onChange={(e) => setForm((prev) => ({ ...prev, eventId: e.target.value }))} />
            </>
          )}
          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Agency contact</Label>
                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <Label>Guests</Label>
                <Input
                  type="number"
                  value={form.guests}
                  onChange={(e) => setForm((prev) => ({ ...prev, guests: Number(e.target.value) }))}
                />
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
              <p className="mt-2 text-xs text-slate-300">Booking summary will be sent to vendor and traveler agent.</p>
            </div>
          )}
        </motion.div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 1}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button onClick={confirm}>Confirm booking</Button>
          )}
        </div>
      </div>
    </div>
  );
}

