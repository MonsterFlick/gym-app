import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NoiseBackground } from '../../components/ui/NoiseBackground';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { useSettingsStore } from '../../stores/settingsStore';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function SettingsScreen() {
  const {
    water_target_ml,
    default_rest_seconds,
    weight_increment_kg,
    updateSettings,
  } = useSettingsStore();

  const handleSetWaterTarget = async (ml: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    await updateSettings({ water_target_ml: ml });
  };

  const handleSetRestSeconds = async (sec: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    await updateSettings({ default_rest_seconds: sec });
  };

  const handleSetIncrement = async (inc: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    await updateSettings({ weight_increment_kg: inc });
  };

  const handleExportData = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      const dump: Record<string, any> = {};
      stores.forEach(([k, v]) => {
        try {
          dump[k] = v ? JSON.parse(v) : null;
        } catch {
          dump[k] = v;
        }
      });

      const exportString = JSON.stringify(dump, null, 2);
      await Share.share({
        message: exportString,
        title: 'Gym-om Personal Fitness Backup Export',
      });
    } catch (err: any) {
      Alert.alert('Export Failed', err.message);
    }
  };

  const isConnected = isSupabaseConfigured();

  return (
    <SafeAreaView style={styles.safeArea}>
      <NoiseBackground style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.caption1, styles.sectionSubtitle]}>PREFERENCES & DATA</Text>
          <Text style={[typography.largeTitle, styles.headerTitle]}>Settings</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cloud Sync & Storage Status */}
          <Card variant="secondary" style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.titleWithIcon}>
                <Icon name="Lightning" size="sm" color={colors.brand.primary} weight="fill" />
                <Text style={[typography.headline, styles.cardTitle]}>Database & Storage</Text>
              </View>
              <Badge
                label={isConnected ? 'SUPABASE CONNECTED' : 'OFFLINE RESILIENT'}
                variant={isConnected ? 'success' : 'neutral'}
                size="sm"
              />
            </View>
            <Text style={[typography.footnote, styles.cardDesc]}>
              {isConnected
                ? 'Your workout logs and habits are synced directly with your private Supabase PostgreSQL instance.'
                : 'All gym logs, sets, and habits are persisted with zero-latency local storage. Configure Supabase in .env anytime.'}
            </Text>
          </Card>

          {/* Daily Water Target Setting */}
          <Card variant="secondary" style={styles.card}>
            <View style={styles.titleWithIcon}>
              <Icon name="Drop" size="sm" color={colors.status.info} weight="fill" />
              <Text style={[typography.headline, styles.cardTitle]}>Daily Water Target</Text>
            </View>
            <View style={styles.pillsRow}>
              {[2000, 2500, 3000, 3500, 4000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  activeOpacity={0.7}
                  onPress={() => handleSetWaterTarget(amount)}
                  style={[
                    styles.pill,
                    water_target_ml === amount && styles.pillActive,
                  ]}
                >
                  <Text
                    style={[
                      typography.subhead,
                      styles.pillText,
                      water_target_ml === amount && styles.pillTextActive,
                    ]}
                  >
                    {amount} ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Default Rest Timer Setting */}
          <Card variant="secondary" style={styles.card}>
            <View style={styles.titleWithIcon}>
              <Icon name="Timer" size="sm" color={colors.brand.primary} weight="fill" />
              <Text style={[typography.headline, styles.cardTitle]}>Default Rest Duration</Text>
            </View>
            <View style={styles.pillsRow}>
              {[45, 60, 90, 120, 150].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  activeOpacity={0.7}
                  onPress={() => handleSetRestSeconds(sec)}
                  style={[
                    styles.pill,
                    default_rest_seconds === sec && styles.pillActive,
                  ]}
                >
                  <Text
                    style={[
                      typography.subhead,
                      styles.pillText,
                      default_rest_seconds === sec && styles.pillTextActive,
                    ]}
                  >
                    {sec}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Weight Increment Preference */}
          <Card variant="secondary" style={styles.card}>
            <View style={styles.titleWithIcon}>
              <Icon name="Target" size="sm" color={colors.brand.primary} weight="fill" />
              <Text style={[typography.headline, styles.cardTitle]}>
                Suggestion Step Increment
              </Text>
            </View>
            <View style={styles.pillsRow}>
              {[1.0, 1.25, 2.0, 2.5, 5.0].map((inc) => (
                <TouchableOpacity
                  key={inc}
                  activeOpacity={0.7}
                  onPress={() => handleSetIncrement(inc)}
                  style={[
                    styles.pill,
                    weight_increment_kg === inc && styles.pillActive,
                  ]}
                >
                  <Text
                    style={[
                      typography.subhead,
                      styles.pillText,
                      weight_increment_kg === inc && styles.pillTextActive,
                    ]}
                  >
                    {inc} kg
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Data Export & Backup Action */}
          <Card variant="secondary" style={styles.card}>
            <View style={styles.titleWithIcon}>
              <Icon name="ShareNetwork" size="sm" color={colors.text.primary} weight="fill" />
              <Text style={[typography.headline, styles.cardTitle]}>Backup & Export</Text>
            </View>
            <Text style={[typography.footnote, styles.cardDesc]}>
              Generate a full JSON export of all logged workouts, sets, water entries, habits, and body weigh-ins.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleExportData}
              style={styles.exportButton}
            >
              <Icon name="ShareNetwork" size="sm" color="#FFFFFF" weight="bold" />
              <Text style={[typography.headline, styles.exportBtnText]}>
                Export Personal Fitness Data
              </Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cardDesc: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  pillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  pillText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  exportButton: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    gap: spacing.sm,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
