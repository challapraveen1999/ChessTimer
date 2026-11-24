import React, { useEffect } from 'react';
import { StyleSheet, LogBox } from 'react-native';

LogBox.ignoreAllLogs();
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';
import StackNavigator from './Helpers/Navigators';
import { navigationRef } from './Helpers/navigationHelper';
import AdService from './Helpers/adService';

const App = () => {
  useEffect(() => {
    console.log('[RoyalChessClock] App mounted successfully. Ready for match play.');
    // Initialize Google Mobile Ads SDK
    try {
      mobileAds()
        .initialize()
        .then((adapterStatuses) => {
          console.log('AdMob initialized:', adapterStatuses);
        })
        .catch((error) => {
          console.log('AdMob initialization error:', error);
        });
    } catch (error) {
      console.log('AdMob native module check:', error?.message);
    }
  }, []);

  return (
    <SafeAreaProvider style={styles.root}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          console.log('[Navigation] NavigationContainer is ready.');
        }}
        onStateChange={(state) => {
          const currentRoute = state?.routes[state?.index]?.name;
          console.log(`[Navigation] Active Screen Changed -> ${currentRoute}`);
        }}
      >
        <StackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;