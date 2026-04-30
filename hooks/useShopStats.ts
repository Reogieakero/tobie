import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useUserStats() {
  const [counts, setCounts] = useState({
    auction: '00',
    active: '00',
    sold: '00',
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('items')
        .select('status, selling_type')
        .eq('user_id', user.id);

      if (error) throw error;

      // Filter logic based on your Supabase table structure
      const auctionTotal = data.filter(item => item.selling_type === 'auction').length;
      const activeTotal = data.filter(item => item.status === 'active').length;
      const soldTotal = data.filter(item => item.status === 'completed').length;

      setCounts({
        auction: auctionTotal.toString().padStart(2, '0'),
        active: activeTotal.toString().padStart(2, '0'),
        sold: soldTotal.toString().padStart(2, '0'),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { counts, loading, refresh: fetchStats };
}