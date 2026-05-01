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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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
        fetchData(user.id);
      }
    };
    init();
  }, []);

  const fetchData = async (uid: string) => {
    try {
      setFetching(true);
      const { data: shop } = await supabase.from('shops').select('shop_name, updated_at').eq('owner_id', uid).maybeSingle();
      const { data: app } = await supabase.from('shop_applications').select('description, category, shop_slug, custom_link').eq('user_id', uid).maybeSingle();

      if (shop) setLastUpdated(shop.updated_at);

      setFormData({
        name: shop?.shop_name || '',
        description: app?.description || '',
        category: app?.category || '',
        slug: app?.shop_slug || '',
        link: app?.custom_link || 'tobie/',
      });
    } catch (e) {
      showToast("Error", "Failed to load shop data", "danger");
    } finally {
      setFetching(false);
    }
  };

  const checkCooldown = () => {
    if (!lastUpdated) return { canEdit: true };

    const now = new Date();
    const lastUpdateDate = new Date(lastUpdated);
    const diffTime = now.getTime() - lastUpdateDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 7 * 24 * 60 * 60 * 1000) {
      const remainingDays = 7 - Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return { canEdit: false, remainingDays };
    }
    return { canEdit: true };
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    setFormData(prev => ({ ...prev, name, slug, link: `tobie/${slug}` }));
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) return showToast("Required", "Shop name is required", "danger");
    setLoading(true);
    try {
      const now = new Date().toISOString();
      await supabase.from('shops').update({ 
        shop_name: formData.name.trim(),
        updated_at: now 
      }).eq('owner_id', userId);

      await supabase.from('shop_applications').update({
        category: formData.category,
        description: formData.description,
        shop_name: formData.name.trim(),
        shop_slug: formData.slug,
        custom_link: formData.link,
        created_at: now // Using this as a sync point if needed
      }).eq('user_id', userId);

      showToast("Success", "Profile updated successfully", "success");
      setIsEditable(false);
      router.back();
    } catch (e: any) {
      showToast("Update Failed", e.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  return { formData, setFormData, handleNameChange, handleUpdate, loading, fetching, isEditable, setIsEditable, checkCooldown };
}