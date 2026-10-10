import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NoiseBackground } from '../../components/ui/NoiseBackground';
import { WorkoutSection } from '../../components/dashboard/WorkoutSection';
import { VitalsGrid } from '../../components/dashboard/VitalsGrid';
import { HabitSection } from '../../components/dashboard/HabitSection';
import { SupplementSection } from '../../components/dashboard/SupplementSection';
import { RestTimerWidget } from '../../components/workout/RestTimerWidget';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useHabitStore } from '../../stores/habitStore';
import { useHydrationStore } from '../../stores/hydrationStore';
import { useWeighInStore } from '../../stores/weighInStore';
import { useSupplementStore } from '../../stores/supplementStore';
import { useSettingsStore } from '../../stores/settingsStore';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const initWorkout = useWorkoutStore((s) => s.initialize);
  const loadHabits = useHabitStore((s) => s.loadHabits);
  const loadHydration = useHydrationStore((s) => s.loadHydration);
  const loadWeighIns = useWeighInStore((s) => s.loadWeighIns);
  const loadSupplements = useSupplementStore((s) => s.loadSupplements);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const loadAll = async () => {
    await Promise.all([
      initWorkout(),
      loadHabits(),
      loadHydration(),
      loadWeighIns(),
      loadSupplements(),
      loadSettings(),
    ]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <NoiseBackground style={styles.noiseContainer}>
        {/* Top Header with generous spacing */}
        <View style={styles.header}>
          <Text style={styles.dateSubtitle}>
            {todayDateFormatted.toUpperCase()}
          </Text>
          <Text style={[typography.largeTitle, styles.headerTitle]}>
            Today
          </Text>
        </View>

        {/* Global Floating Rest Timer if Active */}
        <RestTimerWidget />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand.primary}
            />
          }
        >
          {/* 1. Hero Workout Card */}
          <WorkoutSection />

          {/* 2. Vitals (Hydration + Body Weight 2-Column Grid) */}
          <VitalsGrid />

          {/* 3. Daily Discipline Habits */}
          <HabitSection />

          {/* 4. Supplements */}
          <SupplementSection />
        </ScrollView>
      </NoiseBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  noiseContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  dateSubtitle: {
    color: colors.brand.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: spacing.massive,
    gap: 18,
  },
});
