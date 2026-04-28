import { ThemeProvider } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import { LogBox, StatusBar as RNStatusBar, View } from "react-native";
import FlashMessage from "react-native-flash-message";

LogBox.ignoreLogs(['TypeError: Network request failed']);

export default function RootLayout() {
  return (
    <ThemeProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <FlashMessage position="top" statusBarHeight={RNStatusBar.currentHeight} />
      </View>
    </ThemeProvider>
  );
}