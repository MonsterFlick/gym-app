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
import { DisciplineReminderCard } from '../../components/dashboard/DisciplineReminderCard';
import { WorkoutSection } from '../../components/dashboard/WorkoutSection';
import { VitalsGrid } from '../../components/dashboard/VitalsGrid';
import { TodayAlarmsCard } from '../../components/dashboard/TodayAlarmsCard';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useHydrationStore } from '../../stores/hydrationStore';
import { useWeighInStore } from '../../stores/weighInStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { initializeAllAlarms } from '../../services/notifications';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const initWorkout = useWorkoutStore((s) => s.initialize);
  const loadHydration = useHydrationStore((s) => s.loadHydration);
  const loadWeighIns = useWeighInStore((s) => s.loadWeighIns);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const loadAll = async () => {
    await Promise.all([
      initWorkout(),
      loadHydration(),
      loadWeighIns(),
      loadSettings(),
      initializeAllAlarms(),
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.dateSubtitle}>
                {todayDateFormatted.toUpperCase()}
              </Text>
              <Text style={[typography.largeTitle, styles.headerTitle]}>
                Om Thakur
              </Text>
            </View>
            <View style={styles.athleteBadge}>
              <Text style={styles.athleteBadgeText}>ATHLETE</Text>
            </View>
          </View>
        </View>

        {/* Scroll Content */}
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
          {/* 1. Daily Discipline Reminder: No Sugar, No Junk Food, Clean Fuel */}
          <DisciplineReminderCard />

          {/* 2. Today's Hero Workout Card */}
          <WorkoutSection />

          {/* 3. Vitals: Hydration & Body Weight 2-Column Grid */}
          <VitalsGrid />

          {/* 4. Daily Scheduled Alarms (6:30, 8:00, 10:00, 30m Water) */}
          <TodayAlarmsCard />
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
    paddingBottom: spacing.sm,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  athleteBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.28)',
  },
  athleteBadgeText: {
    color: colors.brand.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 16,
  },
});
