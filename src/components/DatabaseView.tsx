import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, FileJson } from 'lucide-react';

export const DatabaseView: React.FC = () => {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<string>('libraryItems');

  const fetchDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database/raw');
      const data = await res.json();
      setDbData(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  if (loading || !dbData) {
    return (
      <div className="flex items-center justify-center py-20 text-indigo-400">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const tables = Object.keys(dbData);
  const tableData = dbData[activeTable];
  
  // Format data for tabular display if it's an array, else JSON
  const isArray = Array.isArray(tableData);
  const headers = isArray && tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar - Tables */}
      <div className="w-full md:w-64 bg-gray-50 dark:bg-black/80 border-r border-gray-200 dark:border-neutral-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-900 flex items-center space-x-2">
          <Database className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">asynx_data.enc</h3>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {tables.map(table => (
            <button
              key={table}
              onClick={() => setActiveTable(table)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                activeTable === table 
                  ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{table}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Table Data */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">{activeTable}</span>
            <span className="text-[10px] text-gray-500 font-semibold px-2 py-0.5 bg-gray-100 dark:bg-neutral-900 rounded-full">
              {isArray ? `${tableData.length} rows` : 'JSON Object'}
            </span>
          </div>
          <button 
            onClick={fetchDatabase}
            className="p-1.5 text-gray-500 hover:text-indigo-400 transition hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-white dark:bg-[#0a0a0a] p-0 m-0">
          {isArray ? (
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-gray-50 dark:bg-[#111] sticky top-0 z-10">
                <tr>
                  {headers.map(header => (
                    <th key={header} className="px-4 py-2 text-[10px] uppercase font-bold text-gray-500 border-b border-r border-gray-200 dark:border-neutral-800 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] text-gray-700 dark:text-gray-300">
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length || 1} className="p-8 text-center text-gray-500">
                      Table is empty
                    </td>
                  </tr>
                ) : (
                  tableData.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                      {headers.map(header => (
                        <td key={header} className="px-4 py-2 border-b border-r border-gray-100 dark:border-neutral-800 whitespace-nowrap max-w-[300px] truncate">
                          {typeof row[header] === 'object' 
                            ? JSON.stringify(row[header]) 
                            : String(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-4">
              <pre className="text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#111] p-4 rounded-xl overflow-x-auto border border-gray-200 dark:border-neutral-800">
                {JSON.stringify(tableData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
