import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHydrationStore } from '../../stores/hydrationStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../ui/Card';
import { ProgressRing } from '../ui/ProgressRing';
import { Icon } from '../ui/Icon';

export const HydrationSection: React.FC = () => {
  const { entries, logWater, getTodayTotalMl } = useHydrationStore();
  const { water_target_ml, water_quick_amounts } = useSettingsStore();

  const totalMl = getTodayTotalMl();
  const progress = water_target_ml > 0 ? totalMl / water_target_ml : 0;
  const remainingMl = Math.max(0, water_target_ml - totalMl);

  const handleQuickAdd = async (amount: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await logWater(amount);
  };

  return (
    <Card variant="secondary" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Icon name="Drop" size="sm" color={colors.status.info} weight="fill" />
          <Text style={[typography.headline, styles.title]}>Hydration</Text>
        </View>
        <Text style={[typography.caption1, styles.targetLabel]}>
          Target: {water_target_ml} ml
        </Text>
      </View>

      <View style={styles.bodyRow}>
        <ProgressRing
          progress={progress}
          size={76}
          strokeWidth={7}
          color={colors.status.info}
          backgroundColor={colors.background.elevated}
        >
          <Text style={[typography.caption1, styles.progressPercent]}>
            {Math.round(progress * 100)}%
          </Text>
        </ProgressRing>

        <View style={styles.infoCol}>
          <Text style={[typography.metricMedium, styles.intakeNumber]}>
            {totalMl}{' '}
            <Text style={[typography.subhead, styles.unitText]}>ml</Text>
          </Text>
          <Text style={[typography.footnote, styles.remainingText]}>
            {remainingMl > 0 ? `${remainingMl} ml remaining` : 'Daily target achieved!'}
          </Text>
        </View>
      </View>

      {/* Quick Add Buttons */}
      <View style={styles.quickAddRow}>
        {water_quick_amounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            activeOpacity={0.7}
            onPress={() => handleQuickAdd(amount)}
            style={styles.quickAddButton}
          >
            <Icon name="Plus" size="xs" color={colors.status.info} weight="bold" />
            <Text style={[typography.caption1, styles.quickAddText]}>{amount} ml</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  targetLabel: {
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoCol: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  progressPercent: {
    color: colors.text.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  intakeNumber: {
    color: colors.text.primary,
    fontWeight: '800',
  },
  unitText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  remainingText: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAddButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: 4,
  },
  quickAddText: {
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
