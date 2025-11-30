import { motion } from 'framer-motion';
import { CalendarHeart, MapPin, Ticket } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export interface EventMeta {
  id: string;
  title: string;
  city: string;
  date: string;
  price: string;
  summary: string;
  tags: string[];
}

interface Props {
  event: EventMeta;
  onBook?: (id: string) => void;
  onDetails?: (id: string) => void;
}

export default function EventCard({ event, onBook, onDetails }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="glass-panel relative flex flex-col gap-3"
    >
      <div className="price-ribbon">{event.price}</div>
      <div className="flex items-center gap-2 text-sm text-slate-200">
        <CalendarHeart className="h-4 w-4 text-brand-400" />
        {new Date(event.date).toLocaleDateString()}
      </div>
      <h3 className="text-xl font-semibold">{event.title}</h3>
      <p className="line-clamp-3 text-sm text-slate-300">{event.summary}</p>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MapPin className="h-4 w-4" /> {event.city}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {event.tags.map((tag) => (
          <Badge key={tag} color="accent">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Button className="flex-1" onClick={() => onBook?.(event.id)}>
          <Ticket className="mr-2 h-4 w-4" /> Book
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => onDetails?.(event.id)}>
          Details
        </Button>
      </div>
    </motion.div>
  );
}

