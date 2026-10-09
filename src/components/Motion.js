// ==================================================
// FILE: Motion.js
// PURPOSE: Provides shared fade and press animations
// VIVA: Props: children, style and timing control fade; press props control scale
// ==================================================

// ===== IMPORTS =====
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, Platform } from 'react-native';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

// ===== COMPONENT PROPS: FadeSlideView =====
export function FadeSlideView({ children, delay = 0, distance = 16, duration = 440, style, ...props }) {
  // ===== LOCAL STATE =====
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      delay,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [delay, distance, duration, progress]);

  // ===== MAIN DISPLAY =====
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

// ===== COMPONENT PROPS: ScalePressable =====
export function ScalePressable({ children, disabled = false, onPressIn, onPressOut, style, ...props }) {
  // ===== LOCAL STATE =====
  const [scale] = useState(() => new Animated.Value(1));

  // ===== BUTTON PRESS ANIMATION =====
  const animateScale = (toValue) => {
    Animated.spring(scale, {
      toValue,
      damping: 16,
      stiffness: 280,
      mass: 0.7,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  // ===== MAIN DISPLAY =====
  return (
    <AnimatedPressableBase
      disabled={disabled}
      onPressIn={(event) => {
        animateScale(0.96);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateScale(1);
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.55 }]}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
}
