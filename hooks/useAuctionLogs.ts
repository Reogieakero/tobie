import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useAuctionLogs(itemId: string) {
  const [bids, setBids] = useState<any[]>([]);
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
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
    if (!itemDetails?.end_time) return;

    const timer = setInterval(() => {
      const end = new Date(itemDetails.end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('ENDED');
        clearInterval(timer);
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [itemDetails?.end_time]);

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

  return { bids, itemDetails, loading, timeLeft, refresh: fetchLogs };
}