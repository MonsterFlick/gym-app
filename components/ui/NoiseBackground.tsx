import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface NoiseBackgroundProps extends ViewProps {
  children?: React.ReactNode;
  opacity?: number;
}

export const NoiseOverlay: React.FC<{ opacity?: number }> = () => null;

export const NoiseBackground: React.FC<NoiseBackgroundProps> = ({
  children,
  style,
  opacity,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
