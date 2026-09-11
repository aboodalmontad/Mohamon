import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSync<T extends { id: string; is_dirty?: boolean; updated_at: string }>(
  tableName: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(() => {
    const saved = localStorage.getItem(`law_office_${tableName}`);
    return saved ? JSON.parse(saved) : initialData;
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(`law_office_${tableName}`, JSON.stringify(data));
  }, [data, tableName]);

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return;

    setIsSyncing(true);
    try {
      // 1. Push dirty records
      const dirtyRecords = data.filter(r => r.is_dirty);
      for (const record of dirtyRecords) {
        const { is_dirty, ...cleanRecord } = record;
        const { error } = await (supabase
          .from(tableName) as any)
          .upsert(cleanRecord);
        
        if (!error) {
          setData(prev => prev.map(r => r.id === record.id ? { ...r, is_dirty: false } : r));
        }
      }

      // 2. Fetch latest from server
      const { data: serverData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('updated_at', { ascending: false });

      if (!fetchError && serverData) {
        const typedServerData = serverData as T[];
        // Simple merge: server wins unless local is dirty
        setData(prev => {
          const localMap = new Map<string, T>(prev.map(r => [r.id, r]));
          const merged: T[] = typedServerData.map(serverItem => {
            const localItem = localMap.get(serverItem.id);
            if (localItem && localItem.is_dirty) return localItem;
            return serverItem;
          });
          
          // Add local items not on server yet (newly created offline)
          const serverIds = new Set(typedServerData.map(r => r.id));
          prev.forEach(localItem => {
            if (!serverIds.has(localItem.id)) {
              merged.push(localItem);
            }
          });

          return merged;
        });
      }
    } catch (err) {
      console.error(`Sync error for ${tableName}:`, err);
    } finally {
      setIsSyncing(false);
    }
  }, [data, isOnline, isSyncing, tableName]);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(sync, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, sync]);

  const addItem = (item: T) => {
    setData(prev => [{ ...item, is_dirty: true, updated_at: new Date().toISOString() }, ...prev]);
  };

  const updateItem = (id: string, updates: Partial<T>) => {
    setData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, is_dirty: true, updated_at: new Date().toISOString() } 
        : item
    ));
  };

  const deleteItem = async (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
    
    // Track deletion for sync
    const deletions = JSON.parse(localStorage.getItem('law_office_sync_deletions') || '[]');
    deletions.push({
      id: crypto.randomUUID(),
      table_name: tableName,
      record_id: id,
      deleted_at: new Date().toISOString()
    });
    localStorage.setItem('law_office_sync_deletions', JSON.stringify(deletions));

    if (isOnline) {
      await supabase.from(tableName).delete().eq('id', id);
    }
  };

  return { data, addItem, updateItem, deleteItem, sync, isSyncing, isOnline };
}
