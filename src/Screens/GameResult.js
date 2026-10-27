import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import { Colors, Typography, Shadows, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';
import { getUserSettings, saveUserSettings } from '../Helpers/storageHelper';
import BottomNavBar from '../Components/BottomNavBar';

const GameResult = ({ navigation, route }) => {
  const matchData = route?.params || {};
  const {
    winner = 'White Wins!',
    loser = 'Black',
    reason = 'Time Out',
    whitePlayer = 'White',
    blackPlayer = 'Black',
    presetName = 'Blitz 5 min',
    totalMoves = 24,
    p1Moves = 12,
    p2Moves = 12,
    p1Remaining = 300000,
    p2Remaining = 0,
    duration = 298,
    history = [],
  } = matchData;

  console.log('[GameResult] Rendering Game Result screen for match:', {
    winner,
    reason,
    whitePlayer,
    blackPlayer,
    totalMoves,
    duration,
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tenSecAlert, setTenSecAlert] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    console.log('[GameResult] Screen mounted, loading audio & alert settings...');
    getUserSettings().then((settings) => {
      if (settings) {
        console.log('[GameResult] Loaded user settings:', settings);
        setSoundEnabled(settings.soundEnabled ?? true);
        setTenSecAlert(settings.tenSecAlert ?? true);
        setVibrationEnabled(settings.vibrationEnabled ?? true);
      }
    });
  }, []);

  const handleToggleSound = (val) => {
    console.log('[GameResult] Sound effects toggled:', val);
    setSoundEnabled(val);
    AudioService.setSoundEnabled(val);
    saveUserSettings({ soundEnabled: val });
  };

  const handleToggleTenSec = (val) => {
    console.log('[GameResult] 10s warning toggled:', val);
    setTenSecAlert(val);
    saveUserSettings({ tenSecAlert: val });
  };

  const handleToggleVibration = (val) => {
    console.log('[GameResult] Vibration toggled:', val);
    setVibrationEnabled(val);
    AudioService.setVibrationEnabled(val);
    saveUserSettings({ vibrationEnabled: val });
  };

  const formatSecs = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const formatRemaining = (ms) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const avgMoveSecWhite = p2Moves > 0 ? (duration / 2 / p2Moves).toFixed(1) : '0';
  const avgMoveSecBlack = p1Moves > 0 ? (duration / 2 / p1Moves).toFixed(1) : '0';

  const handlePlayAgain = () => {
    console.log('[GameResult] Play Again pressed. Restarting match with clean base time.');
    AudioService.playMoveSound();
    navigation.navigate('Timmer', {
      ...route?.params,
      incrementSec: 0,
      soundEnabled,
      tenSecAlert,
      vibrationEnabled,
    });
  };

  const handleNewMatch = () => {
    console.log('[GameResult] New Match pressed. Navigating to NewGameSetup.');
    AudioService.playMoveSound();
    navigation.navigate('NewGameSetup');
  };

  const handleViewDetails = () => {
    console.log('[GameResult] Match Details pressed. Navigating to MatchDetails.');
    AudioService.playMoveSound();
    navigation.navigate('MatchDetails', matchData);
  };

  const handleViewHistory = () => {
    console.log('[GameResult] Match History pressed. Navigating to MatchHistory.');
    AudioService.playMoveSound();
    navigation.navigate('MatchHistory');
  };

  const handleOpenSettings = () => {
    console.log('[GameResult] Open Settings pressed. Navigating to SoundSettings.');
    AudioService.playMoveSound();
    navigation.navigate('SoundSettings');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MATCH RESULT</Text>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* WINNER SPOTLIGHT CARD */}
        <View style={[styles.winnerCard, Elevations.high, Shadows.goldGlow]}>
          <Text style={styles.crownIcon}>👑</Text>
          <Text style={styles.winnerHeading}>{winner.toUpperCase()}</Text>
          <Text style={styles.reasonText}>{reason}</Text>

          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>
              {presetName} • {formatSecs(duration)}
            </Text>
          </View>
        </View>

        {/* PLAYERS COMPARISON CARDS */}
        <View style={styles.playersRow}>
          {/* White Player Card */}
          <View style={[styles.playerCard, Elevations.low]}>
            <View style={[styles.avatarCircle, styles.whiteAvatar]}>
              <Text style={styles.avatarLetter}>{whitePlayer.charAt(0)}</Text>
            </View>
            <Text style={styles.playerName}>{whitePlayer}</Text>
            <Text style={styles.playerSideLabel}>WHITE</Text>

            <View style={styles.statsDivider} />

            <Text style={styles.metricLabel}>CLOCK LEFT</Text>
            <Text style={styles.metricValue}>{formatRemaining(p1Remaining)}</Text>

            <Text style={[styles.metricLabel, { marginTop: 8 }]}>MOVES</Text>
            <Text style={styles.metricValue}>{p2Moves}</Text>

            <Text style={[styles.metricLabel, { marginTop: 8 }]}>AVG THINK</Text>
            <Text style={styles.metricValue}>{avgMoveSecWhite}s</Text>
          </View>

          {/* Black Player Card */}
          <View style={[styles.playerCard, Elevations.low]}>
            <View style={[styles.avatarCircle, styles.blackAvatar]}>
              <Text style={[styles.avatarLetter, { color: '#FFF' }]}>
                {blackPlayer.charAt(0)}
              </Text>
            </View>
            <Text style={styles.playerName}>{blackPlayer}</Text>
            <Text style={styles.playerSideLabel}>BLACK</Text>

            <View style={styles.statsDivider} />

            <Text style={styles.metricLabel}>CLOCK LEFT</Text>
            <Text style={styles.metricValue}>{formatRemaining(p2Remaining)}</Text>

            <Text style={[styles.metricLabel, { marginTop: 8 }]}>MOVES</Text>
            <Text style={styles.metricValue}>{p1Moves}</Text>

            <Text style={[styles.metricLabel, { marginTop: 8 }]}>AVG THINK</Text>
            <Text style={styles.metricValue}>{avgMoveSecBlack}s</Text>
          </View>
        </View>

        {/* PRIMARY ACTION BUTTONS (PLAY AGAIN & NEW MATCH) */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.playAgainBtn, Elevations.high, Shadows.goldGlow]}
            onPress={handlePlayAgain}
          >
            <Text style={styles.playAgainBtnText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.newMatchBtn, Elevations.low]}
            onPress={handleNewMatch}
          >
            <Text style={styles.newMatchBtnText}>NEW MATCH</Text>
          </TouchableOpacity>
        </View>

        {/* MATCH SETTINGS CARD: Sound On/Off, 10s Warning On/Off */}
        <View style={[styles.settingsCard, Elevations.low]}>
          <View style={styles.settingsHeader}>
            <View>
              <Text style={styles.settingsTitle}>⚙ MATCH SETTINGS</Text>
              <Text style={styles.settingsSubtitle}>Configure audio & warning options</Text>
            </View>
            <TouchableOpacity style={styles.moreSettingsBtn} onPress={handleOpenSettings}>
              <Text style={styles.moreSettingsBtnText}>FULL SETTINGS ›</Text>
            </TouchableOpacity>
          </View>

          {/* Sound On / Off */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>🔊 Sound Effects</Text>
              <Text style={styles.switchSubtitle}>Move clicks & time-out alarms</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              thumbColor={soundEnabled ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>

          <View style={styles.settingDivider} />

          {/* 10-Second Warning On / Off */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>⚠️ 10-Second Warning</Text>
              <Text style={styles.switchSubtitle}>Red danger state & alert beeps</Text>
            </View>
            <Switch
              value={tenSecAlert}
              onValueChange={handleToggleTenSec}
              thumbColor={tenSecAlert ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>

          <View style={styles.settingDivider} />

          {/* Vibration Feedback */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>📳 Tactile Vibration</Text>
              <Text style={styles.switchSubtitle}>Haptic pulses on turn switch</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleToggleVibration}
              thumbColor={vibrationEnabled ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>
        </View>

        {/* SHORTCUT ACTIONS (Match Details, History) */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={[styles.shortcutBtn, Elevations.low]}
            onPress={handleViewDetails}
          >
            <Text style={styles.shortcutBtnText}>📊 Match Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutBtn, Elevations.low]}
            onPress={handleViewHistory}
          >
            <Text style={styles.shortcutBtnText}>📜 Full History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PERSISTENT BOTTOM NAVIGATION BAR (Home, History, Profile, Settings) */}
      <BottomNavBar activeTab="home" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.gold.champagne,
    fontFamily: Typography.titleLarge.fontFamily,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  winnerCard: {
    backgroundColor: Colors.background.surfaceElevated,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
  },
  crownIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  winnerHeading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.gold.light,
    fontFamily: Typography.titleLarge.fontFamily,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: Typography.body.fontFamily,
    marginBottom: 12,
  },
  metaPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  metaPillText: {
    fontSize: 12,
    color: Colors.gold.light,
    fontWeight: '700',
    fontFamily: Typography.caption.fontFamily,
  },
  playersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  playerCard: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  whiteAvatar: {
    backgroundColor: '#FAF5E4',
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
  },
  blackAvatar: {
    backgroundColor: '#1E1E26',
    borderWidth: 1.5,
    borderColor: Colors.borders.subtle,
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Typography.titleMedium.fontFamily,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    marginBottom: 2,
  },
  playerSideLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 12,
  },
  statsDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.borders.subtle,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  playAgainBtn: {
    flex: 1,
    backgroundColor: Colors.gold.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAgainBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.background.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  newMatchBtn: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMatchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.gold.light,
    fontFamily: Typography.caption.fontFamily,
  },
  settingsCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.gold.champagne,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  settingsSubtitle: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    marginTop: 2,
  },
  moreSettingsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  moreSettingsBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.gold.light,
    fontFamily: Typography.caption.fontFamily,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: Typography.body.fontFamily,
  },
  switchSubtitle: {
    fontSize: 10,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    marginTop: 1,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.borders.subtle,
    marginVertical: 10,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  shortcutBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    fontFamily: Typography.body.fontFamily,
  },
});

export default GameResult;
