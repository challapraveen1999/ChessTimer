import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Shadows, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';

const PRESETS = {
  bullet: [
    { id: 'b1', name: 'Bullet 1|0', baseSec: 60, incSec: 0, desc: '1 min • Ultra fast lightning chess' },
    { id: 'b2', name: 'Bullet 1|1', baseSec: 60, incSec: 1, desc: '1 min + 1s per move' },
    { id: 'b3', name: 'Bullet 2|1', baseSec: 120, incSec: 1, desc: '2 min + 1s per move' },
  ],
  blitz: [
    { id: 'bl1', name: 'Blitz 3|0', baseSec: 180, incSec: 0, desc: '3 min • Classic blitz' },
    { id: 'bl2', name: 'Blitz 3|2', baseSec: 180, incSec: 2, desc: '3 min + 2s Fischer increment' },
    { id: 'bl3', name: 'Blitz 5|0', baseSec: 300, incSec: 0, desc: '5 min standard' },
    { id: 'bl4', name: 'Blitz 5|3', baseSec: 300, incSec: 3, desc: '5 min + 3s Fischer tournament' },
  ],
  rapid: [
    { id: 'r1', name: 'Rapid 10|0', baseSec: 600, incSec: 0, desc: '10 min • Most popular rapid' },
    { id: 'r2', name: 'Rapid 15|10', baseSec: 900, incSec: 10, desc: '15 min + 10s FIDE rapid' },
    { id: 'r3', name: 'Rapid 25|0', baseSec: 1500, incSec: 0, desc: '25 min deep thinking' },
  ],
  classical: [
    { id: 'c1', name: 'Classical 30|0', baseSec: 1800, incSec: 0, desc: '30 min championship' },
    { id: 'c2', name: 'Classical 60|0', baseSec: 3600, incSec: 0, desc: '60 min tournament standard' },
    { id: 'c3', name: 'Classical 90|30', baseSec: 5400, incSec: 30, desc: '90 min + 30s World Championship' },
  ],
};

const TimeControls = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('blitz'); // 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom'
  const [selectedPresetId, setSelectedPresetId] = useState('bl3');

  // Custom configuration
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [customInc, setCustomInc] = useState(3);
  const [customType, setCustomType] = useState('fischer');

  const handleSelectPreset = (preset) => {
    AudioService.playMoveSound();
    setSelectedPresetId(preset.id);
  };

  const handleApply = () => {
    AudioService.playMoveSound();
    let initialTimeSec = 300;
    let incrementSec = 0;
    let presetName = 'Blitz 5 min';
    let incType = 'fischer';

    if (selectedTab === 'custom') {
      initialTimeSec = customMinutes * 60 + customSeconds;
      incrementSec = customInc;
      presetName = `Custom ${customMinutes}m + ${customInc}s`;
      incType = customType;
    } else {
      const activeList = PRESETS[selectedTab];
      const match = activeList.find((p) => p.id === selectedPresetId) || activeList[0];
      initialTimeSec = match.baseSec;
      incrementSec = match.incSec;
      presetName = match.name;
    }

    navigation.navigate('Timmer', {
      initialTimeSec,
      incrementSec,
      incrementType: incType,
      presetName,
    });
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
        <Text style={styles.headerTitle}>TIME CONTROLS</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['bullet', 'blitz', 'rapid', 'classical', 'custom'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, selectedTab === tab && styles.tabItemActive]}
            onPress={() => {
              AudioService.playMoveSound();
              setSelectedTab(tab);
            }}
          >
            <Text
              style={[styles.tabItemText, selectedTab === tab && styles.tabItemTextActive]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {selectedTab !== 'custom' ? (
          // Preset Cards List
          <View style={styles.presetsList}>
            {PRESETS[selectedTab].map((p) => {
              const isSelected = selectedPresetId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.85}
                  style={[
                    styles.presetCard,
                    Elevations.low,
                    isSelected && styles.presetCardActive,
                    isSelected && Shadows.goldSubtle,
                  ]}
                  onPress={() => handleSelectPreset(p)}
                >
                  <View style={styles.presetCardLeft}>
                    <Text
                      style={[
                        styles.presetCardTitle,
                        isSelected && styles.presetCardTitleActive,
                      ]}
                    >
                      {p.name}
                    </Text>
                    <Text style={styles.presetCardDesc}>{p.desc}</Text>
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
        ) : (
          // Custom Time Builder
          <View style={styles.customBuilder}>
            <Text style={styles.sectionHeading}>BASE TIME PER PLAYER</Text>
            <View style={styles.builderRow}>
              {/* Minutes */}
              <View style={styles.builderCol}>
                <Text style={styles.counterLabel}>MINUTES</Text>
                <View style={styles.counterBox}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setCustomMinutes((m) => Math.max(1, m - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{customMinutes}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setCustomMinutes((m) => m + 1)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Seconds */}
              <View style={styles.builderCol}>
                <Text style={styles.counterLabel}>SECONDS</Text>
                <View style={styles.counterBox}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setCustomSeconds((s) => Math.max(0, s - 5))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{customSeconds}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setCustomSeconds((s) => (s < 55 ? s + 5 : 0))}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 24 }]}>
              INCREMENT / BONUS (PER MOVE)
            </Text>
            <View style={styles.incRow}>
              {[0, 1, 2, 3, 5, 10, 15, 30].map((inc) => (
                <TouchableOpacity
                  key={inc}
                  style={[styles.incChip, customInc === inc && styles.incChipActive]}
                  onPress={() => {
                    AudioService.playMoveSound();
                    setCustomInc(inc);
                  }}
                >
                  <Text
                    style={[
                      styles.incChipText,
                      customInc === inc && styles.incChipTextActive,
                    ]}
                  >
                    +{inc}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 24 }]}>
              INCREMENT MODE
            </Text>
            <View style={styles.typeRow}>
              {[
                { key: 'fischer', label: 'Fischer (Added to clock)' },
                { key: 'bronstein', label: 'Bronstein (Delay non-acc)' },
                { key: 'delay', label: 'Simple US Delay' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeBtn,
                    customType === type.key && styles.typeBtnActive,
                  ]}
                  onPress={() => {
                    AudioService.playMoveSound();
                    setCustomType(type.key);
                  }}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      customType === type.key && styles.typeBtnTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.applyButton, Elevations.high, Shadows.goldGlow]}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>APPLY TIME CONTROL</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.gold.champagne,
    fontFamily: Typography.titleLarge.fontFamily,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  tabItemText: {
    fontSize: 11,
    fontFamily: Typography.caption.fontFamily,
    color: Colors.text.muted,
    fontWeight: '700',
  },
  tabItemTextActive: {
    color: Colors.gold.light,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 100,
  },
  presetsList: {
    gap: 12,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borders.subtle,
  },
  presetCardActive: {
    backgroundColor: Colors.background.surfaceElevated,
    borderColor: Colors.gold.primary,
  },
  presetCardLeft: {
    flex: 1,
  },
  presetCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    marginBottom: 4,
  },
  presetCardTitleActive: {
    color: Colors.gold.light,
  },
  presetCardDesc: {
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
  customBuilder: {
    backgroundColor: Colors.background.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 12,
  },
  builderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  builderCol: {
    flex: 1,
  },
  counterLabel: {
    fontSize: 11,
    color: Colors.text.muted,
    marginBottom: 8,
    fontFamily: Typography.caption.fontFamily,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: Colors.gold.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: Typography.titleLarge.fontFamily,
  },
  incRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  incChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  incChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: Colors.gold.primary,
  },
  incChipText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontFamily: Typography.caption.fontFamily,
  },
  incChipTextActive: {
    color: Colors.gold.light,
    fontWeight: '700',
  },
  typeRow: {
    gap: 8,
  },
  typeBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  typeBtnActive: {
    borderColor: Colors.gold.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  typeBtnText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  typeBtnTextActive: {
    color: Colors.gold.light,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderTopWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  applyButton: {
    backgroundColor: Colors.gold.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.background.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
});

export default TimeControls;
