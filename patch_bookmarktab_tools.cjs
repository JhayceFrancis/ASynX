const fs = require('fs');
let content = fs.readFileSync('src/components/bookmarks/BookmarkTab.tsx', 'utf8');

const targetImports = `import { Plus, Search, Terminal } from 'lucide-react';`;
const replaceImports = `import { Plus, Search, Terminal, ArrowDownAZ, CalendarDays, Star, Filter } from 'lucide-react';`;

const targetState = `  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);`;
const replaceState = `  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'score'>('date');
  const [statusFilter, setStatusFilter] = useState<string>('all');`;

const targetFiltered = `  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks;
    const q = searchQuery.toLowerCase();
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      b.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [bookmarks, searchQuery]);`;

const replaceFiltered = `  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];
    
    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }
    
    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.tags?.some(t => t.toLowerCase().includes(q)) ||
        b.description?.toLowerCase().includes(q)
      );
    }
    
    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      } else {
        // date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return result;
  }, [bookmarks, searchQuery, sortBy, statusFilter]);`;

const targetUI = `        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96 group">`;

const replaceUI = `        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
`;

content = content.replace(targetImports, replaceImports);
content = content.replace(targetState, replaceState);
content = content.replace(targetFiltered, replaceFiltered);
content = content.replace(targetUI, replaceUI);

fs.writeFileSync('src/components/bookmarks/BookmarkTab.tsx', content);
