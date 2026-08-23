import React, { useState, useMemo } from 'react';
import { useBookmarks, Bookmark } from '../../hooks/useBookmarks';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkModal } from './BookmarkModal';
import { Plus, Search, Terminal, ArrowDownAZ, CalendarDays, Star, Filter } from 'lucide-react';

import { AppSettings } from '../../types';

export const BookmarkTab: React.FC<{ settings?: AppSettings }> = ({ settings }) => {
  const { bookmarks, isLoading, error, addBookmark, updateBookmark, deleteBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'score'>('date');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks;
    const q = searchQuery.toLowerCase();
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.url.toLowerCase().includes(q) || 
      b.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [bookmarks, searchQuery]);

  const handleAdd = () => {
    setEditingBookmark(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
    if (editingBookmark) {
      await updateBookmark(editingBookmark.id, data);
    } else {
      await addBookmark(data);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 font-sans">
      {/* Header & Controls */}
      <div className="max-w-7xl mx-auto mb-8 space-y-6">
        <div className="flex items-center space-x-3 text-cyan-400 border-b border-zinc-800 pb-4">
          <Terminal className="w-6 h-6" />
          <h1 className="text-2xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            {settings?.nexusTabName || 'Nexus_Bookmarks'}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="QUERY DATA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-cyan-400 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono placeholder:text-zinc-700 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-zinc-950 border border-zinc-800 text-zinc-400 pl-8 pr-8 py-2.5 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                  <option value="all">ALL_STATUS</option>
                  <option value="watching">WATCHING</option>
                  <option value="completed">COMPLETED</option>
                  <option value="plan_to_watch">PLAN_TO_WATCH</option>
                  <option value="paused">PAUSED</option>
                  <option value="dropped">DROPPED</option>
                </select>
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-zinc-950 border border-zinc-800 text-zinc-400 pl-8 pr-8 py-2.5 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                  <option value="date">SORT_DATE</option>
                  <option value="title">SORT_TITLE</option>
                  <option value="score">SORT_SCORE</option>
                </select>
                {sortBy === 'date' && <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />}
                {sortBy === 'title' && <ArrowDownAZ className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />}
                {sortBy === 'score' && <Star className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center space-x-2 bg-violet-500/10 text-violet-400 border border-violet-500/50 hover:bg-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] text-xs font-mono uppercase transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Inject_Node</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-sm flex items-center space-x-2">
          <span>ERR_CONNECTION:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="max-w-7xl mx-auto flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
        </div>
      ) : (
        /* Grid */
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBookmarks.map(bookmark => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={handleEdit}
              onDelete={deleteBookmark}
            />
          ))}
          
          {filteredBookmarks.length === 0 && !error && (
            <div className="col-span-full py-20 text-center font-mono text-zinc-600 border border-dashed border-zinc-800">
              NO_DATA_FOUND
            </div>
          )}
        </div>
      )}

      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingBookmark}
      />
    </div>
  );
};
