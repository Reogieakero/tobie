import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { LiveBidding } from './components/LiveBidding';
import { ManagementGrid } from './components/ManagementGrid';
import { RevenueCard } from './components/RevenueCard';
import { ShopHeader } from './components/ShopHeader';
import { StatsGrid } from './components/StatsGrid';

interface MyShopProps {
  shopData: any;
}

export const MyShop = ({ shopData }: MyShopProps) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <ShopHeader
        shopName={shopData?.shop_name}
        category={shopData?.category}
        customLink={shopData?.custom_link}
      />
      <RevenueCard />
      <StatsGrid />
      <LiveBidding />
      <ManagementGrid />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  dashboardContent: { padding: 16 },
});

export default MyShop;