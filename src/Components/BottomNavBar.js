import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '♟', route: 'NewGameSetup' },
  { id: 'history', label: 'History', icon: '📜', route: 'MatchHistory' },
  { id: 'profile', label: 'Profile', icon: '👤', route: 'Profile' },
  { id: 'settings', label: 'Settings', icon: '⚙', route: 'SoundSettings' },
];

const BottomNavBar = ({ activeTab = 'home', navigation }) => {
  const handleTabPress = (item) => {
    console.log(`[BottomNavBar] Tab pressed: ${item.id} -> navigating to ${item.route}`);
    AudioService.playMoveSound();
    if (navigation && navigation.navigate) {
      navigation.navigate(item.route);
    }
  };

  return (
    <View style={[styles.container, Elevations.medium]}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => handleTabPress(item)}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: Colors.background.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: Colors.borders.subtle,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabButtonActive: {
    // subtle highlight if needed
  },
  tabIcon: {
    fontSize: 20,
    color: Colors.text.muted,
    marginBottom: 2,
  },
  tabIconActive: {
    color: Colors.gold.light,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: Colors.gold.light,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold.primary,
    marginTop: 2,
  },
});

export default BottomNavBar;
