import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useAuctionLogs(itemId: string) {
  const router = useRouter();
  const [bids, setBids] = useState<any[]>([]);
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const autoSellTriggered = useRef(false);

  const fetchLogs = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data: itemData } = await supabase
        .from('items')
        .select('image_url, price, target_bid, end_time, user_id, title, status')
        .eq('id', itemId)
        .single();

      if (itemData) setItemDetails(itemData);

      const { data: bidsData, error } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          bidder_id,
          profiles!bidder_id (first_name, last_name, avatar_url)
        `)
        .eq('item_id', itemId)
        .order('amount', { ascending: false });

      if (error) throw error;
      setBids(bidsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const sellAuction = useCallback(async () => {
    if (bids.length === 0 || itemDetails?.status === 'sold') return;
    
    try {
      setIsSubmitting(true);
      const highestBid = bids[0];

      const { error } = await supabase
        .from('items')
        .update({ 
          status: 'sold', 
          sold_to: highestBid.bidder_id, 
          final_price: highestBid.amount 
        })
        .eq('id', itemId);

      if (error) {
        if (error.message.includes('final_price')) {
            showToast("DATABASE ERROR", "Please add 'final_price' column to items table.", "danger");
        } else {
            throw error;
        }
        return;
      }
      
      showToast("SUCCESS", "Item successfully sold!", "success");
      fetchLogs(); 
    } catch (error: any) {
      showToast("ERROR", error.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  }, [bids, itemId, itemDetails?.status, fetchLogs]);

  useEffect(() => {
    if (!itemDetails?.end_time || itemDetails?.status === 'sold') {
        if (itemDetails?.status === 'sold') setTimeLeft('SOLD');
        return;
    }

    const timer = setInterval(() => {
      const end = new Date(itemDetails.end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft('ENDED');
        clearInterval(timer);
        
        if (!autoSellTriggered.current && bids.length > 0) {
            autoSellTriggered.current = true;
            sellAuction();
        }
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [itemDetails?.end_time, itemDetails?.status, bids, sellAuction]);

  useEffect(() => {
    if (!itemId) return;
    fetchLogs();
    const channel = supabase
      .channel(`live-logs-${itemId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `item_id=eq.${itemId}` }, () => fetchLogs())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'items', filter: `id=eq.${itemId}` }, () => fetchLogs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [itemId, fetchLogs]);

  return { 
    bids, itemDetails, loading, timeLeft, 
    isOwner: currentUserId === itemDetails?.user_id,
    isSubmitting, sellAuction, refresh: fetchLogs 
  };
}