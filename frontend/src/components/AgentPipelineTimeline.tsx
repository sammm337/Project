import { motion } from 'framer-motion';
import {
  AudioWaveform,
  FileAudio2,
  PenSquare,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export type PipelineStage =
  | 'media.uploaded'
  | 'transcription.completed'
  | 'marketing.generated'
  | 'embedding.created'
  | 'listing.created';

export interface AgentEvent {
  id: string;
  stage: PipelineStage;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface AgentPipelineTimelineProps {
  events: AgentEvent[];
  onRegenerate?: () => void;
  onApprove?: () => void;
}

const stageIcons: Record<PipelineStage, JSX.Element> = {
  'media.uploaded': <UploadCloud className="h-5 w-5 text-brand-300" />,
  'transcription.completed': <AudioWaveform className="h-5 w-5 text-emerald-300" />,
  'marketing.generated': <PenSquare className="h-5 w-5 text-amber-300" />,
  'embedding.created': <Sparkles className="h-5 w-5 text-purple-300" />,
  'listing.created': <FileAudio2 className="h-5 w-5 text-cyan-300" />
};

export default function AgentPipelineTimeline({
  events,
  onApprove,
  onRegenerate
}: AgentPipelineTimelineProps) {
  return (
    <section className="glass-panel space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Pipeline</h3>
          <p className="text-xs text-slate-300">
            Live updates from RabbitMQ bridge · vendor-visible
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onRegenerate}>
            Re-generate marketing
          </Button>
          <Button onClick={onApprove}>Approve listing</Button>
        </div>
      </div>
      <div className="space-y-4">
        {events.length === 0 && (
          <p className="text-sm text-slate-400">
            Waiting for agent events... check WebSocket bridge.
          </p>
        )}
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 rounded-3xl bg-white/5 p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              {stageIcons[event.stage]}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {idx + 1}. {event.stage.replace('.', ' · ')}
                <Badge color="brand">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
              {event.stage === 'transcription.completed' && event.data && (
                <p className="text-xs text-slate-300">
                  lang: {event.data.lang as string} · confidence:{' '}
                  {Number(event.data.confidence ?? 0).toFixed(2)}
                  <br />
                  {event.data.text as string}
                </p>
              )}
              {event.stage === 'marketing.generated' && event.data && (
                <div className="text-xs text-slate-200">
                  <p className="font-semibold">{event.data.title as string}</p>
                  <p className="text-slate-300">{event.data.copy as string}</p>
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px] uppercase tracking-wider">
                    {(event.data.tags as string[])?.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {event.stage === 'listing.created' && (
                <p className="text-xs text-emerald-300">Listing published locally.</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

