import mobileAds, { TestIds, BannerAdSize } from 'react-native-google-mobile-ads';

/**
 * AdMob Configuration
 * Google Official Test IDs are used in DEV mode or as defaults.
 * When ready for production, replace with your real AdMob Ad Unit IDs.
 */
export const AD_UNIT_IDS = {
  // Official Live Google AdMob Banner Ad Unit ID
  BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-2197954395692761/9332388396',
};

class AdService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize Google Mobile Ads SDK
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[AdService] Already initialized');
      return;
    }

    try {
      console.log('[AdService] Initializing Google Mobile Ads...');
      const adapterStatuses = await mobileAds().initialize();
      this.isInitialized = true;
      console.log('[AdService] Google Mobile Ads initialized successfully:', adapterStatuses);
    } catch (error) {
      console.log('[AdService] Google Mobile Ads initialization error:', error);
      this.isInitialized = true;
    }
  }
}

export default new AdService();
