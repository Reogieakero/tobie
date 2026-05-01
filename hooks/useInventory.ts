import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useInventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const checkStatus = (item: any) => {
    if (item.selling_type === 'auction' && item.end_time) {
      const isPast = new Date(item.end_time).getTime() < Date.now();
      if (isPast) return 'ended';
    }
    return item.status;
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedItems = data?.map(item => ({
        ...item,
        displayStatus: checkStatus(item)
      }));

      setItems(processedItems || []);
    } catch (err) {
      console.error("Inventory Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    
    const interval = setInterval(() => {
      setItems(currentItems => 
        currentItems.map(item => ({
          ...item,
          displayStatus: checkStatus(item)
        }))
      );
    }, 10000);

    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => fetchInventory())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { items, loading, refresh: fetchInventory };
}