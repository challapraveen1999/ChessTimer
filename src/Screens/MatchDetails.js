import React from 'react';
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
import BottomNavBar from '../Components/BottomNavBar';

const MatchDetails = ({ navigation, route }) => {
  const match = route?.params || {};
  console.log('[MatchDetails] Viewing match details for:', match.id, match.winner);

  const {
    winner = 'White Wins!',
    reason = 'Time Out',
    whitePlayer = 'White',
    blackPlayer = 'Black',
    presetName = 'Blitz 5 min',
    totalMoves = 24,
    duration = 298,
    formattedDate = new Date().toLocaleDateString(),
  } = match;

  const formatSecs = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            console.log('[MatchDetails] Back button pressed');
            AudioService.playMoveSound();
            navigation.goBack();
          }}
        >
          <Text style={styles.backBtnText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MATCH DETAILS</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* WINNER HERO CARD */}
        <View style={[styles.heroCard, Elevations.high, Shadows.goldGlow]}>
          <Text style={styles.crownIcon}>🏆</Text>
          <Text style={styles.winnerTitle}>{winner.toUpperCase()}</Text>
          <Text style={styles.reasonText}>{reason}</Text>

          <View style={styles.playersBadge}>
            <Text style={styles.playersBadgeText}>
              {whitePlayer} (White) vs {blackPlayer} (Black)
            </Text>
          </View>
        </View>

        {/* METRICS GRID */}
        <View style={styles.gridRow}>
          <View style={[styles.gridCard, Elevations.low]}>
            <Text style={styles.gridLabel}>TIME CONTROL</Text>
            <Text style={styles.gridValue}>{presetName}</Text>
          </View>
          <View style={[styles.gridCard, Elevations.low]}>
            <Text style={styles.gridLabel}>DURATION</Text>
            <Text style={styles.gridValue}>{formatSecs(duration)}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.gridCard, Elevations.low]}>
            <Text style={styles.gridLabel}>TOTAL MOVES</Text>
            <Text style={styles.gridValue}>{totalMoves || 0}</Text>
          </View>
          <View style={[styles.gridCard, Elevations.low]}>
            <Text style={styles.gridLabel}>DATE PLAYED</Text>
            <Text style={styles.gridValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* TIME TRAJECTORY GRAPH */}
        <View style={[styles.chartCard, Elevations.low]}>
          <Text style={styles.chartTitle}>TIME CONSUMPTION CURVE</Text>
          <View style={styles.chartContainer}>
            {[80, 72, 65, 58, 50, 42, 34, 28, 20, 14, 8, 2].map((height, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.barWhite, { height: `${height}%` }]} />
                <View
                  style={[
                    styles.barBlack,
                    { height: `${Math.max(2, height - (i > 8 ? 8 : 2))}%` },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.gold.light }]} />
              <Text style={styles.legendText}>{whitePlayer} (White)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6E6E7E' }]} />
              <Text style={styles.legendText}>{blackPlayer} (Black)</Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.newGameBtn, Elevations.high, Shadows.goldGlow]}
          onPress={() => {
            console.log('[MatchDetails] New Game pressed from Match Details');
            AudioService.playMoveSound();
            navigation.navigate('NewGameSetup');
          }}
        >
          <Text style={styles.newGameBtnText}>START NEW GAME</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomNavBar activeTab="history" navigation={navigation} />
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  heroCard: {
    backgroundColor: Colors.background.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
  },
  crownIcon: {
    fontSize: 44,
    marginBottom: 6,
  },
  winnerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.gold.light,
    fontFamily: Typography.titleLarge.fontFamily,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontFamily: Typography.body.fontFamily,
    marginBottom: 12,
  },
  playersBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  playersBadgeText: {
    fontSize: 12,
    color: Colors.gold.light,
    fontWeight: '700',
    fontFamily: Typography.caption.fontFamily,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    letterSpacing: 1,
    marginBottom: 6,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.background.surface,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 14,
  },
  chartContainer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  barCol: {
    width: 16,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  barWhite: {
    width: 6,
    backgroundColor: Colors.gold.light,
    borderRadius: 3,
  },
  barBlack: {
    width: 6,
    backgroundColor: '#6E6E7E',
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  newGameBtn: {
    backgroundColor: Colors.gold.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  newGameBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.background.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
});

export default MatchDetails;
