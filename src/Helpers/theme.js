import colorcodes from './colorcodes.json';
import fontfamily from './fontfamily.json';
import { Platform } from 'react-native';

export const Colors = colorcodes;
export const Fonts = fontfamily;

export const Typography = {
  displayLarge: {
    fontFamily: Platform.select({
      android: 'Poppins-Bold',
      ios: 'Poppins-Bold',
      default: 'System',
    }),
    fontSize: 54,
    color: Colors.text.primary,
    letterSpacing: 1,
  },
  displayMedium: {
    fontFamily: Platform.select({
      android: 'Poppins-SemiBold',
      ios: 'Poppins-SemiBold',
      default: 'System',
    }),
    fontSize: 38,
    color: Colors.text.primary,
  },
  titleLarge: {
    fontFamily: Platform.select({
      android: 'Poppins-Bold',
      ios: 'Poppins-Bold',
      default: 'System',
    }),
    fontSize: 22,
    color: Colors.text.goldBright,
    letterSpacing: 0.5,
  },
  titleMedium: {
    fontFamily: Platform.select({
      android: 'Poppins-SemiBold',
      ios: 'Poppins-SemiBold',
      default: 'System',
    }),
    fontSize: 18,
    color: Colors.text.primary,
  },
  body: {
    fontFamily: Platform.select({
      android: 'Poppins-Regular',
      ios: 'Poppins-Regular',
      default: 'System',
    }),
    fontSize: 14,
    color: Colors.text.secondary,
  },
  caption: {
    fontFamily: Platform.select({
      android: 'Poppins-Medium',
      ios: 'Poppins-Medium',
      default: 'System',
    }),
    fontSize: 12,
    color: Colors.text.muted,
  },
  digitalTimer: {
    fontFamily: Platform.select({
      android: 'Poppins-Bold',
      ios: 'Poppins-Bold',
      default: 'monospace',
    }),
    fontSize: 64,
    fontWeight: '800',
    color: Colors.gold.light,
    letterSpacing: 2,
    includeFontPadding: false,
  },
};

export const Shadows = {
  goldGlow: {
    shadowColor: Colors.gold.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  goldSubtle: {
    shadowColor: Colors.gold.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerGlow: {
    shadowColor: Colors.status.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
};

export const Elevations = {
  low: {
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  medium: {
    elevation: 6,
    shadowColor: Colors.gold.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  high: {
    elevation: 12,
    shadowColor: Colors.gold.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
  },
  glowActive: {
    elevation: 14,
    shadowColor: Colors.gold.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
  },
  glowDanger: {
    elevation: 14,
    shadowColor: Colors.status.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
  },
};

export default {
  Colors,
  Fonts,
  Typography,
  Shadows,
  Elevations,
};
