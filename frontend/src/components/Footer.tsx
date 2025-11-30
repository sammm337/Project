import { Link } from 'react-router-dom';
import { Github, Radio, Waves } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-slate-950/80 py-10 text-sm text-slate-400">
      <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <Radio className="h-5 w-5 text-brand-400" />
            HyperLocal AI Travel Market
          </div>
          <p className="mt-2 max-w-md text-xs">
            Local-first travel discovery powered by cooperative vendor + agency agents,
            running entirely on your machine.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:text-right">
          <Link to="/vendor/dashboard" className="hover:text-white">
            Vendor Console
          </Link>
          <Link to="/agency/events" className="hover:text-white">
            Agency Events
          </Link>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
            <Github className="h-4 w-4" /> Repo (local fork)
          </a>
        </div>
        <div className="text-xs">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Built with React, Tailwind, shadcn/ui, Framer Motion.
          </div>
        </div>
      </div>
    </footer>
  );
}

