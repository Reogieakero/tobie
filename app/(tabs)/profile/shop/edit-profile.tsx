import AnimatedInput from '@/components/ui/AnimatedInput';
import { useEditShop } from '@/hooks/useEditShop';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CATEGORIES = ['Collectibles', 'Art', 'Tech', 'Fashion', 'Home & Living', 'Vintage'];

export default function EditShopProfile() {
    const { shopData, setShopData, updateSlug, handleSave, loading, fetching, isEditable, setIsEditable } = useEditShop();
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: () => <Text style={styles.headerTitle}>EDIT SHOP</Text>,
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => setIsEditable(false)} style={{ marginLeft: 16 }}>
                        <Ionicons name="arrow-back" size={24} color="#111" />
                    </TouchableOpacity>
                ),
                headerRight: () => !isEditable && (
                    <TouchableOpacity onPress={() => setShowConfirm(true)} style={{ marginRight: 16 }}>
                        <Ionicons name="create-outline" size={22} color="#111" />
                    </TouchableOpacity>
                ),
            }} />

            {/* Custom Confirmation Overlay */}
            <Modal visible={showConfirm} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.card}>
                        <Text style={styles.modalTitle}>Edit Shop Details?</Text>
                        <Text style={styles.modalSub}>This action will allow you to modify your public shop info.</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirm(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={() => { setIsEditable(true); setShowConfirm(false); }}>
                                <Text style={styles.confirmText}>Yes, Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={[styles.form, !isEditable && { opacity: 0.5 }]}>
                    <Text style={styles.sectionLabel}>Branding</Text>
                    <AnimatedInput 
                        label="Shop Name" 
                        value={shopData.name} 
                        onChangeText={updateSlug} 
                        editable={isEditable} 
                    />
                    <View style={styles.linkPreview}>
                        <Ionicons name="link-outline" size={14} color="#10B981" />
                        <Text style={styles.linkText}>{shopData.link}</Text>
                    </View>

                    <Text style={[styles.sectionLabel, { marginTop: 32 }]}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity 
                                key={cat} 
                                disabled={!isEditable}
                                style={[styles.categoryChip, shopData.category === cat && styles.activeChip]}
                                onPress={() => setShopData(p => ({ ...p, category: cat }))}
                            >
                                <Text style={[styles.categoryLabel, shopData.category === cat && styles.activeLabel]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.sectionLabel, { marginTop: 32 }]}>About</Text>
                    <AnimatedInput 
                        label="Description" 
                        value={shopData.description} 
                        onChangeText={(t) => setShopData(p => ({ ...p, description: t }))} 
                        multiline 
                        editable={isEditable} 
                    />
                </View>
            </ScrollView>

            {isEditable && (
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.saveButton, (loading || fetching) && styles.buttonDisabled]} 
                        onPress={handleSave} 
                        disabled={loading || fetching}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, letterSpacing: 1.5 },
    scrollContent: { padding: 16 },
    form: { marginTop: 8 },
    sectionLabel: { fontFamily: 'Unbounded_700Bold', fontSize: 10, color: '#94A3B8', marginBottom: 16, textTransform: 'uppercase' },
    linkPreview: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6, paddingLeft: 4 },
    linkText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#10B981' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F3F4F6' },
    activeChip: { backgroundColor: '#111', borderColor: '#111' },
    categoryLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B' },
    activeLabel: { color: '#FFF' },
    footer: { padding: 16, paddingBottom: 32 },
    saveButton: { backgroundColor: '#111', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#E2E8F0' },
    saveButtonText: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#FFF' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
    card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 5 },
    modalTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#111', marginBottom: 4 },
    modalSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#666', marginBottom: 20, textAlign: 'center' },
    actions: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    confirmBtn: { flex: 1, backgroundColor: '#111', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    cancelText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#4B5563' },
    confirmText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff' },
});