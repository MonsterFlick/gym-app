import React from 'react';
import { StyleSheet, Image, View, ViewProps } from 'react-native';

const noiseImage = require('../../assets/textures/noise.png');

interface NoiseBackgroundProps extends ViewProps {
  children?: React.ReactNode;
  opacity?: number;
}

export const NoiseOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.045 }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={noiseImage}
        style={[StyleSheet.absoluteFill, { opacity }]}
        resizeMode="repeat"
      />
    </View>
  );
};

export const NoiseBackground: React.FC<NoiseBackgroundProps> = ({
  children,
  style,
  opacity = 0.045,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <NoiseOverlay opacity={opacity} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});
