import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useState } from 'react';
import { Platform } from 'react-native';

export function useAddItemForm() {
  const [sellingType, setSellingType] = useState<'auction' | 'posted' | 'fast_flip'>('auction');
  const [image, setImage] = useState<string | null>(null);
  const [postToProfile, setPostToProfile] = useState(true);
  const [issues, setIssues] = useState<string[]>(['']);
  const [duration, setDuration] = useState('60');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    minIncrement: '',
    targetBid: '',
    quantity: '1', // Added quantity
  });

  const handleUpdateIssue = (text: string, index: number) => {
    const newIssues = [...issues];
    newIssues[index] = text;
    setIssues(newIssues);
  };

  const handleAddIssue = () => setIssues([...issues, '']);
  const handleRemoveIssue = (index: number) => {
    const newIssues = issues.filter((_, i) => i !== index);
    setIssues(newIssues.length ? newIssues : ['']);
  };

  const uploadImage = async (uri: string) => {
    const ext = uri.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const formDataBody = new FormData();
    formDataBody.append('file', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: fileName,
      type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
    } as any);

    const { error } = await supabase.storage.from('item-images').upload(fileName, formDataBody);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from('item-images').getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };

  const submitForm = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      if (!image) throw new Error('Please select an image');

      const imageUrl = await uploadImage(image);

      let endTime = null;
      if (sellingType === 'auction' && duration) {
        const date = new Date();
        date.setMinutes(date.getMinutes() + parseInt(duration));
        endTime = date.toISOString();
      }

      const { error } = await supabase.from('items').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        selling_type: sellingType,
        price: parseFloat(formData.price),
        target_bid: formData.targetBid ? parseFloat(formData.targetBid) : null,
        min_increment: formData.minIncrement ? parseFloat(formData.minIncrement) : null,
        quantity: parseInt(formData.quantity) || 1, // Added quantity mapping
        issues: issues.filter(i => i.trim() !== ''),
        image_url: imageUrl,
        posted_to_grid: postToProfile,
        end_time: endTime,
        status: 'active',
      });

      if (error) throw error;
      showToast("Success", "Item posted successfully", "success");
      return true;
    } catch (err: any) {
      showToast("Error", err.message || "Failed to post item", "danger");
      return false;
    }
  };

  return {
    sellingType, setSellingType,
    image, setImage,
    postToProfile, setPostToProfile,
    issues, handleUpdateIssue, handleAddIssue, handleRemoveIssue,
    formData, setFormData,
    duration, setDuration,
    submitForm
  };
}