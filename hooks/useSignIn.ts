import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export function useSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrors({
        email: !email ? 'Email is required.' : '',
        password: !password ? 'Password is required.' : '',
      });
      return;
    }

    setLoading(true);
    setErrors({ email: '', password: '' });

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed')) {
          showToast('Email Not Verified', 'Please verify your email before signing in.', 'danger');
          router.push({ pathname: '/verify', params: { email } });
        } else if (msg.includes('credentials')) {
          setErrors({ email: 'Incorrect email or password.', password: 'Please check your credentials.' });
        } else {
          showToast('Sign In Failed', error.message, 'danger');
        }
      } else {
        router.replace('/home');
      }
    } catch (e: any) {
      showToast('Network Error', 'Check your connection.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail, password, setPassword,
    loading, errors, handleSignIn, setErrors
  };
}