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

        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          firstName: profile?.first_name || '',
          middleName: profile?.middle_name || '',
          lastName: profile?.last_name || '',
          phone: profile?.phone || '',
          zipCode: profile?.zip_code || '',
          bio: profile?.bio || '',
          avatarUrl: profile?.avatar_url || ''
        }));
      } catch (err) {
        console.error("Init error:", err);
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // SDK 55: MediaType is a plain string union, use array of strings
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
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

      // SDK 55: import from 'expo-file-system/legacy' to use readAsStringAsync
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Decode base64 → Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, bytes, {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      showToast("Success", "Profile photo uploaded", "success");
    } catch (error: any) {
      console.error("Upload process error:", error);
      showToast("Upload Error", error.message || "Could not upload image", "danger");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
    } catch (err: any) {
      showToast("Error", err.message || "Failed to update", "danger");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, setFormData, city, loading, initialLoading, uploading,
    handleUpdate, isPhoneValid, isZipValid, pickImage
  };
}