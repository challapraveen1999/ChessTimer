import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../Helpers/adService';
import { Colors, Typography, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';

const BannerAdView = ({ style, size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER, allowClose = true }) => {
  const [adLoaded, setAdLoaded] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) {
    return null;
  }

  const handleClose = () => {
    console.log('[BannerAdView] User tapped X mark to close banner test ad');
    AudioService.playMoveSound();
    setIsClosed(true);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Top control bar with Ad label and X Mark to close */}
      <View style={styles.topBar}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>Ad</Text>
          <Text style={styles.adLabelText}>Google Mobile Ads</Text>
        </View>

        {allowClose && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.closeBtn}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actual Google Mobile Ads Banner */}
      <View style={styles.bannerWrapper}>
        <BannerAd
          unitId={AD_UNIT_IDS.BANNER}
          size={size}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={() => {
            console.log('[BannerAdView] Banner ad loaded successfully');
            setAdLoaded(true);
          }}
          onAdFailedToLoad={(error) => {
            console.log('[BannerAdView] Banner ad failed to load (using fallback):', error);
            setAdLoaded(false);
          }}
        />

        {/* Fallback preview if network fails or in offline testing */}
        {!adLoaded && (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackTitle}>Chess Timer Pro - Official Test Banner</Text>
            <Text style={styles.fallbackSubtitle}>Tap ✕ above to close this ad</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 26, 34, 0.95)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  adBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
    backgroundColor: Colors.gold.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  adLabelText: {
    fontSize: 10,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.gold.light,
    lineHeight: 13,
  },
  bannerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    width: '100%',
  },
  fallbackContainer: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fallbackTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gold.light,
    fontFamily: Typography.body.fontFamily,
  },
  fallbackSubtitle: {
    fontSize: 10,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    marginTop: 2,
  },
});

export default BannerAdView;
