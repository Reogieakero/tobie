import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export function useEditShop() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isEditable, setIsEditable] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [shopData, setShopData] = useState({
        name: '',
        description: '',
        category: '',
        slug: '',
        link: 'tobie/',
    });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchInitialData(user.id);
            }
        };
        init();
    }, []);

    const fetchInitialData = async (uid: string) => {
        try {
            setFetching(true);
            const { data: shop } = await supabase.from('shops').select('shop_name').eq('owner_id', uid).maybeSingle();
            const { data: app } = await supabase.from('shop_applications').select('description, category, shop_slug, custom_link').eq('user_id', uid).maybeSingle();

            setShopData({
                name: shop?.shop_name || '',
                description: app?.description || '',
                category: app?.category || '',
                slug: app?.shop_slug || '',
                link: app?.custom_link || 'tobie/',
            });
        } catch (e) {
            showToast("Error", "Failed to load data", "danger");
        } finally {
            setFetching(false);
        }
    };

    const updateSlug = (name: string) => {
        const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        setShopData(prev => ({ ...prev, name, slug, link: `tobie/${slug}` }));
    };

    const handleSave = async () => {
        if (!shopData.name.trim()) return showToast("Error", "Name is required", "danger");
        setLoading(true);
        try {
            await supabase.from('shops').update({ shop_name: shopData.name.trim() }).eq('owner_id', userId);
            await supabase.from('shop_applications').update({
                category: shopData.category,
                description: shopData.description,
                shop_name: shopData.name.trim(),
                shop_slug: shopData.slug,
                custom_link: shopData.link
            }).eq('user_id', userId);

            showToast("Success", "Shop updated", "success");
            setIsEditable(false);
            router.back();
        } catch (e: any) {
            showToast("Update Failed", e.message, "danger");
        } finally {
            setLoading(false);
        }
    };

    return { shopData, setShopData, updateSlug, handleSave, loading, fetching, isEditable, setIsEditable };
}