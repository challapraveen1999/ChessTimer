import React, { useState, useEffect } from 'react';
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
import { getUserProfile, getMatchHistory } from '../Helpers/storageHelper';
import BottomNavBar from '../Components/BottomNavBar';

const AVATAR_OPTIONS = [
  { id: 1, icon: '♚', label: 'King' },
  { id: 2, icon: '♛', label: 'Queen' },
  { id: 3, icon: '♞', label: 'Knight' },
  { id: 4, icon: '♜', label: 'Rook' },
];

const Profile = ({ navigation }) => {
  console.log('[Profile] Rendering Dynamic Profile screen');

  const [profile, setProfile] = useState({
    name: 'Player',
    title: 'Grandmaster',
    rating: '1850',
    preferredSide: 'white',
    avatarId: 1,
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    avgTimeSec: 0,
  });

  const [recentBadges, setRecentBadges] = useState([]);

  useEffect(() => {
    loadProfileAndStats();
    const unsubscribe = navigation?.addListener
      ? navigation.addListener('focus', loadProfileAndStats)
      : null;
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const loadProfileAndStats = async () => {
    console.log('[Profile] Loading dynamic user profile and match history stats...');
    const storedProfile = await getUserProfile();
    const history = await getMatchHistory();

    const playerName = storedProfile?.name?.trim() || 'Player';
    const total = history ? history.length : 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalDuration = 0;
    const badges = [];

    if (history && history.length > 0) {
      history.forEach((m, idx) => {
        totalDuration += m.duration || 0;
        const winnerStr = (m.winner || '').toLowerCase();
        const reasonStr = (m.reason || '').toLowerCase();
        const isDraw = winnerStr.includes('draw') || reasonStr.includes('draw');

        // Check if player won
        const isUserWinner =
          !isDraw &&
          (winnerStr.includes(playerName.toLowerCase()) ||
            (m.whitePlayer &&
              m.whitePlayer.toLowerCase() === playerName.toLowerCase() &&
              winnerStr.includes('white')) ||
            (m.blackPlayer &&
              m.blackPlayer.toLowerCase() === playerName.toLowerCase() &&
              winnerStr.includes('black')) ||
            winnerStr.includes('white')); // fallback to white side

        if (isDraw) {
          draws++;
          if (badges.length < 5) badges.push('D');
        } else if (isUserWinner) {
          wins++;
          if (badges.length < 5) badges.push('W');
        } else {
          losses++;
          if (badges.length < 5) badges.push('L');
        }
      });
    }

    const updated = {
      ...(storedProfile || {}),
      name: playerName,
      title: storedProfile?.title || 'Grandmaster',
      rating: storedProfile?.rating || '1850',
      avatarId: storedProfile?.avatarId || 1,
      preferredSide: storedProfile?.preferredSide || 'white',
      totalMatches: total,
      wins,
      losses,
      draws,
      avgTimeSec: total > 0 ? Math.round(totalDuration / total) : 0,
    };

    setProfile(updated);
    setRecentBadges(badges);
    console.log('[Profile] Dynamic profile and stats updated successfully:', {
      name: updated.name,
      avatarId: updated.avatarId,
      totalMatches: total,
      wins,
      losses,
      draws,
      badges,
    });
  };

  const formatSecs = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const winRate =
    profile.totalMatches > 0
      ? Math.round((profile.wins / profile.totalMatches) * 100)
      : 0;

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];

  const handleEdit = () => {
    console.log('[Profile] Navigating to EditProfile');
    AudioService.playMoveSound();
    navigation.navigate('EditProfile');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            console.log('[Profile] Back button pressed');
            AudioService.playMoveSound();
            navigation.goBack();
          }}
        >
          <Text style={styles.backBtnText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <TouchableOpacity style={styles.editHeaderBtn} onPress={handleEdit}>
          <Text style={styles.editHeaderText}>EDIT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* USER HERO CARD */}
        <View style={[styles.userCard, Elevations.high, Shadows.goldGlow]}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIcon}>{currentAvatar.icon}</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userTitle}>
            {profile.title} • {profile.rating} ELO
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{currentAvatar.label.toUpperCase()}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {profile.preferredSide?.toUpperCase()} SIDE
              </Text>
            </View>
          </View>

          {/* Win Rate Donut Badge */}
          <View style={styles.winRateBox}>
            <Text style={styles.winRateValue}>
              {profile.totalMatches > 0 ? `${winRate}%` : '0%'}
            </Text>
            <Text style={styles.winRateLabel}>WIN RATE</Text>
          </View>
        </View>

        {/* PERFORMANCE STATS GRID */}
        <View style={[styles.statsCard, Elevations.low]}>
          <Text style={styles.statsCardTitle}>PERFORMANCE OVERVIEW</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile.totalMatches}</Text>
              <Text style={styles.statLbl}>MATCHES</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: Colors.status.success }]}>
                {profile.wins}
              </Text>
              <Text style={styles.statLbl}>WINS</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: Colors.status.danger }]}>
                {profile.losses}
              </Text>
              <Text style={styles.statLbl}>LOSSES</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: Colors.gold.light }]}>
                {profile.draws}
              </Text>
              <Text style={styles.statLbl}>DRAWS</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaStatRow}>
            <Text style={styles.metaStatLbl}>Average Match Think Time</Text>
            <Text style={styles.metaStatVal}>{formatSecs(profile.avgTimeSec)}</Text>
          </View>
        </View>

        {/* RECENT MATCH RESULTS */}
        <View style={[styles.statsCard, Elevations.low]}>
          <Text style={styles.statsCardTitle}>RECENT FORM</Text>
          {recentBadges.length === 0 ? (
            <View style={styles.emptyRecentForm}>
              <Text style={styles.emptyFormText}>
                No matches played yet. Play games to track your recent form!
              </Text>
            </View>
          ) : (
            <View style={styles.badgesRow}>
              {recentBadges.map((res, i) => (
                <View
                  key={i}
                  style={[
                    styles.badgeCircle,
                    res === 'W'
                      ? styles.badgeWin
                      : res === 'D'
                      ? styles.badgeDraw
                      : styles.badgeLoss,
                  ]}
                >
                  <Text style={styles.badgeText}>{res}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* EDIT PROFILE CTA BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.editProfileBtn, Elevations.high, Shadows.goldGlow]}
          onPress={handleEdit}
        >
          <Text style={styles.editProfileBtnText}>EDIT PROFILE & AVATAR</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomNavBar activeTab="profile" navigation={navigation} />
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
  editHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  editHeaderText: {
    fontSize: 11,
    color: Colors.gold.light,
    fontWeight: '700',
    fontFamily: Typography.caption.fontFamily,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  userCard: {
    backgroundColor: Colors.background.surfaceElevated,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF5E4',
    borderWidth: 3,
    borderColor: Colors.gold.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 42,
    color: '#000000',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.status.success,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: Typography.titleLarge.fontFamily,
    marginBottom: 2,
  },
  userTitle: {
    fontSize: 13,
    color: Colors.gold.light,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.gold.champagne,
    fontFamily: Typography.caption.fontFamily,
  },
  winRateBox: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
    alignItems: 'center',
  },
  winRateValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gold.light,
    fontFamily: Typography.titleLarge.fontFamily,
  },
  winRateLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statsCard: {
    backgroundColor: Colors.background.surface,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  statsCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 10,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borders.subtle,
    marginVertical: 14,
  },
  metaStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaStatLbl: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: Typography.body.fontFamily,
  },
  metaStatVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold.light,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  emptyRecentForm: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyFormText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  badgeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  badgeWin: {
    backgroundColor: 'rgba(42, 157, 143, 0.2)',
    borderColor: Colors.status.success,
  },
  badgeLoss: {
    backgroundColor: 'rgba(230, 57, 70, 0.2)',
    borderColor: Colors.status.danger,
  },
  badgeDraw: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: Colors.gold.primary,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  editProfileBtn: {
    backgroundColor: Colors.gold.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  editProfileBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.background.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
});

export default Profile;
