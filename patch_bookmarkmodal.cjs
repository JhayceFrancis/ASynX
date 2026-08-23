const fs = require('fs');
const content = `import React, { useState, useEffect } from 'react';
import { Bookmark } from '../../hooks/useBookmarks';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Bookmark | null;
}

export const BookmarkModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<any>('');
  const [progress, setProgress] = useState<number | ''>('');
  const [score, setScore] = useState<number | ''>('');
  const [mediaType, setMediaType] = useState<any>('');
  const [karakeepId, setKarakeepId] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setTags(initialData.tags?.join(', ') || '');
      setDescription(initialData.description || '');
      setImage(initialData.image || '');
      setStatus(initialData.status || '');
      setProgress(initialData.progress || '');
      setScore(initialData.score || '');
      setMediaType(initialData.mediaType || '');
      setKarakeepId(initialData.karakeepId || '');
      setShowAdvanced(!!(initialData.status || initialData.score || initialData.progress || initialData.mediaType || initialData.karakeepId));
    } else {
      setTitle('');
      setUrl('');
      setTags('');
      setDescription('');
      setImage('');
      setStatus('');
      setProgress('');
      setScore('');
      setMediaType('');
      setKarakeepId('');
      setShowAdvanced(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        title,
        url,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        description: description || undefined,
        image: image || undefined,
        status: status || undefined,
        progress: progress === '' ? undefined : Number(progress),
        score: score === '' ? undefined : Number(score),
        mediaType: mediaType || undefined,
        karakeepId: karakeepId || undefined
      });
      onClose();
    } catch (error) {
      console.error("Failed to save bookmark", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-cyan-500/50 w-full max-w-xl shadow-[0_0_30px_rgba(34,211,238,0.15)] rounded-none relative my-8">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-widest">
            {initialData ? 'Edit_Bookmark' : 'New_Bookmark'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-cyan-400 transition-colors focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block font-mono text-xs text-violet-400 mb-1.5 uppercase">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono placeholder:text-zinc-700"
                placeholder="e.g. Cyberdeck Build Guide"
              />
            </div>
            
            <div>
              <label className="block font-mono text-xs text-violet-400 mb-1.5 uppercase">URL</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-cyan-400 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono placeholder:text-zinc-700"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-violet-400 mb-1.5 uppercase">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono placeholder:text-zinc-700 min-h-[80px]"
                placeholder="Short description..."
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-violet-400 mb-1.5 uppercase">Cover Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono placeholder:text-zinc-700"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-violet-400 mb-1.5 uppercase">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono placeholder:text-zinc-700"
                placeholder="hardware, reference, tutorial"
              />
            </div>
            
            <div className="border-t border-zinc-800 pt-4">
              <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 font-mono text-xs text-cyan-500 hover:text-cyan-400 transition-colors uppercase focus:outline-none"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>KaraKeep Metadata (Optional)</span>
              </button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 p-4 border border-zinc-800/50">
                <div>
                  <label className="block font-mono text-[10px] text-zinc-400 mb-1.5 uppercase">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 transition-all font-mono"
                  >
                    <option value="">None</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="plan_to_watch">Plan to Watch</option>
                    <option value="paused">Paused</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-mono text-[10px] text-zinc-400 mb-1.5 uppercase">Media Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 transition-all font-mono"
                  >
                    <option value="">None</option>
                    <option value="Anime TV Series">Anime TV Series</option>
                    <option value="Anime Film">Anime Film</option>
                    <option value="TV Series">TV Series</option>
                    <option value="Film">Film</option>
                    <option value="Drama">Drama</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-zinc-400 mb-1.5 uppercase">Episode/Progress</label>
                  <input
                    type="number"
                    min="0"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-zinc-400 mb-1.5 uppercase">Score (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 transition-all font-mono"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block font-mono text-[10px] text-zinc-400 mb-1.5 uppercase">KaraKeep Source ID</label>
                  <input
                    type="text"
                    value={karakeepId}
                    onChange={(e) => setKarakeepId(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 transition-all font-mono placeholder:text-zinc-700"
                    placeholder="e.g. kkp_123456"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-gray-100 transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] text-xs font-mono uppercase transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save_Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`;
fs.writeFileSync('src/components/bookmarks/BookmarkModal.tsx', content);
