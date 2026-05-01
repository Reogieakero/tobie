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
        .select('id, title, end_time, price, target_bid, display_order, user_id, image_url, status, selling_type')
        .eq('selling_type', 'auction')
        .eq('status', 'active') // Only fetch active items
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Filter out items where the end_time has already passed (Safety check)
      const now = new Date();
      const filteredData = (data || []).filter(item => {
        if (!item.end_time) return true;
        return new Date(item.end_time) > now;
      });

      setAuctions(filteredData);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAuctions();

    // Listen for any changes in the items table
    const channelId = `auction-feed-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for UPDATEs specifically when status changes to 'ended'
          schema: 'public',
          table: 'items'
        },
        (payload: any) => {
          // If an item was updated to 'ended', we refresh the list to remove it
          if (payload.new.status === 'ended' || payload.new.selling_type !== 'auction') {
            fetchLiveAuctions();
          } else {
            // Otherwise, just refresh to get new bids/prices
            fetchLiveAuctions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { auctions, loading, refresh: fetchLiveAuctions };
}