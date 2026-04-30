import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useProfileListings(type: 'bids' | 'won') {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('items')
        .select('*, price, selling_type, status')
        .eq('user_id', user.id);

      if (type === 'bids') {
        query = query.eq('status', 'active');
      } else {
        query = query.eq('status', 'completed');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [type]);

  return { items, loading, refresh: fetchListings };
}