import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export default function LegalModal({ visible, onClose, type }: LegalModalProps) {
  const content = {
    terms: {
      title: 'Terms of Service',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    },
    privacy: {
      title: 'Privacy Policy',
      text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    },
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{content[type].title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.bodyText}>
            {new Array(8).fill(content[type].text).join('\n\n')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  closeBtn: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { padding: 20 },
  bodyText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: '#444' },
});