export type OnboardingSlideData = {
  id: string;
  title: string;
  subtitle: string;
  iconName: string; // lucide icon name
  accentShade: string;
  bgFrom: string;
  bgTo: string;
};

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: '1',
    title: 'Discover\nRare Finds',
    subtitle: 'Browse thousands of curated auctions. From antiques to electronics — all in one place.',
    iconName: 'Search',
    accentShade: '#FFFFFF',
    bgFrom: '#0A0A0A',
    bgTo: '#1C1C1C',
  },
  {
    id: '2',
    title: 'Bid in\nReal Time',
    subtitle: 'Instant notifications keep you ahead. Never lose a bid because you weren\'t watching.',
    iconName: 'Zap',
    accentShade: '#E0E0E0',
    bgFrom: '#0A0A0A',
    bgTo: '#222222',
  },
  {
    id: '3',
    title: 'Win &\nCollect',
    subtitle: 'Secure checkout, buyer protection, and fast delivery on everything you win.',
    iconName: 'Trophy',
    accentShade: '#C8C8C8',
    bgFrom: '#0A0A0A',
    bgTo: '#1A1A1A',
  },
];