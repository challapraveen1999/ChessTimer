import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Colors, Typography, Shadows, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';
import { getUserProfile, saveUserProfile } from '../Helpers/storageHelper';

const AVATAR_OPTIONS = [
  { id: 1, icon: '♚', label: 'King' },
  { id: 2, icon: '♛', label: 'Queen' },
  { id: 3, icon: '♞', label: 'Knight' },
  { id: 4, icon: '♜', label: 'Rook' },
];

const EditProfile = ({ navigation }) => {
  console.log('[EditProfile] Rendering Edit Profile screen');

  const [name, setName] = useState('Grandmaster');
  const [title, setTitle] = useState('Grandmaster');
  const [rating, setRating] = useState('1850');
  const [selectedAvatarId, setSelectedAvatarId] = useState(1);
  const [preferredSide, setPreferredSide] = useState('white'); // 'white' | 'black' | 'random'

  useEffect(() => {
    getUserProfile().then((data) => {
      if (data) {
        console.log('[EditProfile] Loaded initial profile for editing:', data.name);
        setName(data.name || 'Grandmaster');
        setTitle(data.title || 'Grandmaster');
        setRating(data.rating || '1850');
        setSelectedAvatarId(data.avatarId || 1);
        setPreferredSide(data.preferredSide || 'white');
      }
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a valid player name.');
      return;
    }

    const payload = {
      name: name.trim(),
      title: title.trim() || 'Grandmaster',
      rating: rating.trim() || '1850',
      avatarId: selectedAvatarId,
      preferredSide,
    };

    console.log('[EditProfile] Saving updated profile:', payload);
    AudioService.playMoveSound();
    await saveUserProfile(payload);

    Alert.alert('Profile Saved', 'Your Grandmaster profile has been updated.', [
      {
        text: 'OK',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            console.log('[EditProfile] Cancelled edit profile');
            AudioService.playMoveSound();
            navigation.goBack();
          }}
        >
          <Text style={styles.backBtnText}>‹ CANCEL</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDIT PROFILE</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* AVATAR SELECTOR CARD */}
        <View style={[styles.sectionCard, Elevations.low]}>
          <Text style={styles.sectionHeading}>CHOOSE AVATAR EMBLEM</Text>
          <View style={styles.avatarsRow}>
            {AVATAR_OPTIONS.map((item) => {
              const isSelected = selectedAvatarId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.avatarItem,
                    isSelected && styles.avatarItemActive,
                    isSelected && Elevations.medium,
                  ]}
                  onPress={() => {
                    console.log('[EditProfile] Selected avatar:', item.label);
                    AudioService.playMoveSound();
                    setSelectedAvatarId(item.id);
                  }}
                >
                  <Text style={styles.avatarIconText}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.avatarLabel,
                      isSelected && styles.avatarLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PROFILE DETAILS CARD */}
        <View style={[styles.sectionCard, Elevations.low]}>
          <Text style={styles.sectionHeading}>PLAYER INFORMATION</Text>

          {/* Name Input */}
          <Text style={styles.inputLabel}>DISPLAY NAME</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={(t) => {
              console.log('[EditProfile] Name changed to:', t);
              setName(t);
            }}
            placeholder="Your Name"
            placeholderTextColor={Colors.text.muted}
          />

          {/* Title Input */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>TITLE / RANK</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={(t) => {
              console.log('[EditProfile] Title changed to:', t);
              setTitle(t);
            }}
            placeholder="Grandmaster, Master, Club Player"
            placeholderTextColor={Colors.text.muted}
          />

          {/* Rating ELO Input */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>CHESS RATING (ELO)</Text>
          <TextInput
            style={styles.textInput}
            value={rating}
            onChangeText={(t) => {
              console.log('[EditProfile] Rating changed to:', t);
              setRating(t);
            }}
            keyboardType="numeric"
            placeholder="1850"
            placeholderTextColor={Colors.text.muted}
          />
        </View>

        {/* PREFERRED PIECE SIDE */}
        <View style={[styles.sectionCard, Elevations.low]}>
          <Text style={styles.sectionHeading}>PREFERRED SIDE</Text>
          <View style={styles.sideOptionsRow}>
            {[
              { id: 'white', label: '⚪ White' },
              { id: 'black', label: '⚫ Black' },
              { id: 'random', label: '🎲 Random' },
            ].map((side) => {
              const isSelected = preferredSide === side.id;
              return (
                <TouchableOpacity
                  key={side.id}
                  style={[
                    styles.sideOptionBtn,
                    isSelected && styles.sideOptionBtnActive,
                  ]}
                  onPress={() => {
                    console.log('[EditProfile] Preferred side selected:', side.id);
                    AudioService.playMoveSound();
                    setPreferredSide(side.id);
                  }}
                >
                  <Text
                    style={[
                      styles.sideOptionText,
                      isSelected && styles.sideOptionTextActive,
                    ]}
                  >
                    {side.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SAVE CTA BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, Elevations.high, Shadows.goldGlow]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: Colors.text.muted,
    fontSize: 13,
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: Colors.background.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 14,
  },
  avatarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  avatarItem: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borders.subtle,
  },
  avatarItemActive: {
    backgroundColor: Colors.background.surfaceElevated,
    borderColor: Colors.gold.primary,
  },
  avatarIconText: {
    fontSize: 32,
    color: Colors.gold.light,
    marginBottom: 4,
  },
  avatarLabel: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  avatarLabelActive: {
    color: Colors.gold.light,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.text.muted,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text.primary,
    fontWeight: '600',
    fontFamily: Typography.body.fontFamily,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  sideOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sideOptionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1.5,
    borderColor: Colors.borders.subtle,
  },
  sideOptionBtnActive: {
    borderColor: Colors.gold.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  sideOptionText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  sideOptionTextActive: {
    color: Colors.gold.light,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: Colors.gold.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.background.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
});

export default EditProfile;
