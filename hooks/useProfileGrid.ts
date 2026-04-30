import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useProfileGrid() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('posted_to_grid', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching grid items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserItems();
  }, []);

  return {
    items,
    loading,
    selected,
    setSelected,
    refresh: fetchUserItems,
  };
}