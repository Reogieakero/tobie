import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export function useShopSettings() {
  const [isLinked, setIsLinked] = useState(false);
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch shop name from 'shop_applications'
      const { data: appData, error: appError } = await supabase
        .from('shop_applications')
        .select('shop_name')
        .eq('user_id', user.id) // Matching owner ID to application user ID
        .single();

      if (appError && appError.code !== 'PGRST116') throw appError;
      if (appData) setShopName(appData.shop_name);

      // 2. Fetch visibility state from 'shops'
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('is_linked')
        .eq('owner_id', user.id)
        .single();

      if (shopError && shopError.code !== 'PGRST116') throw shopError;
      if (shopData) setIsLinked(shopData.is_linked);

    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleShopLink = async () => {
    const previousState = isLinked;
    const newState = !previousState;

    setIsLinked(newState);
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Sync the visibility to the shops table
      const { error } = await supabase
        .from('shops')
        .upsert({ 
          owner_id: user.id, 
          is_linked: newState,
          shop_name: shopName, // Syncing the name found in applications
          updated_at: new Date().toISOString()
        }, { onConflict: 'owner_id' });

      if (error) throw error;
    } catch (error: any) {
      setIsLinked(previousState);
      Alert.alert('Update Failed', 'Could not save visibility settings.');
      console.error('Upsert error:', error.message);
    } finally {
      setUpdating(false);
    }
  };

  return { isLinked, shopName, loading, updating, toggleShopLink };
}