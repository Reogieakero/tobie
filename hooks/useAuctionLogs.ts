import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useAuctionLogs(itemId: string) {
  const [bids, setBids] = useState<any[]>([]);
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Added end_time to the selection to support the countdown timer
      const { data: itemData } = await supabase
        .from('items')
        .select('image_url, price, target_bid, end_time')
        .eq('id', itemId)
        .single();

      if (itemData) setItemDetails(itemData);

      const { data: bidsData, error } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          profiles!bidder_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('item_id', itemId)
        .order('amount', { ascending: false });

      if (error) throw error;
      setBids(bidsData || []);
    } catch (err) {
      console.error("Logs Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!itemId) return;
    fetchLogs();

    const channel = supabase
      .channel(`live-logs-${itemId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'bids', 
          filter: `item_id=eq.${itemId}` 
        },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  return { bids, itemDetails, loading, refresh: fetchLogs };
}