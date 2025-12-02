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
  coverImage?: string;
}

interface Props {
  event: EventMeta;
  onBook?: (id: string) => void;
  onDetails?: (id: string) => void;
}


export default function EventCard({ event, onBook, onDetails }: Props) {
  return (
    <motion.div whileHover={{ y: -5 }} className="glass-panel overflow-hidden flex flex-col group">
      {/* Image Section */}
      <div className="h-48 w-full bg-slate-900 relative overflow-hidden">
        {event.coverImage ? (
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-500">
                <CalendarHeart className="h-10 w-10 opacity-20" />
            </div>
        )}
        <div className="absolute top-2 right-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">
            {event.price}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs text-brand-300 uppercase tracking-wider font-semibold">
            <MapPin className="h-3 w-3" /> {event.city}
        </div>
        
        <h3 className="text-lg font-bold leading-tight group-hover:text-brand-300 transition-colors">{event.title}</h3>
        
        <p className="text-sm text-slate-400 line-clamp-2 flex-1">{event.summary}</p>
        
        <div className="flex flex-wrap gap-2 pt-2">
            {event.tags.map(t => <Badge key={t} variant="outline" className="text-[10px] bg-white/5 border-white/10">{t}</Badge>)}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
             <Button className="flex-1 h-9 text-xs" onClick={() => onBook?.(event.id)}>Book Now</Button>
             <Button variant="ghost" className="h-9 text-xs" onClick={() => onDetails?.(event.id)}>Details</Button>
        </div>
      </div>
    </motion.div>
  );
}
