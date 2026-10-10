import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { sendTestNotification } from '../../services/notifications';

export const TodayAlarmsCard: React.FC = () => {
  const handleTestAlarm = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const sent = await sendTestNotification();
      if (sent) {
        Alert.alert('Test Alarm Sent', 'Check your device notification banner in 2 seconds.');
      } else {
        Alert.alert('Notification Notice', 'Please ensure notification permissions are enabled in system settings.');
      }
    } catch {}
  };

  return (
    <Card variant="secondary" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Icon name="Bell" size="sm" color={colors.brand.primary} weight="fill" />
          <Text style={[typography.headline, styles.cardTitle]}>Daily Alarms & Routine</Text>
        </View>
        <Badge label="ACTIVE" variant="primary" size="sm" />
      </View>

      <Text style={styles.subtitle}>
        Scheduled daily reminders keeping your wake-up, supplements, and water on track.
      </Text>

      <View style={styles.alarmsList}>
        <View style={styles.alarmItem}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>06:30</Text>
          </View>
          <View style={styles.alarmDetails}>
            <Text style={styles.alarmName}>Rise & Shine</Text>
            <Text style={styles.alarmSub}>Morning weigh-in & no sugar oath</Text>
          </View>
        </View>

        <View style={styles.alarmItem}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>08:00</Text>
          </View>
          <View style={styles.alarmDetails}>
            <Text style={styles.alarmName}>Creatine (5g)</Text>
            <Text style={styles.alarmSub}>Take with water & clean breakfast</Text>
          </View>
        </View>

        <View style={styles.alarmItem}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>22:00</Text>
          </View>
          <View style={styles.alarmDetails}>
            <Text style={styles.alarmName}>Vitamin B Complex</Text>
            <Text style={styles.alarmSub}>10:00 PM evening dose & zero sugar</Text>
          </View>
        </View>

        <View style={styles.alarmItem}>
          <View style={[styles.timeBadge, styles.intervalBadge]}>
            <Text style={styles.timeText}>30m</Text>
          </View>
          <View style={styles.alarmDetails}>
            <Text style={styles.alarmName}>Hydration Check</Text>
            <Text style={styles.alarmSub}>Recurring water alert & craving check</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleTestAlarm}
        style={styles.testButton}
      >
        <Icon name="Bell" size="xs" color={colors.text.secondary} weight="bold" />
        <Text style={styles.testBtnText}>Test Alarm Notification (2s)</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  alarmsList: {
    gap: 8,
  },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  timeBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginRight: 12,
  },
  intervalBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.14)',
  },
  timeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  alarmDetails: {
    flex: 1,
  },
  alarmName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  alarmSub: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 1,
  },
  testButton: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: 6,
  },
  testBtnText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
