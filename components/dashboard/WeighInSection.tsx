import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWeighInStore } from '../../stores/weighInStore';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { MeasurementPeriod } from '../../types/database';

export const WeighInSection: React.FC = () => {
  const { logWeight, getTodayWeighIn } = useWeighInStore();

  const morningEntry = getTodayWeighIn('morning');
  const nightEntry = getTodayWeighIn('night');

  const [activeModalPeriod, setActiveModalPeriod] = useState<MeasurementPeriod | null>(null);
  const [inputWeight, setInputWeight] = useState<string>('');

  const handleOpenLog = (period: MeasurementPeriod) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const existing = period === 'morning' ? morningEntry : nightEntry;
    setInputWeight(existing ? String(existing.weight_kg) : '');
    setActiveModalPeriod(period);
  };

  const handleSaveWeight = async () => {
    if (!activeModalPeriod) return;
    const val = parseFloat(inputWeight);
    if (!isNaN(val) && val > 0) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      await logWeight({ weightKg: val, period: activeModalPeriod });
    }
    setActiveModalPeriod(null);
    setInputWeight('');
  };

  return (
    <Card variant="secondary" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Icon name="Scales" size="sm" color={colors.brand.primary} weight="fill" />
          <Text style={[typography.headline, styles.title]}>Body Weight</Text>
        </View>
        <Text style={[typography.caption1, styles.hintText]}>Morning & Night</Text>
      </View>

      <View style={styles.periodsRow}>
        {/* Morning Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleOpenLog('morning')}
          style={[styles.periodCol, morningEntry && styles.periodColDone]}
        >
          <View style={styles.periodHeader}>
            <Icon
              name="Sun"
              size="xs"
              color={morningEntry ? colors.status.warning : colors.text.tertiary}
              weight="bold"
            />
            <Text style={[typography.caption1, styles.periodLabel]}>Morning</Text>
          </View>
          {morningEntry ? (
            <View style={styles.valueRow}>
              <Text style={[typography.title3, styles.weightNumber]}>
                {morningEntry.weight_kg}
              </Text>
              <Text style={[typography.caption2, styles.unitText]}>kg</Text>
            </View>
          ) : (
            <Text style={[typography.footnote, styles.tapToLog]}>Tap to log</Text>
          )}
        </TouchableOpacity>

        {/* Night Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleOpenLog('night')}
          style={[styles.periodCol, nightEntry && styles.periodColDone]}
        >
          <View style={styles.periodHeader}>
            <Icon
              name="Moon"
              size="xs"
              color={nightEntry ? colors.status.info : colors.text.tertiary}
              weight="bold"
            />
            <Text style={[typography.caption1, styles.periodLabel]}>Night</Text>
          </View>
          {nightEntry ? (
            <View style={styles.valueRow}>
              <Text style={[typography.title3, styles.weightNumber]}>
                {nightEntry.weight_kg}
              </Text>
              <Text style={[typography.caption2, styles.unitText]}>kg</Text>
            </View>
          ) : (
            <Text style={[typography.footnote, styles.tapToLog]}>Tap to log</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Inline Quick Modal / Form if active */}
      {activeModalPeriod && (
        <View style={styles.inputSheet}>
          <Text style={[typography.subhead, styles.sheetTitle]}>
            Record {activeModalPeriod === 'morning' ? 'Morning' : 'Night'} Weight (kg)
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              value={inputWeight}
              onChangeText={setInputWeight}
              placeholder="e.g. 78.5"
              placeholderTextColor={colors.text.muted}
              keyboardType="decimal-pad"
              autoFocus
              style={styles.textInput}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveWeight}
              style={styles.saveButton}
            >
              <Text style={[typography.subhead, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveModalPeriod(null)}
              style={styles.cancelButton}
            >
              <Icon name="X" size="xs" color={colors.text.tertiary} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    marginLeft: 6,
  },
  hintText: {
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  periodsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  periodCol: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  periodColDone: {
    borderColor: 'rgba(255, 59, 48, 0.25)',
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  periodLabel: {
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightNumber: {
    color: colors.text.primary,
    fontWeight: '800',
  },
  unitText: {
    color: colors.text.secondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  tapToLog: {
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  inputSheet: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  sheetTitle: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background.primary,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    height: 44,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.brand.primary,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
