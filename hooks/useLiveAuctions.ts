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
      console.error('Error fetching live auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAuctions();
  }, []);

  return { auctions, loading, refresh: fetchLiveAuctions };
}