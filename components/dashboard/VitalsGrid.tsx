import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHydrationStore } from '../../stores/hydrationStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useWeighInStore } from '../../stores/weighInStore';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { NoiseBackground } from '../ui/NoiseBackground';
import { MeasurementPeriod } from '../../types/database';

export const VitalsGrid: React.FC = () => {
  const { logWater, getTodayTotalMl } = useHydrationStore();
  const { water_target_ml } = useSettingsStore();
  const { logWeight, getTodayWeighIn } = useWeighInStore();

  const totalWater = getTodayTotalMl();
  const waterProgress = water_target_ml > 0 ? Math.min(totalWater / water_target_ml, 1) : 0;

  const morningWeight = getTodayWeighIn('morning');
  const nightWeight = getTodayWeighIn('night');

  const [activeWeightPeriod, setActiveWeightPeriod] = useState<MeasurementPeriod | null>(null);
  const [weightInput, setWeightInput] = useState('');

  const handleQuickAddWater = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await logWater(250);
  };

  const handleOpenWeightModal = (period: MeasurementPeriod) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const existing = period === 'morning' ? morningWeight : nightWeight;
    setWeightInput(existing ? String(existing.weight_kg) : '');
    setActiveWeightPeriod(period);
  };

  const handleSaveWeight = async () => {
    if (!activeWeightPeriod) return;
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      await logWeight({ weightKg: val, period: activeWeightPeriod });
    }
    setActiveWeightPeriod(null);
    setWeightInput('');
  };

  return (
    <View style={styles.gridContainer}>
      {/* 1. Hydration Card */}
      <Card variant="secondary" style={styles.vitalsCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
            <Icon name="Drop" size="sm" color={colors.status.info} weight="fill" />
            <Text style={styles.cardLabel}>Water</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleQuickAddWater}
            style={styles.quickAddPill}
          >
            <Icon name="Plus" size="xs" color={colors.status.info} weight="bold" />
            <Text style={styles.quickAddPillText}>250ml</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.primaryMetric}>{totalWater}</Text>
          <Text style={styles.metricTarget}> / {water_target_ml} ml</Text>
        </View>

        {/* Minimal Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.round(waterProgress * 100)}%` },
            ]}
          />
        </View>
      </Card>

      {/* 2. Weight Card */}
      <Card variant="secondary" style={styles.vitalsCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
            <Icon name="Scales" size="sm" color={colors.status.warning} weight="fill" />
            <Text style={styles.cardLabel}>Weight</Text>
          </View>
        </View>

        <View style={styles.weightRowsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenWeightModal('morning')}
            style={styles.weightItem}
          >
            <View style={styles.periodIconTag}>
              <Icon name="Sun" size="xs" color={colors.status.warning} weight="bold" />
            </View>
            <Text style={styles.weightValueText}>
              {morningWeight ? `${morningWeight.weight_kg} kg` : 'Log AM'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenWeightModal('night')}
            style={styles.weightItem}
          >
            <View style={styles.periodIconTag}>
              <Icon name="Moon" size="xs" color={colors.status.info} weight="bold" />
            </View>
            <Text style={styles.weightValueText}>
              {nightWeight ? `${nightWeight.weight_kg} kg` : 'Log PM'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Weight Modal */}
      <Modal
        visible={!!activeWeightPeriod}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveWeightPeriod(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <NoiseBackground style={styles.modalInner}>
              <Text style={styles.modalHeading}>
                Log {activeWeightPeriod === 'morning' ? 'Morning' : 'Night'} Weight
              </Text>
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="78.5"
                placeholderTextColor={colors.text.muted}
                keyboardType="decimal-pad"
                autoFocus
                style={styles.modalInput}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setActiveWeightPeriod(null)}
                  style={styles.modalCancel}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveWeight}
                  style={styles.modalSave}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </NoiseBackground>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  vitalsCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: '#161618',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'space-between',
    minHeight: 128,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  quickAddPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    gap: 2,
  },
  quickAddPillText: {
    color: colors.status.info,
    fontSize: 11,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: spacing.xs,
  },
  primaryMetric: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metricTarget: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.status.info,
    borderRadius: 2,
  },
  weightRowsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  weightItem: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodIconTag: {
    marginBottom: 2,
  },
  weightValueText: {
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  modalInner: {
    padding: spacing.xl,
  },
  modalHeading: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalInput: {
    height: 52,
    backgroundColor: colors.background.primary,
    borderRadius: radii.md,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancel: {
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
  modalSave: {
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
