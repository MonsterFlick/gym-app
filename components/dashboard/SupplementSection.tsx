import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSupplementStore } from '../../stores/supplementStore';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export const SupplementSection: React.FC = () => {
  const { getTodayLogs, updateLogStatus } = useSupplementStore();
  const items = getTodayLogs();

  const takenCount = items.filter((i) => i.log?.status === 'taken').length;

  const handleToggleTaken = async (supplementId: string, currentStatus: string | null) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const nextStatus = currentStatus === 'taken' ? 'missed' : 'taken';
    await updateLogStatus(supplementId, nextStatus as any);
  };

  return (
    <Card variant="secondary" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="Pill" size="sm" color={colors.brand.primary} weight="fill" />
          <Text style={styles.headerTitle}>Supplements</Text>
        </View>
        <Text style={styles.countText}>
          {takenCount} / {items.length}
        </Text>
      </View>

      <View style={styles.list}>
        {items.map(({ supplement, log }, idx) => {
          const isTaken = log?.status === 'taken';
          const isLast = idx === items.length - 1;

          return (
            <TouchableOpacity
              key={supplement.id}
              activeOpacity={0.7}
              onPress={() => handleToggleTaken(supplement.id, log?.status || null)}
              style={[styles.itemRow, !isLast && styles.itemRowBorder]}
            >
              <View style={[styles.checkbox, isTaken && styles.checkboxDone]}>
                {isTaken && <Icon name="Check" size="xs" color="#FFFFFF" weight="bold" />}
              </View>

              <View style={styles.infoCol}>
                <Text style={[styles.supplementName, isTaken && styles.supplementNameDone]}>
                  {supplement.name}
                </Text>
              </View>

              <Text style={styles.doseTag}>
                {supplement.dose_value}{supplement.dose_unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: '#161618',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  countText: {
    color: colors.text.tertiary,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  itemRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  infoCol: {
    flex: 1,
  },
  supplementName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  supplementNameDone: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  doseTag: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
