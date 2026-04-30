import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export function useAddItemForm(itemId?: string) {
  const [sellingType, setSellingType] = useState<'auction' | 'posted' | 'fast_flip'>('auction');
  const [image, setImage] = useState<string | null>(null);
  const [postToProfile, setPostToProfile] = useState(true);
  const [issues, setIssues] = useState<string[]>(['']);
  const [duration, setDuration] = useState('60');
  const [startTimeType, setStartTimeType] = useState<'now' | 'future'>('now');
  const [endTimeType, setEndTimeType] = useState<'specific' | 'duration'>('duration');
  const [scheduledStartDate, setScheduledStartDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d;
  });
  const [scheduledEndDate, setScheduledEndDate] = useState(new Date(Date.now() + 7200000));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    minIncrement: '',
    targetBid: '',
    quantity: '1',
  });

  useEffect(() => {
    if (itemId) {
      loadItemData();
    }
  }, [itemId]);

  const loadItemData = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      if (data) {
        setSellingType(data.selling_type);
        setImage(data.image_url);
        setPostToProfile(data.posted_to_grid);
        setIssues(data.issues || ['']);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          minIncrement: data.min_increment?.toString() || '',
          targetBid: data.target_bid?.toString() || '',
          quantity: data.quantity?.toString() || '1',
        });
      }
    } catch (err: any) {
      showToast('Error', 'Failed to load item data', 'danger');
    }
  };

  const fieldValidation = useMemo(() => {
    const sPrice = parseFloat(formData.price);
    const tBid = formData.targetBid ? parseFloat(formData.targetBid) : null;
    const mInc = formData.minIncrement ? parseFloat(formData.minIncrement) : null;
    const priceValid = formData.price.trim() !== '' && !isNaN(sPrice) && sPrice > 0;
    const targetBidValid = formData.targetBid.trim() === '' || (tBid !== null && !isNaN(tBid) && priceValid && tBid > sPrice);
    const minIncrementValid = formData.minIncrement.trim() === '' || (mInc !== null && !isNaN(mInc) && mInc > 0);

    return { price: priceValid, targetBid: targetBidValid, minIncrement: minIncrementValid };
  }, [formData]);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    const sPrice = parseFloat(formData.price);
    const tBid = formData.targetBid ? parseFloat(formData.targetBid) : null;
    const mInc = formData.minIncrement ? parseFloat(formData.minIncrement) : null;

    if (formData.price.trim() !== '' && (isNaN(sPrice) || sPrice <= 0)) {
      errs.price = 'Starting bid must be greater than 0';
    }

    if (sellingType === 'auction') {
      if (formData.minIncrement.trim() !== '' && (mInc === null || isNaN(mInc) || mInc <= 0)) {
        errs.minIncrement = 'Min increment must be greater than 0';
      }
      if (formData.targetBid.trim() !== '' && (tBid === null || isNaN(tBid) || (!isNaN(sPrice) && sPrice > 0 && tBid <= sPrice))) {
        errs.targetBid = 'Target bid must be greater than starting bid';
      }
    }
    return errs;
  }, [formData, sellingType]);

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
    if (uri.startsWith('http')) return uri;
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
    if (Object.keys(errors).length > 0) {
      showToast('Invalid Form', 'Please fix errors', 'danger');
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      if (!image) throw new Error('Please select an image');

      const imageUrl = await uploadImage(image);
      const sPrice = parseFloat(formData.price);
      const start = startTimeType === 'now' ? new Date() : scheduledStartDate;
      let end: Date | null = null;

      if (sellingType === 'auction') {
        if (endTimeType === 'duration') {
          end = new Date(start.getTime());
          end.setMinutes(end.getMinutes() + parseInt(duration || '0'));
        } else {
          end = scheduledEndDate;
        }
      }

      const payload = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        selling_type: sellingType,
        price: sPrice,
        target_bid: formData.targetBid ? parseFloat(formData.targetBid) : null,
        min_increment: formData.minIncrement ? parseFloat(formData.minIncrement) : null,
        quantity: parseInt(formData.quantity) || 1,
        issues: issues.filter((i) => i.trim() !== ''),
        image_url: imageUrl,
        posted_to_grid: postToProfile,
        start_time: start.toISOString(),
        end_time: end ? end.toISOString() : null,
        status: startTimeType === 'now' ? 'active' : 'scheduled',
      };

      const query = itemId 
        ? supabase.from('items').update(payload).eq('id', itemId)
        : supabase.from('items').insert(payload);

      const { error } = await query;
      if (error) throw error;

      showToast('Success', itemId ? 'Item updated' : 'Item posted', 'success');
      return true;
    } catch (err: any) {
      showToast('Error', err.message || 'Action failed', 'danger');
      return false;
    }
  };

  return {
    sellingType, setSellingType, image, setImage, postToProfile, setPostToProfile,
    issues, handleUpdateIssue, handleAddIssue, handleRemoveIssue,
    formData, setFormData, duration, setDuration, startTimeType, setStartTimeType,
    endTimeType, setEndTimeType, scheduledStartDate, setScheduledStartDate,
    scheduledEndDate, setScheduledEndDate, submitForm, errors, fieldValidation,
  };
}