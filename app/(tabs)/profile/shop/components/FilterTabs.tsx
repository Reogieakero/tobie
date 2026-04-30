import { FilterType } from '@/hooks/useShopProducts';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const FILTERS: { id: FilterType; label: string; icon: string }[] = [
  { id: 'all',       label: 'All',       icon: 'grid-outline'      },
  { id: 'scheduled', label: 'Scheduled', icon: 'calendar-outline'  },
  { id: 'auction',   label: 'Auction',   icon: 'hammer-outline'    },
  { id: 'posted',    label: 'Fixed',     icon: 'pricetag-outline'  },
  { id: 'fast_flip', label: 'Fast Flip', icon: 'flash-outline'     },
];

interface Props {
  activeFilter: FilterType;
  counts: Record<FilterType, number>;
  onSelect: (id: FilterType) => void;
}

export default function FilterTabs({ activeFilter, counts, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {FILTERS.map((f) => {
          const active = activeFilter === f.id;
          const count = counts[f.id];
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onSelect(f.id)}
              activeOpacity={0.75}
            >
              <Ionicons 
                name={f.icon as any} 
                size={14} 
                color={active ? '#fff' : '#666'} 
              />
              <Text style={[styles.label, active && styles.labelActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[styles.badge, active && styles.badgeActive]}>
                  <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  content: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  tabActive: { backgroundColor: '#111', borderColor: '#111' },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#666' },
  labelActive: { color: '#fff' },
  badge: { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#666' },
  badgeTextActive: { color: '#fff' },
});