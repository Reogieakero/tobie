import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  bidderName: string;
  amount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SellConfirmOverlay({ visible, bidderName, amount, onCancel, onConfirm }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>CONFIRM SALE</Text>
          <Text style={styles.sub}>
            Sell this item to <Text style={styles.highlight}>{bidderName}</Text> for 
            <Text style={styles.highlight}> ₱{amount.toLocaleString()}</Text>?
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 16 
  },
  card: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 24, 
    alignItems: 'center', 
    elevation: 10 
  },
  title: { 
    fontFamily: 'Unbounded_700Bold', 
    fontSize: 14, 
    color: '#111', 
    marginBottom: 8, 
    letterSpacing: 1 
  },
  sub: { 
    fontFamily: 'Inter_400Regular', 
    fontSize: 13, 
    color: '#64748B', 
    textAlign: 'center', 
    marginBottom: 24, 
    lineHeight: 20 
  },
  highlight: { 
    color: '#111', 
    fontWeight: '700' 
  },
  actions: { 
    flexDirection: 'row', 
    gap: 12 
  },
  cancelBtn: { 
    flex: 1, 
    backgroundColor: '#F1F5F9', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  confirmBtn: { 
    flex: 1, 
    backgroundColor: '#10B981', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  cancelText: { 
    fontWeight: '700', 
    fontSize: 12, 
    color: '#64748B' 
  },
  confirmText: { 
    fontWeight: '700', 
    fontSize: 12, 
    color: '#fff' 
  },
});