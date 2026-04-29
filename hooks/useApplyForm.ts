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
    const [nameError, setNameError] = useState('');
    
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

    const generateSlug = (name: string) => {
        return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    };

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
        setNameError('');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data: existingShop } = await supabase
                .from('shop_applications')
                .select('shop_name')
                .eq('shop_name', formData.shopName.trim())
                .maybeSingle();

            if (existingShop) {
                setNameError("This shop name is already taken");
                throw new Error("Shop name already taken");
            }

            const slug = generateSlug(formData.shopName);
            const customLink = `tobie/${slug}`;

            const { data, error: dbError } = await supabase
                .from('shop_applications')
                .insert([{
                    user_id: user.id,
                    shop_name: formData.shopName.trim(),
                    shop_slug: slug,
                    custom_link: customLink,
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

            await supabase.functions.invoke('shop-approval', {
                body: { 
                    applicationId: data.id, 
                    shopName: formData.shopName,
                    customLink: customLink,
                    applicantEmail: user.email,
                    category: formData.category,
                    phone: formData.phone,
                    city: city,
                    zipCode: formData.zipCode,
                    description: formData.description,
                },
            });

            showToast("Success", "Application sent for admin approval.", "success");
            router.replace('/profile/shop');

        } catch (err: any) {
            showToast("Error", err.message || "Failed to submit", "danger");
        } finally {
            setLoading(false);
        }
    };

    return { 
        formData, setFormData, touched, setTouched, agreed, setAgreed, 
        userEmail, city, loading, handleSubmit, isPhoneValid, isZipValid, isNameValid,
        nameError, generateSlug
    };
}