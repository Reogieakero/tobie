import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useUserSession() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && mounted) {
          const { data: profile } = await supabase.from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single();
          
          if (mounted) {
            setUserName(profile?.first_name || user.email?.split('@')[0] || 'User');
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchUser();
    return () => { mounted = false; };
  }, []);

  return { userName };
}