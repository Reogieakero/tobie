import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export function useAuctionCardData(item: any) {
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbData, setDbData] = useState({
    price: item?.price || 0,
    target_bid: item?.target_bid || null
  });

  const fetchLatestData = useCallback(async () => {
    if (!item?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select('price, target_bid')
        .eq('id', item.id)
        .single();

      if (error) {
        console.error("Supabase Error fetching target_bid:", error.message);
      }
      
      if (data) {
        // DEBUG LOG: Check your terminal/console to see the real value from DB
        console.log(`Item ${item.id} Data:`, data);
        
        setDbData({
          price: data.price,
          target_bid: data.target_bid
        });
      }
    } catch (err) {
      console.error("System Error:", err);
    } finally {
      setLoading(false);
    }
  }, [item?.id]);

  useEffect(() => {
    const calculateTime = () => {
      if (!item?.end_time) return 'Ended';
      const total = Date.parse(item.end_time) - Date.now();
      if (total <= 0) return 'Ended';
      const mins = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${Math.floor((total / 1000) % 60)}s`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    fetchLatestData();

    return () => clearInterval(interval);
  }, [item?.end_time, fetchLatestData]);

  return {
    timeLeft,
    currentPrice: dbData.price,
    targetBid: dbData.target_bid,
    loading,
    isEnded: timeLeft === 'Ended'
  };
}