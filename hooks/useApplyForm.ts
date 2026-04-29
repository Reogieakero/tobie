import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export function useApplyForm() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState('Loading...');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    
    const [formData, setFormData] = useState({
        shopName: '',
        category: '',
        phone: '',
        zipCode: '',
        description: '',
    });

    const [touched, setTouched] = useState({
        shopName: false,
        phone: false,
        zipCode: false,
        category: false,
    });

    const isPhoneValid = (num: string) => /^(09|\+639)\d{9}$/.test(num);
    const isZipValid = (zip: string) => /^\d{4}$/.test(zip);
    const isNameValid = (name: string) => name.trim().length >= 3;

    useEffect(() => {
        async function getUser() {
            const { data } = await supabase.auth.getUser();
            if (data.user?.email) setUserEmail(data.user.email);
        }
        getUser();
    }, []);

    useEffect(() => {
        if (isZipValid(formData.zipCode)) {
            fetch(`https://api.zippopotam.us/ph/${formData.zipCode}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.places?.length > 0) {
                        setCity(data.places[0]['place name']);
                    }
                })
                .catch(() => setCity(''));
        } else {
            setCity('');
        }
    }, [formData.zipCode]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error: dbError } = await supabase
                .from('shop_applications')
                .insert([{
                    user_id: user.id,
                    shop_name: formData.shopName,
                    category: formData.category,
                    phone: formData.phone,
                    zip_code: formData.zipCode,
                    city: city, 
                    description: formData.description,
                    status: 'pending'
                }])
                .select()
                .single();

            if (dbError) throw dbError;
            if (!data) throw new Error("Insert returned no data — check RLS INSERT policy on shop_applications");

            // Trigger the Edge Function
            const { error: funcError } = await supabase.functions.invoke('shop-approval', {
                body: { 
                    applicationId: data.id, 
                    shopName: formData.shopName,
                    applicantEmail: user.email,
                    category: formData.category,
                    phone: formData.phone,
                    city: city,
                    zipCode: formData.zipCode,
                    description: formData.description,
                },
            });

            if (funcError) throw new Error(`Email notification failed: ${funcError.message}`);

            showToast("Success", "Application sent for admin approval.", "success");

            // ── Go back to the shop screen so it immediately shows "pending" ──
            // We use router.replace so the apply screen is removed from the stack.
            router.replace('/profile/shop');

        } catch (err: any) {
            showToast("Error", err.message || "Failed to submit", "danger");
        } finally {
            setLoading(false);
        }
    };

    return { 
        formData, setFormData, touched, setTouched, agreed, setAgreed, 
        userEmail, city, loading, handleSubmit, isPhoneValid, isZipValid, isNameValid 
    };
}