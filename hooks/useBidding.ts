import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useBidding(itemId: string | string[] | undefined) {
    const [item, setItem] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBids = async () => {
        const { data, error } = await supabase
            .from('bids')
            .select(`*, profiles:bidder_id (first_name, last_name, avatar_url)`)
            .eq('item_id', itemId)
            .order('amount', { ascending: false });

        if (!error && data) setBids(data);
    };

    useEffect(() => {
        if (!itemId) return;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
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
    }, [itemId]);

    return { item, bids, loading, fetchBids, setBids };
}