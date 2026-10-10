import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { radii, spacing, layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  haptic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  haptic = true,
  disabled,
  style,
  onPress,
  ...props
}) => {
  const handlePress = (e: any) => {
    if (disabled || loading) return;
    if (haptic) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress?.(e);
  };

  const getContainerStyle = () => {
    const isSmall = size === 'sm';
    const isLarge = size === 'lg';

    let bg: string = colors.brand.primary;
    let border: string = 'transparent';

    if (variant === 'secondary') {
      bg = colors.background.tertiary;
      border = colors.border.subtle;
    } else if (variant === 'subtle') {
      bg = colors.brand.primarySubtle;
      border = 'transparent';
    } else if (variant === 'ghost') {
      bg = 'transparent';
      border = colors.border.subtle;
    } else if (variant === 'destructive') {
      bg = colors.brand.primary;
    }

    return [
      styles.base,
      isSmall && styles.smContainer,
      isLarge && styles.lgContainer,
      { backgroundColor: bg, borderColor: border },
      disabled && styles.disabledContainer,
    ];
  };

  const getTextColor = () => {
    if (disabled) return colors.text.muted;
    if (variant === 'subtle') return colors.brand.primary;
    if (variant === 'ghost') return colors.text.primary;
    return '#FFFFFF';
  };

  const getIconColor = () => {
    return getTextColor();
  };

  const textColor = getTextColor();
  const iconColor = getIconColor();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[getContainerStyle(), style]}
      disabled={disabled || loading}
      onPress={handlePress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>
              <Icon name={icon} size={size === 'sm' ? 'xs' : 'sm'} color={iconColor} weight="bold" />
            </View>
          )}
          <Text
            style={[
              typography.headline,
              { color: textColor },
              size === 'sm' && styles.smText,
              size === 'lg' && styles.lgText,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>
              <Icon name={icon} size={size === 'sm' ? 'xs' : 'sm'} color={iconColor} weight="bold" />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 50,
    minHeight: layout.minTouchTarget,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  smContainer: {
    height: 38,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
  },
  lgContainer: {
    height: 58,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  smText: {
    fontSize: 14,
    lineHeight: 18,
  },
  lgText: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
  },
  disabledContainer: {
    opacity: 0.45,
  },
});
