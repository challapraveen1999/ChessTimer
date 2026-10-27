import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { Colors, Typography, Shadows, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';
import { getUserProfile, getUserSettings, saveUserSettings } from '../Helpers/storageHelper';
import BottomNavBar from '../Components/BottomNavBar';

const TIME_PRESETS = [
  { id: '1m', name: '1 min', seconds: 60, category: 'bullet' },
  { id: '3m', name: '3 min', seconds: 180, category: 'blitz' },
  { id: '5m', name: '5 min', seconds: 300, category: 'blitz' },
  { id: '10m', name: '10 min', seconds: 600, category: 'rapid' },
  { id: '15m', name: '15 min', seconds: 900, category: 'rapid' },
  { id: '30m', name: '30 min', seconds: 1800, category: 'classical' },
];

const NewGameSetup = ({ navigation }) => {
  console.log('[NewGameSetup] Rendering New Game Setup screen (clean time controls without increment)');

  const [whitePlayer, setWhitePlayer] = useState('');
  const [blackPlayer, setBlackPlayer] = useState('');
  const [whiteError, setWhiteError] = useState('');
  const [blackError, setBlackError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('blitz'); // 'bullet' | 'blitz' | 'rapid' | 'custom'
  const [selectedPresetId, setSelectedPresetId] = useState('5m');
  const [selectedSeconds, setSelectedSeconds] = useState(300);

  // Custom builder
  const [customMin, setCustomMin] = useState(10);
  const [customSec, setCustomSec] = useState(0);

  // Quick Match Settings (Sound & 10s warning)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tenSecAlert, setTenSecAlert] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    getUserSettings().then((settings) => {
      if (settings) {
        console.log('[NewGameSetup] Loaded match settings:', settings);
        setSoundEnabled(settings.soundEnabled ?? true);
        setTenSecAlert(settings.tenSecAlert ?? true);
        setVibrationEnabled(settings.vibrationEnabled ?? true);
      }
    });
  }, []);

  const handleSwapPlayers = () => {
    console.log('[NewGameSetup] Swapping White and Black players:', { whitePlayer, blackPlayer });
    AudioService.playMoveSound();
    const temp = whitePlayer;
    setWhitePlayer(blackPlayer);
    setBlackPlayer(temp);
  };

  const handleSelectCategory = (cat) => {
    console.log('[NewGameSetup] Category selected:', cat);
    AudioService.playMoveSound();
    setSelectedCategory(cat);
    if (cat === 'bullet') {
      setSelectedPresetId('1m');
      setSelectedSeconds(60);
    } else if (cat === 'blitz') {
      setSelectedPresetId('5m');
      setSelectedSeconds(300);
    } else if (cat === 'rapid') {
      setSelectedPresetId('10m');
      setSelectedSeconds(600);
    }
  };

  const handleSelectPreset = (preset) => {
    console.log('[NewGameSetup] Preset selected:', preset.name, `${preset.seconds}s`);
    AudioService.playMoveSound();
    setSelectedPresetId(preset.id);
    setSelectedSeconds(preset.seconds);
  };

  const handleToggleSound = (val) => {
    console.log('[NewGameSetup] Sound toggled:', val);
    setSoundEnabled(val);
    AudioService.setSoundEnabled(val);
    saveUserSettings({ soundEnabled: val });
  };

  const handleToggleTenSec = (val) => {
    console.log('[NewGameSetup] 10s warning toggled:', val);
    setTenSecAlert(val);
    saveUserSettings({ tenSecAlert: val });
  };

  const handleToggleVibration = (val) => {
    console.log('[NewGameSetup] Vibration toggled:', val);
    setVibrationEnabled(val);
    AudioService.setVibrationEnabled(val);
    saveUserSettings({ vibrationEnabled: val });
  };

  const handleStartMatch = () => {
    const trimmedWhite = whitePlayer.trim();
    const trimmedBlack = blackPlayer.trim();

    let hasError = false;
    if (!trimmedWhite) {
      setWhiteError('Please enter White player name');
      hasError = true;
    } else {
      setWhiteError('');
    }

    if (!trimmedBlack) {
      setBlackError('Please enter Black player name');
      hasError = true;
    } else {
      setBlackError('');
    }

    if (hasError) {
      console.log('[NewGameSetup] Validation failed: player names cannot be empty', {
        white: trimmedWhite,
        black: trimmedBlack,
      });
      AudioService.playWarningSound();
      Alert.alert(
        'Player Name Required',
        'Please enter name for both White and Black players before starting the game.',
        [{ text: 'OK' }]
      );
      return;
    }

    let finalBaseSec = selectedSeconds;
    let finalPresetName = 'Blitz 5 min';

    if (selectedCategory === 'custom') {
      finalBaseSec = customMin * 60 + customSec;
      finalPresetName = `Custom ${customMin}m`;
    } else {
      const match = TIME_PRESETS.find((p) => p.id === selectedPresetId);
      if (match) finalPresetName = match.name;
    }

    console.log('[NewGameSetup] Validation passed. Starting Match with parameters:', {
      whitePlayer: trimmedWhite,
      blackPlayer: trimmedBlack,
      initialTimeSec: finalBaseSec,
      presetName: finalPresetName,
      soundEnabled,
      tenSecAlert,
      vibrationEnabled,
    });

    AudioService.playMoveSound();

    navigation.navigate('Timmer', {
      whitePlayer: trimmedWhite,
      blackPlayer: trimmedBlack,
      initialTimeSec: finalBaseSec,
      incrementSec: 0,
      presetName: finalPresetName,
      soundEnabled,
      tenSecAlert,
      vibrationEnabled,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEW GAME</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              console.log('[NewGameSetup] Opening Match History from header');
              AudioService.playMoveSound();
              navigation.navigate('MatchHistory');
            }}
          >
            <Text style={styles.iconSymbol}>📜</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              console.log('[NewGameSetup] Opening Profile from header');
              AudioService.playMoveSound();
              navigation.navigate('Profile');
            }}
          >
            <Text style={styles.iconSymbol}>👤</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              console.log('[NewGameSetup] Opening Settings from header');
              AudioService.playMoveSound();
              navigation.navigate('SoundSettings');
            }}
          >
            <Text style={styles.iconSymbol}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* PLAYER NAMES CARD */}
        <View style={[styles.sectionCard, Elevations.low]}>
          <Text style={styles.sectionHeading}>PLAYER NAMES</Text>

          {/* White Player Row */}
          <View style={styles.playerInputRow}>
            <View style={[styles.playerAvatar, styles.whiteAvatar]}>
              <Text style={styles.avatarLetter}>
                {whitePlayer.trim().charAt(0).toUpperCase() || '♔'}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.sideLabel}>WHITE</Text>
              <TextInput
                style={[styles.textInput, whiteError ? styles.textInputError : null]}
                value={whitePlayer}
                onChangeText={(val) => {
                  console.log('[NewGameSetup] White player name changed to:', val);
                  setWhitePlayer(val);
                  if (whiteError) setWhiteError('');
                }}
                placeholder="Enter name"
                placeholderTextColor={Colors.text.muted}
                autoCapitalize="words"
              />
              {whiteError ? <Text style={styles.errorText}>{whiteError}</Text> : null}
            </View>
          </View>

          {/* Swap Sides Button */}
          <View style={styles.swapBtnRow}>
            <TouchableOpacity
              style={[styles.swapBtn, Elevations.low]}
              onPress={handleSwapPlayers}
            >
              <Text style={styles.swapBtnText}>⇅ SWAP SIDES</Text>
            </TouchableOpacity>
          </View>

          {/* Black Player Row */}
          <View style={styles.playerInputRow}>
            <View style={[styles.playerAvatar, styles.blackAvatar]}>
              <Text style={[styles.avatarLetter, styles.blackAvatarText]}>
                {blackPlayer.trim().charAt(0).toUpperCase() || '♚'}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.sideLabel}>BLACK</Text>
              <TextInput
                style={[styles.textInput, blackError ? styles.textInputError : null]}
                value={blackPlayer}
                onChangeText={(val) => {
                  console.log('[NewGameSetup] Black player name changed to:', val);
                  setBlackPlayer(val);
                  if (blackError) setBlackError('');
                }}
                placeholder="Enter name"
                placeholderTextColor={Colors.text.muted}
                autoCapitalize="words"
              />
              {blackError ? <Text style={styles.errorText}>{blackError}</Text> : null}
            </View>
          </View>
        </View>

        {/* TIME CONTROL CARD */}
        <View style={[styles.sectionCard, Elevations.low]}>
          <Text style={styles.sectionHeading}>TIME CONTROL</Text>

          {/* Category Tabs */}
          <View style={styles.categoryTabs}>
            {['bullet', 'blitz', 'rapid', 'custom'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catTab,
                  selectedCategory === cat && styles.catTabActive,
                ]}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text
                  style={[
                    styles.catTabText,
                    selectedCategory === cat && styles.catTabTextActive,
                  ]}
                >
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedCategory !== 'custom' ? (
            /* Time Chips Grid */
            <View style={styles.chipsGrid}>
              {TIME_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.timeChip,
                      Elevations.low,
                      isSelected && styles.timeChipActive,
                      isSelected && Shadows.goldSubtle,
                    ]}
                    onPress={() => handleSelectPreset(p)}
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        isSelected && styles.timeChipTextActive,
                      ]}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Custom Time Stepper */
            <View style={styles.customStepperContainer}>
              <View style={styles.stepperCol}>
                <Text style={styles.stepperLabel}>MINUTES</Text>
                <View style={styles.stepperBox}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setCustomMin((m) => Math.max(1, m - 1))}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{customMin}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setCustomMin((m) => m + 1)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stepperCol}>
                <Text style={styles.stepperLabel}>SECONDS</Text>
                <View style={styles.stepperBox}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setCustomSec((s) => Math.max(0, s - 5))}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{customSec}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setCustomSec((s) => (s < 55 ? s + 5 : 0))}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* MATCH AUDIO & WARNING SETTINGS (Replaced Increment) */}
        <View style={[styles.sectionCard, Elevations.low]}>
          <Text style={styles.sectionHeading}>AUDIO & WARNING OPTIONS</Text>

          {/* Sound On / Off */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>🔊 Sound Effects</Text>
              <Text style={styles.switchSubtitle}>Move click sounds & time-out alarm</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              thumbColor={soundEnabled ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>

          <View style={styles.divider} />

          {/* 10-Second Warning On / Off */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>⚠️ 10-Second Warning</Text>
              <Text style={styles.switchSubtitle}>Red alert styling & warning audio</Text>
            </View>
            <Switch
              value={tenSecAlert}
              onValueChange={handleToggleTenSec}
              thumbColor={tenSecAlert ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Vibration Feedback */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>📳 Tactile Vibration</Text>
              <Text style={styles.switchSubtitle}>Haptic pulse on turn switch</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleToggleVibration}
              thumbColor={vibrationEnabled ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>
        </View>

        {/* START GAME BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.startGameBtn, Elevations.high, Shadows.goldGlow]}
          onPress={handleStartMatch}
        >
          <Text style={styles.startGameBtnText}>START GAME</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR: Home | History | Profile | Settings */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  headerRightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  iconSymbol: {
    fontSize: 18,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  sectionCard: {
    backgroundColor: Colors.background.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 12,
  },
  playerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Typography.titleMedium.fontFamily,
  },
  blackAvatarText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flex: 1,
  },
  sideLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 2,
  },
  textInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: Typography.body.fontFamily,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  textInputError: {
    borderColor: Colors.status.danger,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 11,
    color: Colors.status.danger,
    marginTop: 4,
    fontFamily: Typography.caption.fontFamily,
    fontWeight: '600',
  },
  swapBtnRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  swapBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.background.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  swapBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gold.light,
    fontFamily: Typography.caption.fontFamily,
    letterSpacing: 1,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  catTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  catTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  catTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  catTabTextActive: {
    color: Colors.gold.light,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    width: '30%',
    paddingVertical: 14,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borders.subtle,
  },
  timeChipActive: {
    backgroundColor: Colors.background.surfaceElevated,
    borderColor: Colors.gold.primary,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  timeChipTextActive: {
    color: Colors.gold.light,
  },
  customStepperContainer: {
    flexDirection: 'row',
    gap: 14,
  },
  stepperCol: {
    flex: 1,
  },
  stepperLabel: {
    fontSize: 11,
    color: Colors.text.muted,
    marginBottom: 6,
    fontFamily: Typography.caption.fontFamily,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: Colors.gold.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borders.subtle,
    marginVertical: 10,
  },
  startGameBtn: {
    backgroundColor: Colors.gold.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  startGameBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.background.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
});

export default NewGameSetup;
