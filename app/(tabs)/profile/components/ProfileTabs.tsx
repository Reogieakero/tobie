import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type Tab = 'listings' | 'bids' | 'won';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const TABS: { key: Tab; icon: string; activeIcon: string }[] = [
  { key: 'listings', icon: 'grid-outline', activeIcon: 'grid' },
  { key: 'bids', icon: 'hammer-outline', activeIcon: 'hammer' },
  { key: 'won', icon: 'trophy-outline', activeIcon: 'trophy' },
];

export default function ProfileTabs({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(isActive ? tab.activeIcon : tab.icon) as any}
              size={22}
              color={isActive ? '#111' : '#AAA'}
            />
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#EBEBEB',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {
    borderTopWidth: 1.5,
    borderTopColor: '#111',
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF6B35',
  },
});