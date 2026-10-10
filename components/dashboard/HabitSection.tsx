import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHabitStore } from '../../stores/habitStore';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { HabitStatus } from '../../types/database';

export const HabitSection: React.FC = () => {
  const { habits, logs, updateHabitStatus, getStatusForDate } = useHabitStore();
  const today = new Date().toISOString().split('T')[0];

  const activeHabits = habits.filter((h) => h.is_active);

  const completedCount = activeHabits.filter(
    (h) => getStatusForDate(h.id, today) === 'completed'
  ).length;

  const handleToggleHabit = async (habitId: string, currentStatus: HabitStatus | null) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const nextStatus = currentStatus === 'completed' ? 'missed' : 'completed';
    await updateHabitStatus(habitId, nextStatus, today);
  };

  return (
    <Card variant="secondary" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="CheckCircle" size="sm" color={colors.status.success} weight="fill" />
          <Text style={styles.headerTitle}>Habits</Text>
        </View>
        <Text style={styles.countText}>
          {completedCount} / {activeHabits.length}
        </Text>
      </View>

      <View style={styles.list}>
        {activeHabits.map((habit, idx) => {
          const status = getStatusForDate(habit.id, today);
          const isDone = status === 'completed';
          const isLast = idx === activeHabits.length - 1;

          return (
            <TouchableOpacity
              key={habit.id}
              activeOpacity={0.7}
              onPress={() => handleToggleHabit(habit.id, status)}
              style={[styles.habitRow, !isLast && styles.habitRowBorder]}
            >
              <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                {isDone && <Icon name="Check" size="xs" color="#FFFFFF" weight="bold" />}
              </View>

              <Text style={[styles.habitName, isDone && styles.habitNameDone]}>
                {habit.name}
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
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  habitRowBorder: {
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
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  habitName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  habitNameDone: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
