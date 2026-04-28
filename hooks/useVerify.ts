import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

export function useVerify(email: string | string[] | undefined) {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // FIX: Use 'any' or ReturnType<typeof setInterval> to avoid NodeJS namespace issues
    let interval: any; 
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleResend = async () => {
    if (!email || timer > 0) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        email: email as string,
        type: 'signup',
      });
      if (error) {
        showToast('Error', error.message, 'danger');
      } else {
        showToast('Code Sent', 'A new verification code has been sent.', 'success');
        setTimer(60); 
      }
    } catch (e) {
      showToast('Error', 'Could not resend code.', 'danger');
    } finally {
      setResending(false);
    }
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
        router.replace('/(auth)/sign-in');
      }
    } catch (e: any) {
      showToast('Network Error', 'Check your connection.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return {
    code,
    loading,
    resending,
    timer,
    inputs,
    handleInput,
    handleVerify,
    handleResend,
  };
}