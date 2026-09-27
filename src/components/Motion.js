import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable } from 'react-native';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function FadeSlideView({ children, delay = 0, distance = 16, duration = 440, style, ...props }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      delay,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, distance, duration, progress]);

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

export function ScalePressable({ children, disabled = false, onPressIn, onPressOut, style, ...props }) {
  const [scale] = useState(() => new Animated.Value(1));

  const animateScale = (toValue) => {
    Animated.spring(scale, {
      toValue,
      damping: 16,
      stiffness: 280,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  };

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
