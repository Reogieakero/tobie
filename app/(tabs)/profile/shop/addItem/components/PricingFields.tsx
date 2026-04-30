import React from 'react';
import { StyleSheet, View } from 'react-native';

import AnimatedInput from '@/components/ui/AnimatedInput';
import ValidatedField from './ValidatedField';

type FormData = {
  price: string;
  targetBid: string;
  minIncrement: string;
  quantity: string;
};

type FieldValidation = {
  price: boolean;
  targetBid: boolean;
  minIncrement: boolean;
};

type Errors = Partial<Record<keyof FieldValidation, string>>;

type Props = {
  sellingType: 'auction' | 'posted' | 'fast_flip';
  formData: FormData;
  fieldValidation: FieldValidation;
  errors: Errors;
  onChange: (data: Partial<FormData>) => void;
};

export default function PricingFields({
  sellingType,
  formData,
  fieldValidation,
  errors,
  onChange,
}: Props) {
  const isAuction = sellingType === 'auction';

  return (
    <>
      {/* Price + Target Bid */}
      <View style={styles.row}>
        <ValidatedField
          isValid={fieldValidation.price}
          hasValue={formData.price.trim() !== ''}
          error={errors.price}
        >
          <AnimatedInput
            placeholder={isAuction ? 'STARTING BID (₱)' : 'PRICE (₱)'}
            value={formData.price}
            keyboardType="numeric"
            onChangeText={(t) => onChange({ price: t })}
          />
        </ValidatedField>

        {isAuction && (
          <View style={styles.rightField}>
            <ValidatedField
              isValid={fieldValidation.targetBid}
              hasValue={formData.targetBid.trim() !== ''}
              error={errors.targetBid}
            >
              <AnimatedInput
                placeholder="TARGET BID (₱)"
                value={formData.targetBid}
                keyboardType="numeric"
                onChangeText={(t) => onChange({ targetBid: t })}
              />
            </ValidatedField>
          </View>
        )}
      </View>

      {/* Quantity + Min Increment */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <AnimatedInput
            placeholder="QUANTITY"
            value={formData.quantity}
            keyboardType="numeric"
            onChangeText={(t) => onChange({ quantity: t })}
          />
        </View>

        {isAuction && (
          <View style={styles.rightField}>
            <ValidatedField
              isValid={fieldValidation.minIncrement}
              hasValue={formData.minIncrement.trim() !== ''}
              error={errors.minIncrement}
            >
              <AnimatedInput
                placeholder="MIN BID INCREMENT (₱)"
                value={formData.minIncrement}
                keyboardType="numeric"
                onChangeText={(t) => onChange({ minIncrement: t })}
              />
            </ValidatedField>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rightField: { flex: 1, marginLeft: 16 },
});