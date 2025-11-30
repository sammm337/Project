import { useRef, useState } from 'react';
import { Upload, Waves, ImagePlus } from 'lucide-react';
import { Button } from './ui/button';

interface UploadWidgetProps {
  onUpload: (payload: { audio?: File; images?: File[] }) => void;
}

export default function UploadWidget({ onUpload }: UploadWidgetProps) {
  const audioRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [audioName, setAudioName] = useState('');
  const [imageCount, setImageCount] = useState(0);

  const handleUpload = () => {
    const audio = audioRef.current?.files?.[0];
    const images = imageRef.current?.files
      ? Array.from(imageRef.current.files)
      : undefined;
    onUpload({ audio, images });
  };

  return (
    <div className="glass-panel space-y-4">
      <div>
        <label className="text-sm text-slate-400">Voice Note (WAV/MP3)</label>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-white/25 bg-slate-900/60 p-4">
          <Waves className="h-6 w-6 text-brand-400" />
          <input
            ref={audioRef}
            type="file"
            accept="audio/*"
            className="flex-1 text-xs"
            onChange={(e) => setAudioName(e.target.files?.[0]?.name ?? '')}
          />
          <span className="text-xs text-slate-300">{audioName || 'No file selected'}</span>
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-400">Images</label>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-white/25 bg-slate-900/60 p-4">
          <ImagePlus className="h-6 w-6 text-emerald-400" />
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            multiple
            className="flex-1 text-xs"
            onChange={(e) => setImageCount(e.target.files?.length ?? 0)}
          />
          <span className="text-xs text-slate-300">
            {imageCount ? `${imageCount} selected` : 'Add 3-5 shots'}
          </span>
        </div>
      </div>
      <Button className="w-full" onClick={handleUpload}>
        <Upload className="mr-2 h-4 w-4" /> Upload to pipeline
      </Button>
    </div>
  );
}

