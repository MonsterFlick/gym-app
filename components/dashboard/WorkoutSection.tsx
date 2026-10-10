import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../../stores/workoutStore';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export const WorkoutSection: React.FC = () => {
  const router = useRouter();
  const { activeSession, workoutDays, startWorkout } = useWorkoutStore();

  const currentDayOfWeek = (() => {
    const day = new Date().getDay();
    return day === 0 ? 7 : day;
  })();

  const todayWorkoutDay =
    workoutDays.find((d) => d.day_number === currentDayOfWeek) || workoutDays[0];

  const handleStartWorkout = async () => {
    if (!activeSession) {
      await startWorkout(todayWorkoutDay.day_number);
    }
    router.push('/(tabs)/workout');
  };

  const handleResumeWorkout = () => {
    router.push('/(tabs)/workout');
  };

  if (activeSession) {
    return (
      <Card variant="secondary" style={[styles.card, styles.activeCard]}>
        <View style={styles.topRow}>
          <View style={styles.tag}>
            <View style={styles.activeDot} />
            <Text style={styles.tagText}>IN PROGRESS</Text>
          </View>
        </View>

        <Text style={[typography.title1, styles.title]}>
          {activeSession.workout_day?.name || 'Workout Session'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleResumeWorkout}
          style={styles.primaryButton}
        >
          <Icon name="Play" size="sm" color="#FFFFFF" weight="fill" />
          <Text style={styles.buttonText}>Resume Session</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  if (todayWorkoutDay.is_rest_day) {
    return (
      <Card variant="secondary" style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.tagTextMuted}>DAY {todayWorkoutDay.day_number} • REST</Text>
        </View>

        <Text style={[typography.title2, styles.title]}>{todayWorkoutDay.name}</Text>
        <Text style={styles.restSub}>Focus on recovery and clean nutrition today.</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleStartWorkout}
          style={styles.secondaryButton}
        >
          <Icon name="Barbell" size="sm" color={colors.text.secondary} weight="bold" />
          <Text style={styles.secondaryButtonText}>Start Workout Anyway</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <Card variant="secondary" style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.tagTextRed}>
          DAY {todayWorkoutDay.day_number} • {todayWorkoutDay.workout_type.toUpperCase()}
        </Text>
      </View>

      <Text style={[typography.title1, styles.title]}>{todayWorkoutDay.name}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleStartWorkout}
        style={styles.primaryButton}
      >
        <Icon name="Play" size="sm" color="#FFFFFF" weight="fill" />
        <Text style={styles.buttonText}>Start Workout</Text>
      </TouchableOpacity>
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
  activeCard: {
    borderColor: 'rgba(255, 59, 48, 0.35)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.primary,
  },
  tagText: {
    color: colors.brand.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  tagTextRed: {
    color: colors.brand.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  tagTextMuted: {
    color: colors.text.tertiary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: spacing.lg,
    letterSpacing: -0.4,
  },
  restSub: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    height: 52,
    backgroundColor: colors.brand.primary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    height: 48,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
});
