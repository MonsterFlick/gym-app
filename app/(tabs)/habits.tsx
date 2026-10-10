import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NoiseBackground } from '../../components/ui/NoiseBackground';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { useHabitStore } from '../../stores/habitStore';
import { HabitStatus } from '../../types/database';

export default function HabitsScreen() {
  const { habits, logs, createHabit, updateHabitStatus, getStatusForDate } = useHabitStore();

  const today = new Date().toISOString().split('T')[0];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');

  const activeHabits = habits.filter((h) => h.is_active);

  const handleCycleStatus = async (habitId: string, currentStatus: HabitStatus | null) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    let nextStatus: HabitStatus;
    if (currentStatus === 'completed') {
      nextStatus = 'skipped';
    } else if (currentStatus === 'skipped') {
      nextStatus = 'missed';
    } else {
      nextStatus = 'completed';
    }

    await updateHabitStatus(habitId, nextStatus, today);
  };

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    await createHabit(newHabitName.trim(), newHabitDesc.trim());
    setNewHabitName('');
    setNewHabitDesc('');
    setIsCreateModalOpen(false);
  };

  // Generate last 7 days array for adherence streak dots
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    return d.toISOString().split('T')[0];
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <NoiseBackground style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={[typography.caption1, styles.sectionSubtitle]}>DAILY DISCIPLINE</Text>
            <TouchableOpacity
              onPress={() => setIsCreateModalOpen(true)}
              style={styles.addBtn}
              activeOpacity={0.7}
            >
              <Icon name="Plus" size="xs" color="#FFFFFF" weight="bold" />
              <Text style={[typography.caption1, styles.addBtnText]}>New Habit</Text>
            </TouchableOpacity>
          </View>
          <Text style={[typography.largeTitle, styles.headerTitle]}>Habits</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeHabits.map((habit) => {
            const todayStatus = getStatusForDate(habit.id, today);
            const isCompleted = todayStatus === 'completed';

            // Calculate completed days in last 7 days
            const completedCount7Days = last7Days.filter(
              (d) => getStatusForDate(habit.id, d) === 'completed'
            ).length;

            return (
              <Card key={habit.id} variant="secondary" style={styles.habitCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleCol}>
                    <Text style={[typography.title3, styles.habitName]}>{habit.name}</Text>
                    {habit.description && (
                      <Text style={[typography.footnote, styles.habitDesc]}>
                        {habit.description}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleCycleStatus(habit.id, todayStatus)}
                    style={[styles.statusToggle, isCompleted && styles.statusToggleDone]}
                  >
                    <Icon
                      name={isCompleted ? 'Check' : 'Plus'}
                      size="sm"
                      color={isCompleted ? '#FFFFFF' : colors.text.secondary}
                      weight="bold"
                    />
                  </TouchableOpacity>
                </View>

                {/* 7-Day History Heatmap Dots */}
                <View style={styles.streakRow}>
                  <Text style={[typography.caption2, styles.streakLabel]}>
                    Last 7 days ({completedCount7Days}/7)
                  </Text>
                  <View style={styles.dotsContainer}>
                    {last7Days.map((dateStr) => {
                      const st = getStatusForDate(habit.id, dateStr);
                      const isDone = st === 'completed';
                      const isMiss = st === 'missed';
                      const isSkip = st === 'skipped';
                      const isTodayDot = dateStr === today;

                      return (
                        <View
                          key={dateStr}
                          style={[
                            styles.dot,
                            isDone && styles.dotDone,
                            isMiss && styles.dotMiss,
                            isSkip && styles.dotSkip,
                            isTodayDot && styles.dotToday,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              </Card>
            );
          })}
        </ScrollView>

        {/* Create Habit Modal */}
        <Modal
          visible={isCreateModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIsCreateModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <NoiseBackground style={styles.modalNoise}>
                <View style={styles.modalHeader}>
                  <Text style={[typography.title2, styles.modalTitle]}>New Habit</Text>
                  <TouchableOpacity
                    onPress={() => setIsCreateModalOpen(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Icon name="X" size="sm" color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[typography.caption1, styles.inputLabel]}>HABIT NAME</Text>
                  <TextInput
                    value={newHabitName}
                    onChangeText={setNewHabitName}
                    placeholder="e.g. 10,000 Steps or Read 20 Mins"
                    placeholderTextColor={colors.text.muted}
                    style={styles.inputField}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[typography.caption1, styles.inputLabel]}>DESCRIPTION (OPTIONAL)</Text>
                  <TextInput
                    value={newHabitDesc}
                    onChangeText={setNewHabitDesc}
                    placeholder="e.g. Clean mental focus routine"
                    placeholderTextColor={colors.text.muted}
                    style={styles.inputField}
                  />
                </View>

                <View style={styles.modalActions}>
                  <Button
                    label="Create Habit"
                    variant="primary"
                    size="lg"
                    icon="Check"
                    onPress={handleCreateHabit}
                  />
                </View>
              </NoiseBackground>
            </View>
          </View>
        </Modal>
      </NoiseBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    color: colors.brand.primary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },
  habitCard: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  habitName: {
    color: colors.text.primary,
  },
  habitDesc: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusToggleDone: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  streakRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakLabel: {
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.background.elevated,
  },
  dotDone: {
    backgroundColor: colors.status.success,
  },
  dotMiss: {
    backgroundColor: colors.status.error,
  },
  dotSkip: {
    backgroundColor: colors.text.tertiary,
  },
  dotToday: {
    borderWidth: 1.5,
    borderColor: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    overflow: 'hidden',
  },
  modalNoise: {
    padding: spacing.xl,
    paddingBottom: spacing.massive,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    color: colors.text.primary,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.text.secondary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  inputField: {
    height: 48,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  modalActions: {
    marginTop: spacing.md,
  },
});
