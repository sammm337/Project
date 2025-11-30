import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, MessageCircle, Route } from 'lucide-react';

export interface PackageMeta {
  id: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
  score: number;
  vendorName: string;
  images: string[];
}

interface PackageCardProps {
  pkg: PackageMeta;
  onView?: (id: string) => void;
  onItinerary?: (id: string) => void;
  onMessage?: (id: string) => void;
}

export default function PackageCard({
  pkg,
  onView,
  onItinerary,
  onMessage
}: PackageCardProps) {
  const [activeImage, setActiveImage] = useState(0);
  const percent = Math.round(pkg.score * 100);
  const images = pkg.images?.length ? pkg.images : ['/assets/placeholder.svg'];

  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow"
    >
      <div className="price-ribbon">{pkg.price}</div>
      <div className="aspect-video overflow-hidden rounded-2xl">
        <motion.img
          key={images[activeImage]}
          src={images[activeImage]}
          alt={pkg.title}
          className="h-full w-full object-cover"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-emerald-300">
        {pkg.vendorName}
        <div className="flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              aria-label={`Show image ${index + 1}`}
              className={`h-2 w-6 rounded-full ${index === activeImage ? 'bg-white' : 'bg-white/30'}`}
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>
      </div>
      <h3 className="mt-3 text-xl font-semibold">{pkg.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-200">{pkg.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pkg.tags.map((tag) => (
          <Badge key={tag} color="brand">
            #{tag}
          </Badge>
        ))}
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-300">Match score · {percent}%</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => onView?.(pkg.id)}>
          <Heart className="mr-2 h-4 w-4" /> View
        </Button>
        <Button variant="ghost" onClick={() => onItinerary?.(pkg.id)}>
          <Route className="mr-2 h-4 w-4" /> Itinerary
        </Button>
        <Button onClick={() => onMessage?.(pkg.id)}>
          <MessageCircle className="mr-2 h-4 w-4" /> Message Host
        </Button>
      </div>
    </motion.article>
  );
}

