import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from './Icon';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: IconName;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  accent?: boolean;
}

export function SegmentedControl<T extends string = string>({
  options,
  selectedValue,
  onSelect,
  accent = false,
}: SegmentedControlProps<T>) {
  const handleSelect = (val: T) => {
    if (val !== selectedValue) {
      try {
        Haptics.selectionAsync();
      } catch {}
      onSelect(val);
    }
  };

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.8}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.segment,
              isSelected && (accent ? styles.segmentActiveAccent : styles.segmentActive),
            ]}
          >
            {option.icon && (
              <View style={styles.iconContainer}>
                <Icon
                  name={option.icon}
                  size="xs"
                  color={isSelected ? (accent ? '#FFFFFF' : colors.text.primary) : colors.text.tertiary}
                  weight={isSelected ? 'bold' : 'regular'}
                />
              </View>
            )}
            <Text
              style={[
                typography.subhead,
                styles.segmentText,
                isSelected && (accent ? styles.segmentTextActiveAccent : styles.segmentTextActive),
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: radii.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  segmentActive: {
    backgroundColor: colors.background.tertiary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentActiveAccent: {
    backgroundColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 6,
  },
  segmentText: {
    color: colors.text.secondary,
    fontWeight: '500',
    fontSize: 14,
  },
  segmentTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  segmentTextActiveAccent: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
