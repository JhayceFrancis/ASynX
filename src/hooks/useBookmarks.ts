import { apiFetch as fetch } from '../apiFetch';
import { useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  image?: string;
  status?: 'watching' | 'completed' | 'plan_to_watch' | 'paused' | 'dropped';
  progress?: number;
  score?: number;
  mediaType?: 'Anime TV Series' | 'Anime Film' | 'Film' | 'TV Series' | 'Anime Special' | 'Drama';
  karakeepId?: string;
  tags: string[];
  createdAt: string;
}

// TODO: Replace with your existing Karakeep endpoint variables
const API_BASE_URL = '/api'; 

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookmarks`);
      if (!res.ok) throw new Error('Failed to fetch bookmarks');
      const data = await res.json();
      setBookmarks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmark),
      });
      if (!res.ok) throw new Error('Failed to add bookmark');
      await fetchBookmarks(); // Optimistic refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateBookmark = async (id: string, bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmark),
      });
      if (!res.ok) throw new Error('Failed to update bookmark');
      await fetchBookmarks(); // Optimistic refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete bookmark');
      await fetchBookmarks(); // Optimistic refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    bookmarks, 
    isLoading, 
    error, 
    addBookmark, 
    updateBookmark, 
    deleteBookmark, 
    refresh: fetchBookmarks 
  };
}
