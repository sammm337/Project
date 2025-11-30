import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PackageCard, { PackageMeta } from '../components/PackageCard';

const heroPackages: PackageMeta[] = [
  {
    id: '1',
    title: 'Konkan Rice Field Homestay',
    description: 'Wake up to bullock carts, bhakri breakfasts, and private beach coves shared by fisherwomen cooperatives.',
    price: '₹2,400',
    tags: ['Konkan', 'Food', 'Village'],
    score: 0.93,
    vendorName: 'Sakhya Stays',
    images: ['/assets/placeholder.svg']
  },
  {
    id: '2',
    title: 'Upper Himalaya Regenerative Trek',
    description: 'Community-led trekking routes with herbal teas, yak-cheese tastings, and dusk meditation pods.',
    price: '₹5,900',
    tags: ['Himalaya', 'Trek', 'Wellness'],
    score: 0.88,
    vendorName: 'Jad Collective',
    images: ['/assets/placeholder.svg']
  }
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-brand-200">
            Hyper-local · agentic · offline
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Discover travel experiences curated by neighborhood vendors and agencies that know the alleys, festivals, and monsoon moods.
          </h1>
          <p className="text-lg text-slate-200">
            All intelligence runs locally. Voice notes become listings, agencies broadcast events, and travelers receive itineraries in seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/search">Search experiences</Link>
            </Button>
            <Button variant="secondary" asChild size="lg">
              <Link to="/vendor/dashboard">Vendor dashboard</Link>
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel space-y-6"
        >
          <h2 className="text-lg font-semibold">Live Pipeline Snapshot</h2>
          <Tabs defaultValue="vendor">
            <TabsList className="w-full">
              <TabsTrigger value="vendor" className="flex-1">
                Vendor
              </TabsTrigger>
              <TabsTrigger value="agency" className="flex-1">
                Agency
              </TabsTrigger>
            </TabsList>
            <TabsContent value="vendor" className="space-y-4 text-sm">
              <p className="text-slate-300">
                Bhakri stays voice note queued · transcription 78% complete · marketing copy awaiting approval.
              </p>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-300">
                  Next: embedding.created
                </p>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: '72%' }} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="agency" className="space-y-4 text-sm">
              <p className="text-slate-300">
                Panjim Jazz Crawl added 12 slots · bookings open for agencies via RabbitMQ events.
              </p>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-300">
                  Trending tags
                </p>
                <p>#Heritage #LiveMusic #Waterfront #LocalChefs</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Micro-itineraries from real vendors</h2>
          <p className="text-sm text-slate-300">Swipe through curated stays and events sourced locally.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {heroPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>
    </div>
  );
}

