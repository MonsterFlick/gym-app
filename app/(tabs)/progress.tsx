import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NoiseBackground } from '../../components/ui/NoiseBackground';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useHydrationStore } from '../../stores/hydrationStore';
import { useWeighInStore } from '../../stores/weighInStore';

export default function ProgressScreen() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const { completedSessions } = useWorkoutStore();
  const { entries: waterEntries, getTodayTotalMl } = useHydrationStore();
  const { entries: weightEntries } = useWeighInStore();

  // Compute workout metrics
  const totalCompletedWorkouts = completedSessions.filter((s) => s.status === 'completed').length;
  const totalCompletedSets = completedSessions.reduce((acc, s) => {
    return acc + (s.sets?.filter((st) => st.status === 'completed').length || 0);
  }, 0);

  // Separate morning and night weigh-ins
  const morningWeights = weightEntries
    .filter((w) => w.measurement_period === 'morning')
    .slice(0, 7);
  const nightWeights = weightEntries
    .filter((w) => w.measurement_period === 'night')
    .slice(0, 7);

  const avgMorning =
    morningWeights.length > 0
      ? (
          morningWeights.reduce((acc, w) => acc + Number(w.weight_kg), 0) /
          morningWeights.length
        ).toFixed(1)
      : null;

  const avgNight =
    nightWeights.length > 0
      ? (
          nightWeights.reduce((acc, w) => acc + Number(w.weight_kg), 0) /
          nightWeights.length
        ).toFixed(1)
      : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <NoiseBackground style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.caption1, styles.sectionSubtitle]}>ANALYTICS & METRICS</Text>
          <Text style={[typography.largeTitle, styles.headerTitle]}>Progress</Text>
        </View>

        <View style={styles.segmentContainer}>
          <SegmentedControl
            options={[
              { value: 'weekly', label: '7-Day View' },
              { value: 'monthly', label: '30-Day View' },
            ]}
            selectedValue={period}
            onSelect={(val) => setPeriod(val as any)}
            accent
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Workouts KPI Overview */}
          <Card variant="secondary" style={styles.metricCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.titleWithIcon}>
                <Icon name="Barbell" size="sm" color={colors.brand.primary} weight="fill" />
                <Text style={[typography.headline, styles.cardTitle]}>Workout Consistency</Text>
              </View>
              <Badge label="Verified" variant="primary" size="sm" />
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[typography.metricMedium, styles.statValue]}>
                  {totalCompletedWorkouts}
                </Text>
                <Text style={[typography.caption2, styles.statLabel]}>Sessions Done</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[typography.metricMedium, styles.statValue]}>
                  {totalCompletedSets}
                </Text>
                <Text style={[typography.caption2, styles.statLabel]}>Sets Recorded</Text>
              </View>
            </View>
          </Card>

          {/* Body Weight Progression (Separate Morning and Night Series) */}
          <Card variant="secondary" style={styles.metricCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.titleWithIcon}>
                <Icon name="Scales" size="sm" color={colors.status.warning} weight="fill" />
                <Text style={[typography.headline, styles.cardTitle]}>Weight Trends</Text>
              </View>
              <Text style={[typography.caption1, styles.hintText]}>Independent Series</Text>
            </View>

            <View style={styles.weightSeriesRow}>
              <View style={[styles.weightSeriesBox, { borderColor: 'rgba(255, 214, 10, 0.3)' }]}>
                <View style={styles.seriesHeader}>
                  <Icon name="Sun" size="xs" color={colors.status.warning} weight="bold" />
                  <Text style={[typography.caption1, styles.seriesLabel]}>Morning Avg</Text>
                </View>
                <Text style={[typography.title1, styles.seriesValue]}>
                  {avgMorning ? `${avgMorning} kg` : '—'}
                </Text>
                <Text style={[typography.caption2, styles.seriesSub]}>
                  {morningWeights.length} logs recorded
                </Text>
              </View>

              <View style={[styles.weightSeriesBox, { borderColor: 'rgba(10, 132, 255, 0.3)' }]}>
                <View style={styles.seriesHeader}>
                  <Icon name="Moon" size="xs" color={colors.status.info} weight="bold" />
                  <Text style={[typography.caption1, styles.seriesLabel]}>Night Avg</Text>
                </View>
                <Text style={[typography.title1, styles.seriesValue]}>
                  {avgNight ? `${avgNight} kg` : '—'}
                </Text>
                <Text style={[typography.caption2, styles.seriesSub]}>
                  {nightWeights.length} logs recorded
                </Text>
              </View>
            </View>
          </Card>

          {/* Hydration Analytics */}
          <Card variant="secondary" style={styles.metricCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.titleWithIcon}>
                <Icon name="Drop" size="sm" color={colors.status.info} weight="fill" />
                <Text style={[typography.headline, styles.cardTitle]}>Hydration Volume</Text>
              </View>
            </View>
            <View style={styles.statBoxSingle}>
              <Text style={[typography.metricMedium, styles.statValue]}>
                {getTodayTotalMl()} <Text style={[typography.subhead, styles.unitText]}>ml</Text>
              </Text>
              <Text style={[typography.caption1, styles.statLabel]}>Logged Today Across Sets & Routine</Text>
            </View>
          </Card>

          {/* Dietary & Hydration Discipline */}
          <Card variant="secondary" style={styles.metricCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.titleWithIcon}>
                <Icon name="Flame" size="sm" color={colors.brand.primary} weight="fill" />
                <Text style={[typography.headline, styles.cardTitle]}>Nutrition Discipline</Text>
              </View>
              <Badge label="ZERO COMPROMISE" variant="primary" size="sm" />
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[typography.metricMedium, styles.statValue]}>100%</Text>
                <Text style={[typography.caption2, styles.statLabel]}>Zero Refined Sugar</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[typography.metricMedium, styles.statValue]}>Clean</Text>
                <Text style={[typography.caption2, styles.statLabel]}>No Junk Food</Text>
              </View>
            </View>
          </Card>
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  segmentContainer: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },
  metricCard: {
    padding: spacing.lg,
  },
  cardHeaderRow: {
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
  cardTitle: {
    color: colors.text.primary,
    marginLeft: 6,
  },
  hintText: {
    color: colors.text.tertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  statBoxSingle: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  statValue: {
    color: colors.text.primary,
    fontWeight: '800',
  },
  unitText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  statLabel: {
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: '600',
  },
  weightSeriesRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  weightSeriesBox: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  seriesLabel: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  seriesValue: {
    color: colors.text.primary,
    fontWeight: '800',
  },
  seriesSub: {
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
