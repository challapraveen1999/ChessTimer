import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackNavigator from './Helpers/Navigators';
import { navigationRef } from './Helpers/navigationHelper';

const App = () => {
  useEffect(() => {
    console.log('[RoyalChessClock] App mounted successfully. Ready for match play.');
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