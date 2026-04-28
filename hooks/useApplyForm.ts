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

            // Trigger the Edge Function
            const { error: funcError } = await supabase.functions.invoke('shop-approval', {
                body: { 
                    applicationId: data.id, 
                    shopName: formData.shopName,
                    applicantEmail: user.email 
                },
            });

            if (funcError) {
                console.error("Function Error:", funcError);
                // We don't throw here so the user still sees the "Success" toast 
                // since the DB record was actually created.
            }

            showToast("Success", "Application sent for admin approval.", "success");
            router.replace('/(tabs)/profile');

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