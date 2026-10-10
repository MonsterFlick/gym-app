import React from 'react';
import { ColorValue } from 'react-native';
import * as PhosphorIcons from 'phosphor-react-native';
import { colors } from '../../theme/colors';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export type IconName =
  | 'House'
  | 'Barbell'
  | 'CheckCircle'
  | 'ChartLineUp'
  | 'GearSix'
  | 'Drop'
  | 'Pill'
  | 'Scales'
  | 'Flame'
  | 'Timer'
  | 'Play'
  | 'Pause'
  | 'SkipForward'
  | 'FastForward'
  | 'Clock'
  | 'Check'
  | 'X'
  | 'MinusCircle'
  | 'Plus'
  | 'Minus'
  | 'Trash'
  | 'PencilSimple'
  | 'ShareNetwork'
  | 'ArrowLeft'
  | 'CaretRight'
  | 'CaretDown'
  | 'CaretUp'
  | 'Info'
  | 'WarningCircle'
  | 'ArrowClockwise'
  | 'CalendarBlank'
  | 'Trophy'
  | 'Target'
  | 'Lightning'
  | 'Heartbeat'
  | 'Bell'
  | 'Moon'
  | 'Sun'
  | 'Eye'
  | 'ArrowUp'
  | 'ArrowDown';

interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string | ColorValue;
  weight?: IconWeight;
}

const sizeMap: Record<string, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 36,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = colors.text.primary,
  weight = 'regular',
}) => {
  const IconComponent = (PhosphorIcons as any)[name];

  if (!IconComponent) {
    // Fallback if icon name not found
    const Fallback = PhosphorIcons.Question;
    return <Fallback size={typeof size === 'number' ? size : sizeMap[size]} color={color as string} weight={weight} />;
  }

  const numericSize = typeof size === 'number' ? size : sizeMap[size] || 24;

  return <IconComponent size={numericSize} color={color as string} weight={weight} />;
};
