import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useMemo, useState } from 'react';
import { Platform } from 'react-native';

export function useAddItemForm() {
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

  const fieldValidation = useMemo(() => {
    const sPrice = parseFloat(formData.price);
    const tBid = formData.targetBid ? parseFloat(formData.targetBid) : null;
    const mInc = formData.minIncrement ? parseFloat(formData.minIncrement) : null;

    const priceValid =
      formData.price.trim() !== '' && !isNaN(sPrice) && sPrice > 0;

    const targetBidValid =
      formData.targetBid.trim() === '' ||
      (tBid !== null && !isNaN(tBid) && priceValid && tBid > sPrice);

    const minIncrementValid =
      formData.minIncrement.trim() === '' ||
      (mInc !== null && !isNaN(mInc) && mInc > 0);

    return {
      price: priceValid,
      targetBid: targetBidValid,
      minIncrement: minIncrementValid,
    };
  }, [formData]);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    const sPrice = parseFloat(formData.price);
    const tBid = formData.targetBid ? parseFloat(formData.targetBid) : null;
    const mInc = formData.minIncrement ? parseFloat(formData.minIncrement) : null;

    if (formData.price.trim() !== '') {
      if (isNaN(sPrice) || sPrice <= 0) {
        errs.price = 'Starting bid must be greater than 0';
      }
    }

    if (sellingType === 'auction') {
      if (formData.minIncrement.trim() !== '') {
        if (mInc === null || isNaN(mInc) || mInc <= 0) {
          errs.minIncrement = 'Min increment must be greater than 0';
        }
      }

      if (formData.targetBid.trim() !== '') {
        if (tBid === null || isNaN(tBid)) {
          errs.targetBid = 'Enter a valid target bid';
        } else if (!isNaN(sPrice) && sPrice > 0 && tBid <= sPrice) {
          errs.targetBid = 'Target bid must be greater than starting bid';
        }
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
      showToast('Invalid Form', 'Please fix the errors before submitting', 'danger');
      return false;
    }

    const sPrice = parseFloat(formData.price);
    if (isNaN(sPrice) || sPrice <= 0) {
      showToast('Invalid Price', 'Starting bid must be greater than 0', 'danger');
      return false;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      if (!image) throw new Error('Please select an image');

      const tBid = formData.targetBid ? parseFloat(formData.targetBid) : null;
      const mInc = formData.minIncrement ? parseFloat(formData.minIncrement) : null;
      const start = startTimeType === 'now' ? new Date() : scheduledStartDate;
      let end: Date;

      if (endTimeType === 'duration') {
        end = new Date(start.getTime());
        end.setMinutes(end.getMinutes() + parseInt(duration || '0'));
      } else {
        end = scheduledEndDate;
      }

      const imageUrl = await uploadImage(image);

      const { error } = await supabase.from('items').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        selling_type: sellingType,
        price: sPrice,
        target_bid: tBid,
        min_increment: mInc,
        quantity: parseInt(formData.quantity) || 1,
        issues: issues.filter((i) => i.trim() !== ''),
        image_url: imageUrl,
        posted_to_grid: postToProfile,
        start_time: start.toISOString(),
        end_time: sellingType === 'auction' ? end.toISOString() : null,
        status: startTimeType === 'now' ? 'active' : 'scheduled',
      });

      if (error) throw error;
      showToast('Success', 'Item posted successfully', 'success');
      return true;
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to post item', 'danger');
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
    startTimeType, setStartTimeType,
    endTimeType, setEndTimeType,
    scheduledStartDate, setScheduledStartDate,
    scheduledEndDate, setScheduledEndDate,
    submitForm,
    errors,
    fieldValidation,
  };
}