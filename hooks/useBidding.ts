import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useBidding(itemId: string | string[] | undefined) {
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [bidInput, setBidInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBids = useCallback(async () => {
    const { data, error } = await supabase
      .from('bids')
      .select(`*, profiles:bidder_id (first_name, last_name, avatar_url)`)
      .eq('item_id', itemId)
      .order('amount', { ascending: false });

    if (!error && data) setBids(data);
  }, [itemId]);

  useEffect(() => {
    if (!itemId) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        const { data: itemData } = await supabase
          .from('items')
          .select(`*`)
          .eq('id', itemId)
          .single();

        setItem(itemData);
        await fetchBids();
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const subscription = supabase
      .channel(`realtime:bids:${itemId}`)
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'bids',
          filter: `item_id=eq.${itemId}` 
      }, () => fetchBids())
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [itemId, fetchBids]);

  const isOwner = currentUserId === item?.user_id;
  const currentHighest = bids.length > 0 ? bids[0].amount : item?.price || 0;
  const highestBidder = bids.length > 0 ? bids[0] : null;
  const currentMinBid = Number(currentHighest) + Number(item?.min_increment || 0);

  const handleOpenModal = () => {
    if (isOwner) return;
    setBidInput(currentMinBid.toString());
    setModalVisible(true);
  };

  const submitBid = async () => {
    const amount = parseFloat(bidInput);
    if (isNaN(amount) || amount < currentMinBid) {
      showToast("INVALID BID", `Minimum bid is ₱${currentMinBid.toLocaleString()}`, "danger");
      return;
    }

    try {
      setIsSubmitting(true);
      if (!currentUserId) return;
      const { error } = await supabase
        .from('bids')
        .insert([{ item_id: itemId, bidder_id: currentUserId, amount }]);
      if (error) throw error;
      setModalVisible(false);
      showToast("BID PLACED", `Successfully bid ₱${amount.toLocaleString()}`, "success");
      await fetchBids();
    } catch (error: any) {
      showToast("ERROR", error.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellAuction = async () => {
    if (!highestBidder) {
        showToast("NO BIDS", "No bidders yet.", "danger");
        return;
    }
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('items')
        .update({ 
          status: 'sold', 
          sold_to: highestBidder.bidder_id, 
          final_price: highestBidder.amount 
        })
        .eq('id', itemId);
      if (error) throw error;
      showToast("SUCCESS", "Item sold!", "success");
      router.back();
    } catch (error: any) {
      showToast("ERROR", error.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    item, bids, loading, isOwner, modalVisible, setModalVisible,
    bidInput, setBidInput, isSubmitting, currentHighest, currentMinBid,
    highestBidder, handleOpenModal, submitBid, sellAuction 
  };
}