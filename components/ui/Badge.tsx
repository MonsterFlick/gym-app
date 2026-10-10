import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from './Icon';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  icon?: IconName;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  icon,
  size = 'md',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.brand.primarySubtle, text: colors.brand.primary };
      case 'success':
        return { bg: colors.status.successSubtle, text: colors.status.success };
      case 'warning':
        return { bg: colors.status.warningSubtle, text: colors.status.warning };
      case 'error':
        return { bg: colors.status.errorSubtle, text: colors.status.error };
      case 'neutral':
      default:
        return { bg: colors.background.tertiary, text: colors.text.secondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg },
        size === 'sm' && styles.smContainer,
      ]}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Icon name={icon} size={size === 'sm' ? 'xs' : 'xs'} color={text} weight="bold" />
        </View>
      )}
      <Text
        style={[
          typography.caption2,
          { color: text },
          size === 'sm' && styles.smText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  smContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  iconContainer: {
    marginRight: 4,
  },
  smText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
