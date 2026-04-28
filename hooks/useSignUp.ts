import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export function useSignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [validation, setValidation] = useState({ length: false, number: false, match: false });

  useEffect(() => {
    setValidation({
      length: password.length >= 8,
      number: /\d/.test(password),
      match: password === confirmPassword && confirmPassword !== '',
    });
  }, [password, confirmPassword]);

  const handleSignUp = async () => {
    setLoading(true);
    setEmailError('');

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          setEmailError('This email is already registered. Try signing in instead.');
        } else {
          showToast('Error', error.message, 'danger');
        }
      } else if (data.user && data.user.identities?.length === 0) {
        setEmailError('This email is already registered. Try signing in instead.');
      } else {
        router.push({ pathname: '/verify', params: { email } });
      }
    } catch (e: any) {
      showToast('Network Error', 'Check your internet connection.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail, password, setPassword,
    confirmPassword, setConfirmPassword,
    loading, emailError, setEmailError,
    validation, handleSignUp,
  };
}