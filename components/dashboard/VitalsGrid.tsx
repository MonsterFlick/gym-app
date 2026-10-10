import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { MeasurementPeriod } from '../../types/database';

export const VitalsGrid: React.FC = () => {
  const {
    logWater,
    getTodayTotalMl,
    getTodayEntries,
    removeLatestWater,
    deleteEntry: deleteWaterEntry,
  } = useHydrationStore();
  const { water_target_ml } = useSettingsStore();
  const { logWeight, getTodayWeighIn, entries: weightEntries } = useWeighInStore();

  const totalWater = getTodayTotalMl();
  const waterProgress = water_target_ml > 0 ? Math.min(totalWater / water_target_ml, 1) : 0;
  const todayWaterEntries = getTodayEntries();

  const morningWeight = getTodayWeighIn('morning');
  const nightWeight = getTodayWeighIn('night');

  // Modals state
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [customWaterInput, setCustomWaterInput] = useState('');

  const [activeWeightPeriod, setActiveWeightPeriod] = useState<MeasurementPeriod | null>(null);
  const [weightInput, setWeightInput] = useState('');

  // ---------------------------------------------------------
  // Water Handlers
  // ---------------------------------------------------------
  const handleOpenWaterModal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCustomWaterInput('');
    setIsWaterModalOpen(true);
  };

  const handleAddWaterAmount = async (amount: number) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    await logWater(amount);
  };

  const handleRemoveWaterAmount = async (amount: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await removeLatestWater(amount);
  };

  const handleCustomAddWater = async () => {
    const val = parseInt(customWaterInput, 10);
    if (!isNaN(val) && val > 0) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      await logWater(val);
      setCustomWaterInput('');
    }
  };

  const handleDeleteWaterLog = async (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await deleteWaterEntry(id);
  };

  // ---------------------------------------------------------
  // Weight Handlers
  // ---------------------------------------------------------
  const handleOpenWeightModal = (period: MeasurementPeriod) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const existing = period === 'morning' ? morningWeight : nightWeight;
    const lastAnyWeight = weightEntries[0]?.weight_kg;
    const initialVal = existing?.weight_kg || lastAnyWeight || 75.0;
    setWeightInput(String(initialVal));
    setActiveWeightPeriod(period);
  };

  const handleAdjustWeight = (delta: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const current = parseFloat(weightInput) || 75.0;
    const next = Math.max(20, Math.round((current + delta) * 10) / 10);
    setWeightInput(String(next));
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
      {/* 1. Hydration Card (Tappable to manage water) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpenWaterModal}
        style={styles.cardTouchable}
      >
        <Card variant="secondary" style={styles.vitalsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <Icon name="Drop" size="sm" color={colors.status.info} weight="fill" />
              <Text style={styles.cardLabel}>Water</Text>
            </View>
            <View style={styles.manageBadge}>
              <Text style={styles.manageBadgeText}>MANAGE</Text>
            </View>
          </View>

          <View style={styles.hydrationMain}>
            <Text style={[typography.metricMedium, styles.waterValueText]}>
              {totalWater}
              <Text style={styles.waterUnitText}> ml</Text>
            </Text>
            <Text style={styles.targetSubText}>of {water_target_ml} ml target</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round(waterProgress * 100)}%` },
              ]}
            />
          </View>
        </Card>
      </TouchableOpacity>

      {/* 2. Weight Card */}
      <View style={styles.cardTouchable}>
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
      </View>

      {/* ======================================================== */}
      {/* 1. WATER MANAGEMENT MODAL */}
      {/* ======================================================== */}
      <Modal
        visible={isWaterModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsWaterModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsWaterModalOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconCircle, styles.waterIconCircle]}>
                <Icon name="Drop" size="sm" color={colors.status.info} weight="fill" />
              </View>
              <View style={styles.modalHeaderTextCol}>
                <Text style={styles.modalHeading}>Hydration Manager</Text>
                <Text style={styles.modalSub}>
                  {totalWater} ml logged • Goal: {water_target_ml} ml
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsWaterModalOpen(false)}
                style={styles.modalCloseCircle}
              >
                <Icon name="X" size="xs" color={colors.text.secondary} weight="bold" />
              </TouchableOpacity>
            </View>

            {/* Quick Add Chips */}
            <Text style={styles.sectionSmallLabel}>QUICK ADD WATER</Text>
            <View style={styles.chipsRow}>
              {[100, 250, 500, 750].map((amt) => (
                <TouchableOpacity
                  key={`add-${amt}`}
                  activeOpacity={0.7}
                  onPress={() => handleAddWaterAmount(amt)}
                  style={[styles.chipButton, styles.chipAdd]}
                >
                  <Text style={styles.chipAddText}>+{amt} ml</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Remove Chips */}
            <Text style={[styles.sectionSmallLabel, { marginTop: 12 }]}>REMOVE / UNDO</Text>
            <View style={styles.chipsRow}>
              {[100, 250, 500].map((amt) => (
                <TouchableOpacity
                  key={`rem-${amt}`}
                  activeOpacity={0.7}
                  onPress={() => handleRemoveWaterAmount(amt)}
                  style={[styles.chipButton, styles.chipRemove]}
                >
                  <Text style={styles.chipRemoveText}>-{amt} ml</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount Row */}
            <View style={styles.customAddRow}>
              <TextInput
                value={customWaterInput}
                onChangeText={setCustomWaterInput}
                placeholder="Custom ml (e.g. 350)"
                placeholderTextColor={colors.text.muted}
                keyboardType="number-pad"
                style={styles.customInput}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCustomAddWater}
                style={styles.customAddBtn}
              >
                <Text style={styles.customAddBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Today's Entries Log */}
            {todayWaterEntries.length > 0 && (
              <View style={styles.recentLogsContainer}>
                <Text style={styles.sectionSmallLabel}>TODAY'S LOGS</Text>
                <ScrollView style={styles.recentLogsList} showsVerticalScrollIndicator={false}>
                  {todayWaterEntries.slice(0, 5).map((entry) => {
                    const time = new Date(entry.logged_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <View key={entry.id} style={styles.logItemRow}>
                        <Text style={styles.logItemText}>
                          +{entry.quantity_ml} ml <Text style={styles.logItemTime}>({time})</Text>
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteWaterLog(entry.id)}
                          style={styles.trashBtn}
                        >
                          <Icon name="Trash" size="xs" color="#FF3B30" weight="bold" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsWaterModalOpen(false)}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* 2. WEIGHT MODAL */}
      {/* ======================================================== */}
      <Modal
        visible={!!activeWeightPeriod}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveWeightPeriod(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setActiveWeightPeriod(null)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconCircle}>
                <Icon
                  name={activeWeightPeriod === 'morning' ? 'Sun' : 'Moon'}
                  size="sm"
                  color={activeWeightPeriod === 'morning' ? colors.status.warning : colors.status.info}
                  weight="fill"
                />
              </View>
              <View style={styles.modalHeaderTextCol}>
                <Text style={styles.modalHeading}>
                  {activeWeightPeriod === 'morning' ? 'Morning Weigh-in' : 'Night Weigh-in'}
                </Text>
                <Text style={styles.modalSub}>Scale reading in kg</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="75.0"
                placeholderTextColor={colors.text.muted}
                keyboardType="decimal-pad"
                autoFocus
                style={styles.modalInput}
                selectTextOnFocus
              />
              <Text style={styles.unitSuffix}>kg</Text>
            </View>

            {/* Quick Adjustment Chips */}
            <View style={styles.quickChipsRow}>
              {[-0.5, -0.1, 0.1, 0.5].map((delta) => (
                <TouchableOpacity
                  key={delta}
                  activeOpacity={0.7}
                  onPress={() => handleAdjustWeight(delta)}
                  style={styles.quickChip}
                >
                  <Text style={styles.quickChipText}>
                    {delta > 0 ? `+${delta}` : delta}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveWeightPeriod(null)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveWeight}
                style={styles.modalSave}
              >
                <Text style={styles.modalSaveText}>Save Weight</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTouchable: {
    flex: 1,
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
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  manageBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.25)',
  },
  manageBadgeText: {
    color: colors.status.info,
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  hydrationMain: {
    marginVertical: 4,
  },
  waterValueText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  waterUnitText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  targetSubText: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.status.info,
    borderRadius: 2,
  },
  weightRowsContainer: {
    gap: 8,
    marginTop: 4,
  },
  weightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    gap: 8,
  },
  periodIconTag: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightValueText: {
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  modalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterIconCircle: {
    backgroundColor: 'rgba(10, 132, 255, 0.16)',
  },
  modalCloseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTextCol: {
    flex: 1,
  },
  modalHeading: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  modalSub: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  sectionSmallLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipAdd: {
    backgroundColor: 'rgba(10, 132, 255, 0.14)',
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  chipAddText: {
    color: colors.status.info,
    fontWeight: '800',
    fontSize: 11,
  },
  chipRemove: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.25)',
  },
  chipRemoveText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 11,
  },
  customAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  customInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#121214',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  customAddBtn: {
    backgroundColor: colors.status.info,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  recentLogsContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  recentLogsList: {
    maxHeight: 100,
  },
  logItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  logItemText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logItemTime: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '400',
  },
  trashBtn: {
    padding: 4,
  },
  doneBtn: {
    marginTop: 16,
    backgroundColor: colors.background.tertiary,
    height: 44,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Weight styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121214',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 60,
    marginBottom: spacing.md,
    paddingHorizontal: 16,
  },
  modalInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  unitSuffix: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
  },
  quickChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: spacing.lg,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancel: {
    flex: 1,
    height: 46,
    backgroundColor: '#2C2C2E',
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.text.secondary,
    fontWeight: '700',
  },
  modalSave: {
    flex: 1.4,
    height: 46,
    backgroundColor: colors.brand.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
