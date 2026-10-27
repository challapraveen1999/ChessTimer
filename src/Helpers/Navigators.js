import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Splash from '../Screens/Splash';
import NewGameSetup from '../Screens/NewGameSetup';
import Timmer from '../Screens/Timmer';
import GameResult from '../Screens/GameResult';
import MatchHistory from '../Screens/MatchHistory';
import MatchDetails from '../Screens/MatchDetails';
import Profile from '../Screens/Profile';
import EditProfile from '../Screens/EditProfile';
import TimeControls from '../Screens/TimeControls';
import SoundSettings from '../Screens/SoundSettings';
import colorCodes from '../Helpers/colorcodes.json';

const Stack = createStackNavigator();

const StackNavigator = () => {
  console.log('[Navigator] Initializing StackNavigator with Royal Chess Clock screens');
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: colorCodes.BgColor || '#0A0A0C',
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor={colorCodes.BgColor || '#0A0A0C'} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colorCodes.BgColor || '#0A0A0C' },
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="NewGameSetup" component={NewGameSetup} />
        <Stack.Screen name="Timmer" component={Timmer} />
        <Stack.Screen name="ActiveTimer" component={Timmer} />
        <Stack.Screen name="GameResult" component={GameResult} />
        <Stack.Screen name="MatchHistory" component={MatchHistory} />
        <Stack.Screen name="MatchDetails" component={MatchDetails} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="TimeControls" component={TimeControls} />
        <Stack.Screen name="SoundSettings" component={SoundSettings} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default StackNavigator;
