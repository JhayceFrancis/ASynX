import { apiFetch as fetch } from '../apiFetch';
import  { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Check, X, Tv } from 'lucide-react';

interface ScrobbleCandidate {
  id: string;
  title: string;
  player: string;
  mediaType: string;
  currentEpisode: number;
  totalEpisodes: number;
  timestamp: string;
}

export function ScrobblePrompt() {
  const [candidates, setCandidates] = useState<ScrobbleCandidate[]>([]);

  useEffect(() => {
    const source = new EventSource('/api/daemon/stream');
    
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ScrobbleCandidate;
        setCandidates((prev) => [...prev, data]);
        
        // Auto-dismiss after 15 seconds if not interacted
        setTimeout(() => {
          setCandidates((prev) => prev.filter((c) => c.id !== data.id));
        }, 15000);
      } catch (err) {
        console.error("Failed to parse SSE daemon data", err);
      }
    };

    return () => {
      source.close();
    };
  }, []);

  const handleConfirm = async (candidate: ScrobbleCandidate) => {
    try {
      await fetch('/api/daemon/scrobble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: candidate.title,
          episode: candidate.currentEpisode,
          platform: candidate.player
        })
      });
      dismiss(candidate.id);
    } catch (err) {
      console.error(err);
    }
  };

  const dismiss = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {candidates.map((candidate) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="w-80 bg-black/90 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <PlayCircle className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  {candidate.player} Detected
                </div>
                <h4 className="text-sm font-semibold text-gray-100 truncate" title={candidate.title}>
                  {candidate.title}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ep {candidate.currentEpisode} / {candidate.totalEpisodes}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => handleConfirm(candidate)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                Scrobble
              </button>
              <button
                onClick={() => dismiss(candidate.id)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                Ignore
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
