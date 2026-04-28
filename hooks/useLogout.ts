import { router } from 'expo-router';
import { useCallback } from 'react';

export const useLogout = () => {
  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');

      router.replace('/sign-in'); 
    } catch (error) {
      console.error('Logout failed', error);
    }
  }, []);

  return { logout };
};