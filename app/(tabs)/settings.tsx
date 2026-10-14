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
import * as Linking from 'expo-linking';
import { initializeAllAlarms, sendTestNotification, sendTestWaterNotification } from '../../services/notifications';

export default function SettingsScreen() {
  const {
    default_rest_seconds,
    weight_increment_kg,
    updateSettings,
  } = useSettingsStore();

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

  const handleSyncAlarms = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await initializeAllAlarms();
      Alert.alert(
        'Loud Alarms Scheduled',
        '• 6:30 AM: Wake up & weigh-in (Loud 10s Alarm)\n• 8:00 AM: Creatine (Loud 10s Alarm)\n• 10:00 PM: Vitamin B Complex (Loud 10s Alarm)\n• 10 AM – 10 PM (Every 30m): Hydration reminder'
      );
    } catch (e: any) {
      Alert.alert('Alarm Error', e.message);
    }
  };

  const handleTestAlarm = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const sent = await sendTestNotification();
      if (sent) {
        Alert.alert('Test Scheduled', 'You will receive a loud alarm notification in 2 seconds.');
      } else {
        Alert.alert('Notification Notice', 'Please ensure notification permissions are granted.');
      }
    } catch (e: any) {
      Alert.alert('Notification Error', e.message);
    }
  };

  const handleTestWater = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const sent = await sendTestWaterNotification();
      if (sent) {
        Alert.alert('Water 2-Beep Scheduled', 'You will receive the 2-beep water alert in 2 seconds.');
      } else {
        Alert.alert('Notification Notice', 'Please ensure notification permissions are granted.');
      }
    } catch (e: any) {
      Alert.alert('Notification Error', e.message);
    }
  };

  const handleOpenPhoneNotificationSettings = async () => {
    try {
      Haptics.selectionAsync();
      await Linking.openSettings();
    } catch (e: any) {
      Alert.alert('Settings Error', e.message);
    }
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
    <SafeAreaView edges={['top']} style={styles.safeArea}>
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
          {/* Athlete Profile */}
          <Card variant="primary" style={[styles.card, styles.profileCard]}>
            <View style={styles.rowBetween}>
              <View style={styles.titleWithIcon}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>OT</Text>
                </View>
                <View>
                  <Text style={[typography.headline, styles.profileName]}>Om Thakur</Text>
                  <Text style={[typography.caption2, styles.profileSub]}>Personal Athlete Profile</Text>
                </View>
              </View>
              <Badge label="ACTIVE" variant="primary" size="sm" />
            </View>
          </Card>

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

          {/* Daily Alarms & Reminders */}
          <Card variant="secondary" style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.titleWithIcon}>
                <Icon name="Bell" size="sm" color={colors.brand.primary} weight="fill" />
                <Text style={[typography.headline, styles.cardTitle]}>Alarms & Reminders</Text>
              </View>
              <Badge label="ACTIVE" variant="primary" size="sm" />
            </View>
            <Text style={[typography.footnote, styles.cardDesc]}>
              Pre-configured alarms to keep your wake-up, supplementation, and hydration consistent every single day.
            </Text>

            <View style={styles.alarmList}>
              <View style={styles.alarmItem}>
                <View style={styles.alarmIconWrapper}>
                  <Icon name="Sun" size="sm" color="#FF9500" weight="fill" />
                </View>
                <View style={styles.alarmInfo}>
                  <Text style={[typography.headline, styles.alarmTitle]}>6:30 AM — Wake Up (Loud Alarm)</Text>
                  <Text style={[typography.caption1, styles.alarmSubtitle]}>
                    10s urgent alarm audio & multi-pulse vibration
                  </Text>
                </View>
              </View>

              <View style={styles.alarmItem}>
                <View style={styles.alarmIconWrapper}>
                  <Icon name="Pill" size="sm" color={colors.brand.primary} weight="fill" />
                </View>
                <View style={styles.alarmInfo}>
                  <Text style={[typography.headline, styles.alarmTitle]}>8:00 AM — Creatine (Loud Alarm)</Text>
                  <Text style={[typography.caption1, styles.alarmSubtitle]}>
                    5g Creatine Monohydrate with water (10s urgent alarm)
                  </Text>
                </View>
              </View>

              <View style={styles.alarmItem}>
                <View style={styles.alarmIconWrapper}>
                  <Icon name="Pill" size="sm" color="#30D158" weight="fill" />
                </View>
                <View style={styles.alarmInfo}>
                  <Text style={[typography.headline, styles.alarmTitle]}>10:00 PM — Vitamin B (Loud Alarm)</Text>
                  <Text style={[typography.caption1, styles.alarmSubtitle]}>
                    Vitamin B complex evening dose (10s urgent alarm)
                  </Text>
                </View>
              </View>

              <View style={styles.alarmItem}>
                <View style={styles.alarmIconWrapper}>
                  <Icon name="Drop" size="sm" color={colors.status.info} weight="fill" />
                </View>
                <View style={styles.alarmInfo}>
                  <Text style={[typography.headline, styles.alarmTitle]}>Every 30 Mins (10 AM – 10 PM) — Water</Text>
                  <Text style={[typography.caption1, styles.alarmSubtitle]}>
                    Short 2-beep prompt, daytime only (10 AM - 10 PM)
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.alarmButtonsColumn}>
              <View style={styles.alarmButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleTestAlarm}
                  style={[styles.alarmActionBtn, styles.alarmTestBtn]}
                >
                  <Icon name="Bell" size="xs" color={colors.brand.primary} weight="bold" />
                  <Text style={[typography.caption1, styles.alarmTestBtnText, { color: '#FFFFFF' }]}>Test Loud Alarm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleTestWater}
                  style={[styles.alarmActionBtn, styles.alarmTestBtn]}
                >
                  <Icon name="Drop" size="xs" color={colors.status.info} weight="bold" />
                  <Text style={[typography.caption1, styles.alarmTestBtnText, { color: colors.status.info }]}>Test 2-Beep</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.alarmButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSyncAlarms}
                  style={[styles.alarmActionBtn, styles.alarmSyncBtn]}
                >
                  <Icon name="ArrowClockwise" size="xs" color="#FFFFFF" weight="bold" />
                  <Text style={[typography.caption1, styles.alarmSyncBtnText]}>Re-sync Alarms</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleOpenPhoneNotificationSettings}
                  style={[styles.alarmActionBtn, styles.alarmSettingsBtn]}
                >
                  <Icon name="GearSix" size="xs" color={colors.text.secondary} weight="bold" />
                  <Text style={[typography.caption1, styles.alarmSettingsBtnText]}>Phone Settings</Text>
                </TouchableOpacity>
              </View>
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
    paddingBottom: 110,
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
  alarmList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  alarmIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTitle: {
    color: colors.text.primary,
    fontSize: 14,
  },
  alarmSubtitle: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  alarmButtonsColumn: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  alarmButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  alarmActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    gap: 6,
  },
  alarmSyncBtn: {
    backgroundColor: colors.brand.primary,
  },
  alarmSyncBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  alarmTestBtn: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  alarmTestBtnText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  alarmSettingsBtn: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  alarmSettingsBtnText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  profileCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.25)',
  },
  profileAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 59, 48, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.35)',
  },
  profileAvatarText: {
    color: colors.brand.primary,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  profileName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  profileSub: {
    color: colors.text.secondary,
    marginTop: 2,
  },
});
