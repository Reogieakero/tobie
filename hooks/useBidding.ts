import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useBidding(itemId: string) {
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [bidInput, setBidInput] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    
    const autoSellTriggered = useRef(false);

    const fetchData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            const { data: itemData } = await supabase
                .from('items')
                .select('*')
                .eq('id', itemId)
                .single();
            setItem(itemData);

            const { data: bidsData } = await supabase
                .from('bids')
                .select('*, profiles:bidder_id(first_name, last_name, avatar_url)')
                .eq('item_id', itemId)
                .order('amount', { ascending: false });
            setBids(bidsData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    const sellAuction = useCallback(async () => {
        if (bids.length === 0 || item?.status === 'sold') return;
        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from('items')
                .update({ 
                    status: 'sold', 
                    sold_to: bids[0].bidder_id, 
                    final_price: bids[0].amount 
                })
                .eq('id', itemId);

            if (error) throw error;
            showToast("AUCTION CLOSED", "Item sold to highest bidder.", "success");
            fetchData();
        } catch (error: any) {
            console.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }, [bids, itemId, item?.status, fetchData]);

    useEffect(() => {
        if (!item?.end_time || item?.status === 'sold') return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(item.end_time).getTime();
            if (end - now <= 0) {
                clearInterval(timer);
                if (!autoSellTriggered.current && bids.length > 0) {
                    autoSellTriggered.current = true;
                    sellAuction();
                }
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [item?.end_time, item?.status, bids, sellAuction]);

    useEffect(() => {
        fetchData();
        const channel = supabase.channel(`bidding-${itemId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `item_id=eq.${itemId}` }, () => fetchData())
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'items', filter: `id=eq.${itemId}` }, () => fetchData())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [itemId, fetchData]);

    const currentHighest = bids.length > 0 ? bids[0].amount : item?.price || 0;
    const currentMinBid = bids.length > 0 ? currentHighest + (item?.min_increment || 100) : item?.price || 0;

    const submitBid = async () => {
        const amount = parseFloat(bidInput);
        if (isNaN(amount) || amount < currentMinBid) {
            showToast("INVALID BID", `Minimum bid is ₱${currentMinBid.toLocaleString()}`, "danger");
            return;
        }
        try {
            setIsSubmitting(true);
            const { error } = await supabase.from('bids').insert({ item_id: itemId, bidder_id: currentUserId, amount });
            if (error) throw error;
            setModalVisible(false);
            setBidInput('');
            showToast("BID PLACED", "Your bid is now the highest!", "success");
        } catch (error: any) {
            showToast("ERROR", error.message, "danger");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        item, bids, loading, isOwner: currentUserId === item?.user_id,
        modalVisible, setModalVisible, bidInput, setBidInput,
        isSubmitting, currentHighest, currentMinBid,
        highestBidder: bids[0] || null,
        handleOpenModal: () => setModalVisible(true),
        submitBid, sellAuction
    };
}