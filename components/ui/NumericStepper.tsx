import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { radii, spacing, layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from './Icon';

interface QuickChip {
  label: string;
  value: number;
  isDelta?: boolean;
}

interface NumericStepperProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (newValue: number) => void;
  accentColor?: string;
  quickChips?: QuickChip[];
  allowZero?: boolean;
}

export const NumericStepper: React.FC<NumericStepperProps> = ({
  label,
  value,
  step = 1,
  min = 0,
  max = 999,
  unit = '',
  onChange,
  accentColor = colors.brand.primary,
  quickChips,
  allowZero = true,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [typedValue, setTypedValue] = useState(String(value));

  const handleDecrement = () => {
    const nextVal = Math.max(min, Math.round((value - step) * 100) / 100);
    if (nextVal !== value) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onChange(nextVal);
    }
  };

  const handleIncrement = () => {
    const nextVal = Math.min(max, Math.round((value + step) * 100) / 100);
    if (nextVal !== value) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onChange(nextVal);
    }
  };

  const handleApplyChip = (chip: QuickChip) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    let target = chip.isDelta ? value + chip.value : chip.value;
    target = Math.max(min, Math.min(max, Math.round(target * 100) / 100));
    onChange(target);
  };

  const handleOpenDirectInput = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setTypedValue(value > 0 ? String(value) : '');
    setIsEditModalOpen(true);
  };

  const handleSaveTypedValue = () => {
    const parsed = parseFloat(typedValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, Math.round(parsed * 100) / 100));
      onChange(clamped);
    } else if (allowZero) {
      onChange(0);
    }
    setIsEditModalOpen(false);
  };

  const displayValue = value === 0 && !allowZero ? '—' : value;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[typography.subhead, styles.label]}>{label}</Text>
        <TouchableOpacity onPress={handleOpenDirectInput} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.tapToEditText}>Tap number to type</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDecrement}
          disabled={value <= min}
          style={[styles.button, value <= min && styles.buttonDisabled]}
        >
          <Icon
            name="Minus"
            size="sm"
            color={value <= min ? colors.text.muted : colors.text.primary}
            weight="bold"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleOpenDirectInput}
          style={styles.valueContainer}
        >
          <Text style={[typography.metricMedium, styles.valueText]}>
            {displayValue}
          </Text>
          {unit ? <Text style={[typography.footnote, styles.unitText]}>{unit}</Text> : null}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleIncrement}
          disabled={value >= max}
          style={[styles.button, value >= max && styles.buttonDisabled, { borderColor: accentColor }]}
        >
          <Icon
            name="Plus"
            size="sm"
            color={value >= max ? colors.text.muted : accentColor}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      {/* Quick Chips if provided */}
      {quickChips && quickChips.length > 0 && (
        <View style={styles.chipsRow}>
          {quickChips.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => handleApplyChip(chip)}
              style={styles.chipButton}
            >
              <Text style={styles.chipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Direct Numeric Input Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter {label}</Text>
            <TextInput
              value={typedValue}
              onChangeText={setTypedValue}
              placeholder="0"
              placeholderTextColor={colors.text.muted}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
              onSubmitEditing={handleSaveTypedValue}
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTypedValue}
                style={styles.modalSaveBtn}
              >
                <Text style={styles.modalSaveText}>Set Value</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161618',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text.secondary,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  tapToEditText: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: '500',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    width: 48,
    height: 48,
    minHeight: layout.minTouchTarget,
    borderRadius: radii.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.35,
    borderColor: 'transparent',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  valueText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 32,
  },
  unitText: {
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chipButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: 7,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalBox: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  modalInput: {
    width: '100%',
    height: 52,
    backgroundColor: colors.background.primary,
    borderRadius: radii.md,
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.brand.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
