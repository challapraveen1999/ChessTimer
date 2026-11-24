import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Text, Animated, StatusBar } from 'react-native';
import { Colors } from '../Helpers/theme';

const Splash = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('NewGameSetup');
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background?.primary || '#0A0A0C'} />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../assets/splash_chess.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>CHESS TIMER</Text>
        <Text style={styles.subtitle}>PRECISION DUAL CLOCK</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#D4AF37',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    color: '#8E8E98',
    marginTop: 6,
  },
});

export default Splash;
