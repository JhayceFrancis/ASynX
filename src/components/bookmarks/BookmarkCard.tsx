import React from 'react';
import { Bookmark } from '../../hooks/useBookmarks';
import { Edit3, Trash2, ExternalLink, PlayCircle, CheckCircle2, ListMinus, PauseCircle, XCircle } from 'lucide-react';

interface Props {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  watching: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  completed: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10',
  plan_to_watch: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
  paused: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  dropped: 'text-red-400 border-red-400/30 bg-red-400/10',
};

const StatusIcon = ({ status }: { status?: string }) => {
  switch (status) {
    case 'watching': return <PlayCircle className="w-3 h-3" />;
    case 'completed': return <CheckCircle2 className="w-3 h-3" />;
    case 'plan_to_watch': return <ListMinus className="w-3 h-3" />;
    case 'paused': return <PauseCircle className="w-3 h-3" />;
    case 'dropped': return <XCircle className="w-3 h-3" />;
    default: return null;
  }
};

export const BookmarkCard: React.FC<Props> = ({ bookmark, onEdit, onDelete }) => {
  return (
    <div className="bg-zinc-950 border border-cyan-500/30 hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] rounded-none p-0 flex flex-col group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      
      {/* Top section with optional image */}
      {bookmark.image && (
        <div className="h-32 w-full overflow-hidden relative">
          <img src={bookmark.image} alt={bookmark.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-100 tracking-wide pr-8 leading-tight">{bookmark.title}</h3>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 z-20 bg-zinc-950/80 p-1 rounded">
            <button onClick={() => onEdit(bookmark)} className="text-violet-500 hover:text-violet-400 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500 p-1" aria-label="Edit bookmark">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(bookmark.id)} className="text-red-500 hover:text-red-400 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500 p-1" aria-label="Delete bookmark">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* URL */}
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 mb-3 truncate w-full group/link focus:outline-none focus:ring-1 focus:ring-cyan-500 p-1 -ml-1">
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate border-b border-transparent group-hover/link:border-cyan-400/50 transition-colors">{bookmark.url}</span>
        </a>

        {/* KaraKeep Metadata */}
        {(bookmark.status || bookmark.progress !== undefined || bookmark.score !== undefined || bookmark.mediaType) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {bookmark.status && (
              <span className={`flex items-center space-x-1 font-mono text-[10px] uppercase px-1.5 py-0.5 border rounded-sm ${statusColors[bookmark.status]}`}>
                <StatusIcon status={bookmark.status} />
                <span>{bookmark.status.replace('_', ' ')}</span>
              </span>
            )}
            {bookmark.progress !== undefined && bookmark.progress > 0 && (
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm">
                EP {bookmark.progress}
              </span>
            )}
            {bookmark.score !== undefined && bookmark.score > 0 && (
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded-sm">
                ★ {bookmark.score}
              </span>
            )}
            {bookmark.mediaType && (
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-sm">
                {bookmark.mediaType}
              </span>
            )}
          </div>
        )}

        {bookmark.description && (
          <p className="text-xs text-zinc-400 mb-4 line-clamp-2">
            {bookmark.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {bookmark.tags?.map(tag => (
              <span key={tag} className="font-mono text-[10px] uppercase px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-sm">
                {tag}
              </span>
            ))}
          </div>
          {bookmark.createdAt && (
             <span className="font-mono text-[10px] text-zinc-600 shrink-0 ml-2">
               {new Date(bookmark.createdAt).toLocaleDateString()}
             </span>
          )}
        </div>
      </div>
    </div>
  );
};
