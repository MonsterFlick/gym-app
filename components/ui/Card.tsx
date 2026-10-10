import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

interface CardProps extends ViewProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'elevated' | 'glass';
  noPadding?: boolean;
  withNoise?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'primary',
  noPadding = false,
  withNoise = false,
  ...props
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.background.primary;
      case 'secondary':
        return colors.background.secondary;
      case 'elevated':
        return colors.background.elevated;
      case 'glass':
        return 'rgba(28, 28, 30, 0.75)';
      default:
        return colors.background.primary;
    }
  };

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: getBackgroundColor() },
        !noPadding && styles.padding,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
    position: 'relative',
  },
  padding: {
    padding: spacing.lg,
  },
});
