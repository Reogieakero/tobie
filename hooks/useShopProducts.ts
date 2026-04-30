import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import { isActuallyLive, isActuallyScheduled } from './useItemStatus';

export type FilterType = 'all' | 'scheduled' | 'auction' | 'posted' | 'fast_flip';

export function useShopProducts() {
  const [items, setItems] = useState<any[]>([]);
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // 1-second global tick so computed filters stay fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let channel: any = null;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await fetchShopContent(user.id);

      channel = supabase
        .channel(`shop_products_${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              if (payload.new.status === 'active' || payload.new.status === 'scheduled') {
                setItems((prev) => [payload.new, ...prev]);
              }
            } else if (payload.eventType === 'UPDATE') {
              setItems((prev) =>
                prev
                  .map((i) => (i.id === payload.new.id ? payload.new : i))
                  .filter((i) => i.status === 'active' || i.status === 'scheduled')
              );
            } else if (payload.eventType === 'DELETE') {
              setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    };

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const fetchShopContent = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', userId).single();

      const { data: products } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'scheduled'])
        .order('created_at', { ascending: false });

      setShopData(profile);
      setItems(products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => ({
    all:       items.length,
    scheduled: items.filter((i) => isActuallyScheduled(i)).length,
    auction:   items.filter((i) => i.selling_type === 'auction'   && isActuallyLive(i)).length,
    posted:    items.filter((i) => i.selling_type === 'posted'    && isActuallyLive(i)).length,
    fast_flip: items.filter((i) => i.selling_type === 'fast_flip' && isActuallyLive(i)).length,
  }), [items, tick]);

  const getFilteredItems = (activeFilter: FilterType) => {
    if (activeFilter === 'all') return items;
    if (activeFilter === 'scheduled') return items.filter((i) => isActuallyScheduled(i));
    return items.filter((i) => i.selling_type === activeFilter && isActuallyLive(i));
  };

  return { items, shopData, loading, tick, counts, getFilteredItems };
}