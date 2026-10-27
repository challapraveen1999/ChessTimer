import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Shadows, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';
import { getUserSettings, saveUserSettings } from '../Helpers/storageHelper';
import BottomNavBar from '../Components/BottomNavBar';

const SOUND_PROFILES = [
  { id: 'digital', name: 'Digital Beep', desc: 'Standard FIDE tournament electronic beep' },
  { id: 'mechanical', name: 'Mechanical Clock', desc: 'Vintage Swiss wooden horology click' },
  { id: 'pulse', name: 'Acoustic Pulse', desc: 'Modern refined resonance chime' },
  { id: 'alarm', name: 'Grandmaster Buzzer', desc: 'Crisp high-clarity audible signal' },
];

const SoundSettings = ({ navigation }) => {
  const [selectedProfile, setSelectedProfile] = useState(AudioService.soundProfile || 'digital');
  const [soundEnabled, setSoundEnabled] = useState(AudioService.soundEnabled);
  const [vibrationEnabled, setVibrationEnabled] = useState(AudioService.vibrationEnabled);
  const [tenSecAlert, setTenSecAlert] = useState(true);
  const [countdownTicks, setCountdownTicks] = useState(true);
  const [flagFallAlert, setFlagFallAlert] = useState(true);
  const [milliMode, setMilliMode] = useState('under10');

  useEffect(() => {
    getUserSettings().then((settings) => {
      if (settings) {
        setSelectedProfile(settings.soundProfile || 'digital');
        setSoundEnabled(settings.soundEnabled ?? true);
        setVibrationEnabled(settings.vibrationEnabled ?? true);
        setTenSecAlert(settings.tenSecAlert ?? true);
        setCountdownTicks(settings.countdownTicks ?? true);
        setFlagFallAlert(settings.flagFallAlert ?? true);
        setMilliMode(settings.milliMode || 'under10');
      }
    });
  }, []);

  const handleSelectProfile = (profileId) => {
    console.log('[SoundSettings] Sound profile selected:', profileId);
    setSelectedProfile(profileId);
    AudioService.setSoundProfile(profileId);
    AudioService.playTestBeep(profileId);
    saveUserSettings({ soundProfile: profileId });
  };

  const handleToggleSound = (val) => {
    console.log('[SoundSettings] Sound effects toggled:', val);
    setSoundEnabled(val);
    AudioService.setSoundEnabled(val);
    saveUserSettings({ soundEnabled: val });
  };

  const handleToggleVibration = (val) => {
    console.log('[SoundSettings] Vibration toggled:', val);
    setVibrationEnabled(val);
    AudioService.setVibrationEnabled(val);
    saveUserSettings({ vibrationEnabled: val });
  };

  const handleToggleTenSec = (val) => {
    console.log('[SoundSettings] 10s warning toggled:', val);
    setTenSecAlert(val);
    saveUserSettings({ tenSecAlert: val });
  };

  const handleToggleCountdown = (val) => {
    console.log('[SoundSettings] Countdown ticks toggled:', val);
    setCountdownTicks(val);
    saveUserSettings({ countdownTicks: val });
  };

  const handleToggleFlagFall = (val) => {
    console.log('[SoundSettings] Flag fall buzzer toggled:', val);
    setFlagFallAlert(val);
    saveUserSettings({ flagFallAlert: val });
  };

  const handleSelectMilliMode = (mode) => {
    console.log('[SoundSettings] Milliseconds format selected:', mode);
    setMilliMode(mode);
    saveUserSettings({ milliMode: mode });
  };

  const handleTestSound = () => {
    console.log('[SoundSettings] Test Beep button pressed for profile:', selectedProfile);
    AudioService.playTestBeep(selectedProfile);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            AudioService.playMoveSound();
            navigation.goBack();
          }}
        >
          <Text style={styles.backBtnText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOUND & HAPTICS</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Master Audio Toggle */}
        <View style={[styles.card, Elevations.low]}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.cardTitle}>Audio Sound Effects</Text>
              <Text style={styles.cardSubtitle}>Enable move clicks, beeps, and alarms</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              thumbColor={soundEnabled ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>
        </View>

        {/* Sound Profile Selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SOUND PROFILES</Text>
          <TouchableOpacity
            style={[styles.testBtn, Elevations.low]}
            onPress={handleTestSound}
          >
            <Text style={styles.testBtnText}>▶ TEST BEEP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileList}>
          {SOUND_PROFILES.map((p) => {
            const isSelected = selectedProfile === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.profileCard,
                  Elevations.low,
                  isSelected && styles.profileCardActive,
                  isSelected && Shadows.goldSubtle,
                ]}
                onPress={() => handleSelectProfile(p.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.profileName,
                      isSelected && styles.profileNameActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                  <Text style={styles.profileDesc}>{p.desc}</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Warning Alerts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>WARNING ALERTS</Text>
        </View>

        <View style={[styles.card, Elevations.low]}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.rowTitle}>10-Second Warning Alert</Text>
              <Text style={styles.rowSubtitle}>Warning audio cue when entering low time</Text>
            </View>
            <Switch
              value={tenSecAlert}
              onValueChange={handleToggleTenSec}
              thumbColor={tenSecAlert ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.rowTitle}>5-4-3-2-1 Countdown Ticks</Text>
              <Text style={styles.rowSubtitle}>Audio ticks on final 5 seconds</Text>
            </View>
            <Switch
              value={countdownTicks}
              onValueChange={handleToggleCountdown}
              thumbColor={countdownTicks ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.rowTitle}>Time-Out Flag Fall Buzzer</Text>
              <Text style={styles.rowSubtitle}>Loud alarm when time expires</Text>
            </View>
            <Switch
              value={flagFallAlert}
              onValueChange={handleToggleFlagFall}
              thumbColor={flagFallAlert ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>
        </View>

        {/* Haptics & Vibration */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HAPTICS & VIBRATION</Text>
        </View>

        <View style={[styles.card, Elevations.low]}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.rowTitle}>Tactile Turn Haptics</Text>
              <Text style={styles.rowSubtitle}>Vibrate device on each turn switch</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleToggleVibration}
              thumbColor={vibrationEnabled ? Colors.gold.primary : '#8E8E93'}
              trackColor={{ false: '#2C2B36', true: 'rgba(212, 175, 55, 0.4)' }}
            />
          </View>
        </View>

        {/* Display Format */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MILLISECONDS DISPLAY</Text>
        </View>

        <View style={[styles.card, Elevations.low]}>
          <View style={styles.segmentedRow}>
            {[
              { id: 'under10', label: '< 10 Seconds' },
              { id: 'always', label: 'Always' },
              { id: 'never', label: 'Never' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.segmentBtn,
                  milliMode === opt.id && styles.segmentBtnActive,
                ]}
                onPress={() => handleSelectMilliMode(opt.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    milliMode === opt.id && styles.segmentTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomNavBar activeTab="settings" navigation={navigation} />
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
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backBtnText: {
    color: Colors.gold.primary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.caption.fontFamily,
  },
  headerTitle: {
    fontSize: 17,
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.background.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: Typography.body.fontFamily,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borders.subtle,
    marginVertical: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
  },
  testBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  testBtnText: {
    fontSize: 11,
    color: Colors.gold.light,
    fontWeight: '700',
    fontFamily: Typography.caption.fontFamily,
  },
  profileList: {
    gap: 10,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.borders.subtle,
  },
  profileCardActive: {
    borderColor: Colors.gold.primary,
    backgroundColor: Colors.background.surfaceElevated,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    marginBottom: 3,
  },
  profileNameActive: {
    color: Colors.gold.light,
  },
  profileDesc: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borders.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioCircleSelected: {
    borderColor: Colors.gold.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold.primary,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: Colors.gold.primary,
  },
  segmentText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  segmentTextActive: {
    color: Colors.gold.light,
    fontWeight: '700',
  },
});

export default SoundSettings;
