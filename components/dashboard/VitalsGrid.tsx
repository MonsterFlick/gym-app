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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWeighInStore } from '../../stores/weighInStore';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { MeasurementPeriod } from '../../types/database';

export const VitalsGrid: React.FC = () => {
  const { logWeight, getTodayWeighIn, entries: weightEntries } = useWeighInStore();

  const morningWeight = getTodayWeighIn('morning');
  const nightWeight = getTodayWeighIn('night');

  const [activeWeightPeriod, setActiveWeightPeriod] = useState<MeasurementPeriod | null>(null);
  const [weightInput, setWeightInput] = useState('');

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

  const varianceKg =
    morningWeight && nightWeight
      ? (nightWeight.weight_kg - morningWeight.weight_kg).toFixed(1)
      : null;

  return (
    <View style={styles.container}>
      {/* Body Weight Card */}
      <Card variant="secondary" style={styles.weightCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
            <Icon name="Scales" size="sm" color={colors.brand.primary} weight="fill" />
            <Text style={[typography.headline, styles.cardTitle]}>Body Weight</Text>
          </View>
          <Badge label="TODAY" variant="neutral" size="sm" />
        </View>

        <Text style={styles.cardSubtitle}>
          Track morning fasting weight after waking and evening weight before bed.
        </Text>

        <View style={styles.periodRow}>
          {/* 1. Morning AM (Fasting) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenWeightModal('morning')}
            style={[
              styles.periodBox,
              morningWeight && styles.periodBoxActive,
            ]}
          >
            <View style={styles.periodBoxTop}>
              <View style={[styles.periodIconWrap, styles.morningIconWrap]}>
                <Icon name="Sun" size="xs" color="#FF9500" weight="fill" />
              </View>
              <Text style={styles.periodLabel}>AM Fasting</Text>
            </View>

            {morningWeight ? (
              <View style={styles.valueRow}>
                <Text style={styles.weightValueText}>{morningWeight.weight_kg}</Text>
                <Text style={styles.weightUnitText}>kg</Text>
              </View>
            ) : (
              <View style={styles.emptyActionRow}>
                <Icon name="Plus" size="xs" color={colors.brand.primary} weight="bold" />
                <Text style={styles.emptyActionText}>Log AM</Text>
              </View>
            )}

            <View style={styles.statusRow}>
              {morningWeight ? (
                <View style={styles.recordedTag}>
                  <Icon name="Check" size={10} color={colors.status.success} weight="bold" />
                  <Text style={styles.recordedText}>RECORDED</Text>
                </View>
              ) : (
                <Text style={styles.pendingText}>After wake-up</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* 2. Night PM (Evening) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenWeightModal('night')}
            style={[
              styles.periodBox,
              nightWeight && styles.periodBoxActive,
            ]}
          >
            <View style={styles.periodBoxTop}>
              <View style={[styles.periodIconWrap, styles.nightIconWrap]}>
                <Icon name="Moon" size="xs" color="#0A84FF" weight="fill" />
              </View>
              <Text style={styles.periodLabel}>PM Evening</Text>
            </View>

            {nightWeight ? (
              <View style={styles.valueRow}>
                <Text style={styles.weightValueText}>{nightWeight.weight_kg}</Text>
                <Text style={styles.weightUnitText}>kg</Text>
              </View>
            ) : (
              <View style={styles.emptyActionRow}>
                <Icon name="Plus" size="xs" color={colors.status.info} weight="bold" />
                <Text style={[styles.emptyActionText, { color: colors.status.info }]}>Log PM</Text>
              </View>
            )}

            <View style={styles.statusRow}>
              {nightWeight ? (
                <View style={styles.recordedTag}>
                  <Icon name="Check" size={10} color={colors.status.success} weight="bold" />
                  <Text style={styles.recordedText}>RECORDED</Text>
                </View>
              ) : (
                <Text style={styles.pendingText}>Before bed</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {varianceKg !== null && (
          <View style={styles.varianceRow}>
            <Icon
              name={Number(varianceKg) > 0 ? 'ArrowUp' : 'ArrowDown'}
              size="xs"
              color={Number(varianceKg) > 0 ? colors.brand.primary : colors.status.success}
              weight="bold"
            />
            <Text style={styles.varianceText}>
              Daily variance: {Number(varianceKg) > 0 ? `+${varianceKg}` : varianceKg} kg (AM vs PM)
            </Text>
          </View>
        )}
      </Card>

      {/* ======================================================== */}
      {/* WEIGHT LOGGING MODAL */}
      {/* ======================================================== */}
      <Modal
        visible={activeWeightPeriod !== null}
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
              <View
                style={[
                  styles.modalIconCircle,
                  activeWeightPeriod === 'morning' ? styles.morningIconWrap : styles.nightIconWrap,
                ]}
              >
                <Icon
                  name={activeWeightPeriod === 'morning' ? 'Sun' : 'Moon'}
                  size="sm"
                  color={activeWeightPeriod === 'morning' ? '#FF9500' : '#0A84FF'}
                  weight="fill"
                />
              </View>
              <View style={styles.modalHeaderTextCol}>
                <Text style={styles.modalHeading}>
                  {activeWeightPeriod === 'morning' ? 'Morning Fasting Weight' : 'Evening PM Weight'}
                </Text>
                <Text style={styles.modalSub}>
                  {activeWeightPeriod === 'morning'
                    ? 'Take right after waking up for baseline'
                    : 'Take before winding down to sleep'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveWeightPeriod(null)}
                style={styles.modalCloseCircle}
              >
                <Icon name="X" size="xs" color={colors.text.secondary} weight="bold" />
              </TouchableOpacity>
            </View>

            {/* Input row */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.weightTextInput}
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                autoFocus
                placeholder="75.0"
                placeholderTextColor={colors.text.muted}
                selectTextOnFocus
              />
              <Text style={styles.kgLabel}>kg</Text>
            </View>

            {/* Stepper chips */}
            <View style={styles.stepperRow}>
              {[-0.5, -0.1, 0.1, 0.5].map((delta) => (
                <TouchableOpacity
                  key={delta}
                  activeOpacity={0.7}
                  onPress={() => handleAdjustWeight(delta)}
                  style={styles.stepperChip}
                >
                  <Text style={styles.stepperChipText}>
                    {delta > 0 ? `+${delta}` : delta}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.modalActionButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveWeightPeriod(null)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSaveWeight}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Save Weigh-In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  weightCard: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  periodBox: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  periodBoxActive: {
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: '#1E1E22',
  },
  periodBoxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  periodIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  morningIconWrap: {
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
  },
  nightIconWrap: {
    backgroundColor: 'rgba(10, 132, 255, 0.16)',
  },
  periodLabel: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  weightValueText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  weightUnitText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 6,
  },
  emptyActionText: {
    color: colors.brand.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  statusRow: {
    marginTop: 4,
  },
  recordedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordedText: {
    color: colors.status.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pendingText: {
    color: colors.text.muted,
    fontSize: 11,
  },
  varianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  varianceText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    marginBottom: spacing.lg,
  },
  modalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTextCol: {
    flex: 1,
  },
  modalHeading: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  modalSub: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  modalCloseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121214',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: spacing.md,
  },
  weightTextInput: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 110,
    letterSpacing: -0.5,
  },
  kgLabel: {
    color: colors.brand.primary,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  stepperChip: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepperChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cancelBtnText: {
    color: colors.text.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
