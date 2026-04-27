import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { ONBOARDING_SLIDES } from '../../constants/onboarding';
import Button from '../ui/Button';
import OnboardingSlide from './OnboardingSlide';

const { width } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

const NextIcon = () => <Ionicons name="chevron-forward" size={16} color="#0A0A0A" />;
const DoneIcon = () => <Ionicons name="checkmark" size={16} color="#0A0A0A" />;

export default function OnboardingScreen({ onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handleMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <OnboardingSlide {...item} isActive={index === currentIndex} />
        )}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View
        style={[
          styles.bottomOverlay,
          { paddingBottom: Platform.OS === 'ios' ? 44 : 32 },
        ]}
      >
        <View style={styles.actionRow}>
          <Button
            label="Skip"
            onPress={onFinish}
            variant="ghost"
            size="md"
            style={isLast ? styles.hidden : undefined}
          />

          <Button
            label={isLast ? 'Get Started' : 'Continue'}
            onPress={handleNext}
            variant="primary"
            size="md"
            icon={isLast ? <DoneIcon /> : <NextIcon />}
            iconPosition="right"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hidden: {
    opacity: 0,
  },
});