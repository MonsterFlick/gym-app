import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';

const STORAGE_KEY_PREFIX = 'diet_discipline_pledge_';

export const DisciplineReminderCard: React.FC = () => {
  const todayKey = `${STORAGE_KEY_PREFIX}${new Date().toISOString().slice(0, 10)}`;
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(todayKey).then((val) => {
      if (val === 'committed') {
        setIsCommitted(true);
      }
    });
  }, [todayKey]);

  const handleTogglePledge = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const nextState = !isCommitted;
    setIsCommitted(nextState);
    if (nextState) {
      await AsyncStorage.setItem(todayKey, 'committed');
    } else {
      await AsyncStorage.removeItem(todayKey);
    }
  };

  return (
    <Card variant="primary" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.flameIconWrapper}>
            <Icon name="Flame" size="sm" color={colors.brand.primary} weight="fill" />
          </View>
          <View>
            <Text style={styles.sectionTag}>DAILY DISCIPLINE</Text>
            <Text style={[typography.headline, styles.cardTitle]}>Om's Iron Rules</Text>
          </View>
        </View>

        <Badge
          label={isCommitted ? 'COMMITTED' : 'REQUIRED'}
          variant={isCommitted ? 'success' : 'primary'}
          size="sm"
        />
      </View>

      <Text style={styles.subtitle}>
        Zero compromises. Fuel your body with clean, high-performance nutrition.
      </Text>

      {/* Rules Grid */}
      <View style={styles.rulesContainer}>
        <View style={styles.ruleItem}>
          <View style={styles.ruleIconCircle}>
            <Icon name="X" size="xs" color={colors.brand.primary} weight="bold" />
          </View>
          <View style={styles.ruleTextContainer}>
            <Text style={styles.ruleTitle}>ZERO SUGAR</Text>
            <Text style={styles.ruleDesc}>No sweets, soda, juice, or hidden sugars</Text>
          </View>
        </View>

        <View style={styles.ruleItem}>
          <View style={styles.ruleIconCircle}>
            <Icon name="X" size="xs" color={colors.brand.primary} weight="bold" />
          </View>
          <View style={styles.ruleTextContainer}>
            <Text style={styles.ruleTitle}>NO JUNK FOOD</Text>
            <Text style={styles.ruleDesc}>Clean whole food only, zero processed snacks</Text>
          </View>
        </View>

        <View style={styles.ruleItem}>
          <View style={[styles.ruleIconCircle, styles.waterCircle]}>
            <Icon name="Drop" size="xs" color={colors.status.info} weight="fill" />
          </View>
          <View style={styles.ruleTextContainer}>
            <Text style={styles.ruleTitle}>CLEAN HYDRATION</Text>
            <Text style={styles.ruleDesc}>Hit your 3000ml water target every day</Text>
          </View>
        </View>
      </View>

      {/* Interactive Commitment Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleTogglePledge}
        style={[
          styles.pledgeButton,
          isCommitted ? styles.pledgeButtonActive : styles.pledgeButtonInactive,
        ]}
      >
        <Icon
          name={isCommitted ? 'CheckCircle' : 'Target'}
          size="sm"
          color={isCommitted ? '#30D158' : colors.brand.primary}
          weight="fill"
        />
        <Text
          style={[
            typography.subhead,
            styles.pledgeText,
            isCommitted && styles.pledgeTextActive,
          ]}
        >
          {isCommitted
            ? 'OM PLEDGED TODAY: ZERO SUGAR & LOCK IN'
            : 'TAP TO PLEDGE ZERO SUGAR & NO JUNK'}
        </Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.22)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flameIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTag: {
    color: colors.brand.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  rulesContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  ruleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  waterCircle: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
  },
  ruleTextContainer: {
    flex: 1,
  },
  ruleTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ruleDesc: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 1,
  },
  pledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
    borderWidth: 1,
  },
  pledgeButtonInactive: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  pledgeButtonActive: {
    backgroundColor: 'rgba(48, 209, 88, 0.08)',
    borderColor: 'rgba(48, 209, 88, 0.35)',
  },
  pledgeText: {
    color: colors.brand.primary,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontSize: 12,
  },
  pledgeTextActive: {
    color: '#30D158',
  },
});
