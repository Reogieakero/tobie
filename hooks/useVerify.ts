import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput } from 'react-native';

export function useVerify(email: string | string[] | undefined) {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleVerify = async () => {
    if (!email) {
      showToast('Error', 'No email found for verification.', 'danger');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: code.join(''),
        type: 'signup',
      });

      if (error) {
        showToast('Verification Failed', error.message, 'danger');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      } else {
        await supabase.auth.signOut();
        showToast('✓ Email Verified!', 'Your account is ready. Please sign in.', 'success');
        router.replace('/sign-in');
      }
    } catch (e: any) {
      showToast('Network Error', 'Check your connection.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return {
    code, loading, inputs, handleInput, handleVerify,
  };
}