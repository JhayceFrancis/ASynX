import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Database, FileSpreadsheet } from 'lucide-react';
import { LibraryItem } from '../types';

interface PreImportModalProps {
  file: File;
  parsedData: any[];
  headers: string[];
  onClose: () => void;
  onImport: (items: any[]) => void;
}

export function PreImportModal({ file, parsedData, headers, onClose, onImport }: PreImportModalProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({
    title: '',
    type: '',
    status: '',
    episode: '',
    totalEpisodes: '',
    coverImage: ''
  });

  // Auto-guess mappings
  useEffect(() => {
    const guess = { ...mapping };
    headers.forEach(h => {
      const lower = h.toLowerCase();
      if (lower.includes('title') || lower === 'name') guess.title = h;
      else if (lower.includes('type') || lower === 'format') guess.type = h;
      else if (lower === 'status' || lower === 'state') guess.status = h;
      else if (lower === 'episode' || lower === 'progress' || lower === 'ep') guess.episode = h;
      else if (lower.includes('total') || lower === 'episodes' || lower === 'length') guess.totalEpisodes = h;
      else if (lower.includes('image') || lower.includes('poster') || lower.includes('cover') || lower.includes('art')) guess.coverImage = h;
    });
    setMapping(guess);
  }, [headers]);

  const internalFields = [
    { key: 'title', label: 'Media Title (Required)' },
    { key: 'type', label: 'Type (Anime/Drama)' },
    { key: 'status', label: 'Watch Status' },
    { key: 'episode', label: 'Current Episode' },
    { key: 'totalEpisodes', label: 'Total Episodes' },
    { key: 'coverImage', label: 'Poster / Image URL' }
  ];

  const handleConfirm = () => {
    if (!mapping.title) {
      alert("Media Title must be mapped to a column.");
      return;
    }

    const mappedItems = parsedData.map(row => {
      return {
        id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: row[mapping.title] || 'Unknown',
        type: (mapping.type && row[mapping.type]?.toString().toLowerCase().includes('drama')) ? 'Drama' : 'Anime',
        status: mapping.status ? (row[mapping.status] || 'Watching') : 'Watching',
        platforms: {
          anilist: { 
            status: mapping.status ? (row[mapping.status] || 'Watching') : 'Watching', 
            episode: mapping.episode ? parseInt(row[mapping.episode]) || 0 : 0 
          }
        },
        totalEpisodes: mapping.totalEpisodes ? parseInt(row[mapping.totalEpisodes]) || 0 : 0,
        coverImage: mapping.coverImage ? (row[mapping.coverImage] || '') : '',
        lastUpdated: new Date().toISOString()
      };
    });

    onImport(mappedItems);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-black">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pre-Import Verification</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {file.name} • {parsedData.length} records found
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Field Mapping */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-neutral-800">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Map Data Fields</h3>
              </div>
              <div className="space-y-3">
                {internalFields.map(field => (
                  <div key={field.key} className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-1/3">
                      {field.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-2/3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="">-- Ignore / Use Default --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 p-3 rounded-xl border border-blue-200 dark:border-blue-900/30 text-xs mt-4">
                <strong>Tip:</strong> Columns not mapped will be ignored. Required fields must be mapped to proceed.
              </div>
            </div>

            {/* Data Preview */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Visual Preview (First 3 Records)</h3>
              </div>
              <div className="space-y-3">
                {parsedData.slice(0, 3).map((row, i) => {
                  const mappedTitle = mapping.title ? row[mapping.title] : (row['title'] || row['name'] || 'Unknown Title');
                  const mappedType = mapping.type ? row[mapping.type] : (row['type'] || 'Anime');
                  const mappedStatus = mapping.status ? row[mapping.status] : (row['status'] || 'Watching');
                  const mappedEp = mapping.episode ? row[mapping.episode] : (row['episode'] || '0');
                  const mappedImg = mapping.coverImage ? row[mapping.coverImage] : null;

                  return (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#111]">
                      {mappedImg ? (
                        <img src={mappedImg} alt={mappedTitle} className="w-12 h-16 object-cover rounded shadow-sm border border-gray-200 dark:border-neutral-800" />
                      ) : (
                        <div className="w-12 h-16 rounded bg-gray-200 dark:bg-neutral-800 flex flex-col items-center justify-center text-gray-400">
                          <Database className="w-4 h-4 mb-1" />
                          <span className="text-[9px]">No img</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{mappedTitle}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-[10px] font-semibold">{mappedType}</span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[10px] font-semibold">{mappedStatus}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">Ep {mappedEp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-black flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Import {parsedData.length} Records</span>
          </button>
        </div>
      </div>
    </div>
  );
}
