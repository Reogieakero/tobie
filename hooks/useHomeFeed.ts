import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 10;

export function useHomeFeed() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchItems = useCallback(async (isRefreshing = false) => {
    if (loading) return;
    try {
      setLoading(true);
      const currentPage = isRefreshing ? 0 : page;
      const start = currentPage * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url,
            shop_applications:shop_applications (
              shop_name,
              shop_slug,
              custom_link
            )
          )
        `)
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const processedData = isRefreshing ? shuffleArray(data) : data;
        setItems(prev => (isRefreshing ? processedData : [...prev, ...processedData]));
        setPage(currentPage + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, loading]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems(true);
  };

  useEffect(() => { fetchItems(true); }, []);

  return { items, setItems, loading, refreshing, refresh: handleRefresh, loadMore: fetchItems };
}