import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PackageCard from '../components/PackageCard';
import { recommend } from '../api/traveler';
import { toast } from '../components/ui/use-toast';
import { motion } from 'framer-motion';

type Recommendation = {
  id: string;
  title: string;
  reason: string;
  price: string;
  tags: string[];
  images: string[];
};

export default function Recommendations() {
  const [vendorRecs, setVendorRecs] = useState<Recommendation[]>([]);
  const [agencyRecs, setAgencyRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const viaVendor = await recommend({ userId: 'demo', mode: 'via_vendor' });
      const viaAgency = await recommend({ userId: 'demo', mode: 'via_agency' });
      setVendorRecs((viaVendor?.results ?? []) as Recommendation[]);
      setAgencyRecs((viaAgency?.results ?? []) as Recommendation[]);

    } catch (error) {
      toast({
        title: 'Recommendations unavailable',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const renderRec = (rec: Recommendation) => (
    <motion.div key={rec.id} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
      <PackageCard
        pkg={{
          id: rec.id,
          title: rec.title,
          description: rec.reason,
          price: rec.price,
          score: 0.9,
          tags: rec.tags,
          vendorName: 'Local host',
          images: rec.images?.length ? rec.images : ['/assets/mock-konkan-1.jpg']
        }}
      />
      <p className="text-xs text-slate-300">Because {rec.reason}</p>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">Personalized picks</p>
        <h2 className="text-3xl font-semibold">AI traveler agent curates what matters to you</h2>
        <p className="text-sm text-slate-300">
          Local embeddings ensure your previous selections shape every new recommendation.
        </p>
      </div>
      <Tabs defaultValue="vendor">
        <TabsList className="mx-auto w-full max-w-md">
          <TabsTrigger value="vendor" className="flex-1">
            Via Vendors
          </TabsTrigger>
          <TabsTrigger value="agency" className="flex-1">
            Via Agencies
          </TabsTrigger>
        </TabsList>
        <TabsContent value="vendor">
          {loading && <p className="text-center text-slate-400">Loading combos...</p>}
          <div className="grid gap-6 md:grid-cols-2">{vendorRecs.map(renderRec)}</div>
        </TabsContent>
        <TabsContent value="agency">
          {loading && <p className="text-center text-slate-400">Loading agency picks...</p>}
          <div className="grid gap-6 md:grid-cols-2">{agencyRecs.map(renderRec)}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

