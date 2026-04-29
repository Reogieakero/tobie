import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';

export function useAccountInfo() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [city, setCity] = useState('');
  const [canEdit, setCanEdit] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    bio: '',
    avatarUrl: ''
  });

  const isPhoneValid = (num: string) => /^(09|\+639)\d{9}$/.test(num);
  const isZipValid = (zip: string) => /^\d{4}$/.test(zip);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          // 7-Day Lock Logic
          if (profile.updated_at) {
            const lastUpdate = new Date(profile.updated_at);
            const now = new Date();
            const diffInDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
            
            if (diffInDays < 7) {
              setCanEdit(false);
              setDaysLeft(Math.ceil(7 - diffInDays));
            }
          }

          setFormData({
            email: user.email || '',
            firstName: profile.first_name || '',
            middleName: profile.middle_name || '',
            lastName: profile.last_name || '',
            phone: profile.phone || '',
            zipCode: profile.zip_code || '',
            bio: profile.bio || '',
            avatarUrl: profile.avatar_url || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    if (isZipValid(formData.zipCode)) {
      fetch(`https://api.zippopotam.us/ph/${formData.zipCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.places?.length > 0) setCity(data.places[0]['place name']);
        })
        .catch(() => setCity(''));
    } else {
      setCity('');
    }
  }, [formData.zipCode]);

  const pickImage = async () => {
    if (!canEdit) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User session not found");

      const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, bytes, { contentType, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
    } catch (error: any) {
      showToast("Upload Error", error.message, "danger");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!canEdit) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired.");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: formData.firstName.trim(),
          middle_name: formData.middleName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone,
          zip_code: formData.zipCode,
          city: city,
          bio: formData.bio.trim(),
          avatar_url: formData.avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      showToast("Success", "Account updated", "success");
      setCanEdit(false);
      setDaysLeft(7);
    } catch (err: any) {
      showToast("Error", err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, setFormData, city, loading, initialLoading, uploading,
    handleUpdate, isPhoneValid, isZipValid, pickImage, canEdit, daysLeft
  };
}