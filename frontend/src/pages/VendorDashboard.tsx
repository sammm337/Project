import { useEffect, useState } from 'react';
import UploadWidget from '../components/UploadWidget';
import AgentPipelineTimeline, { AgentEvent } from '../components/AgentPipelineTimeline';
import { Button } from '../components/ui/button';
import { createPackage } from '../api/vendor';
import { toast } from '../components/ui/use-toast';
import { connectWebSocket, connectSSE } from '../utils/realtime';

const MOCK_EVENTS: AgentEvent[] = [
  {
    id: '1',
    stage: 'media.uploaded',
    timestamp: new Date().toISOString(),
    data: { filename: 'bhakri-stay.wav' }
  },
  {
    id: '2',
    stage: 'transcription.completed',
    timestamp: new Date().toISOString(),
    data: { lang: 'mr', confidence: 0.98, text: 'room facing rice fields, price 1500 rupees, wife makes bhakri' }
  },
  {
    id: '3',
    stage: 'marketing.generated',
    timestamp: new Date().toISOString(),
    data: {
      title: 'Serene rustic cottage with panoramic paddy views',
      copy: 'Wake up to bullock carts, bhakri breakfasts, and private beach coves steps away.',
      tags: ['Nature', 'VillageFood']
    }
  },
  {
    id: '4',
    stage: 'embedding.created',
    timestamp: new Date().toISOString()
  },
  {
    id: '5',
    stage: 'listing.created',
    timestamp: new Date().toISOString()
  }
];

export default function VendorDashboard() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [useMock, setUseMock] = useState(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (useMock) {
      setEvents(MOCK_EVENTS);
      return () => {
        cleanup?.();
      };
    }

    const closeWs = connectWebSocket<AgentEvent>(
      '/ws',
      (event) => {
        setEvents((prev) => [...prev, event]);
      },
      () => {
        cleanup = connectSSE<AgentEvent>('/events/stream', (event) => {
          setEvents((prev) => [...prev, event]);
        });
      }
    );

    return () => {
      closeWs?.();
      cleanup?.();
    };
  }, [useMock]);

  const handleUpload = async ({ audio, images }: { audio?: File; images?: File[] }) => {
    try {
      await createPackage({
        vendorId: 'demo-vendor',
        title: 'Voice note drop',
        description: 'Local capture',
        price: 3200,
        tags: ['Local'],
        audio,
        images
      });
      toast({
        title: 'Uploaded',
        description: 'Media sent to pipeline. Watch timeline.'
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-200">Vendor Console</p>
        <h2 className="text-3xl font-semibold">Upload once. Watch AI agents do the rest.</h2>
        <p className="text-sm text-slate-300">
          Audio → transcription → marketing → embedding → listing — all visible in real time via WebSocket or SSE.
        </p>
        <Button
          variant="secondary"
          className="mx-auto"
          onClick={() => setUseMock((prev) => !prev)}
        >
          {useMock ? 'Switch to live WebSocket' : 'Switch to mock mode'}
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <UploadWidget onUpload={handleUpload} />
        <AgentPipelineTimeline
          events={events}
          onApprove={() =>
            toast({ title: 'Listing approved', description: 'Sent back to agent' })
          }
          onRegenerate={() =>
            toast({ title: 'Re-generation requested', description: 'Marketing agent notified' })
          }
        />
      </div>
    </div>
  );
}

