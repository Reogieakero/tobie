import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useLiveAuctions() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveAuctions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('id, title, end_time, price, target_bid, display_order, user_id')
        .eq('selling_type', 'auction')
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAuctions();

    const channelId = `auction-live-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: "selling_type=eq.auction"
        },
        () => {
          fetchLiveAuctions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { auctions, loading, refresh: fetchLiveAuctions };
}