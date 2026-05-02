import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 10;

export function useHomeFeed(showOwnProducts: boolean) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    getSession();
  }, []);

  const fetchItems = useCallback(async (isRefreshing = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const currentPage = isRefreshing ? 0 : page;
      const start = currentPage * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('items')
        .select(`
          *,
          profiles:user_id (
            first_name, last_name, avatar_url,
            shop_applications:shop_applications (shop_name, shop_slug, custom_link)
          )
        `)
        .range(start, end)
        .order('created_at', { ascending: false });

      if (!showOwnProducts && currentUserId) {
        query = query.neq('user_id', currentUserId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const processedData = shuffleArray(data);
        setItems(prev => (isRefreshing ? processedData : [...prev, ...processedData]));
        setPage(currentPage + 1);
      } else {
        if (!isRefreshing && items.length > 0) {
          setPage(0);
          setTimeout(() => fetchItems(false), 10);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, loading, showOwnProducts, currentUserId, items.length]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchItems(true);
  };

  useEffect(() => {
    setItems([]);
    setPage(0);
    fetchItems(true);
  }, [showOwnProducts, currentUserId]);

  return { items, setItems, loading, refreshing, refresh: handleRefresh, loadMore: () => fetchItems(false) };
}