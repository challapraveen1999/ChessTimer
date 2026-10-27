import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Colors, Typography, Shadows, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';
import { getMatchHistory, clearMatchHistory } from '../Helpers/storageHelper';

const MatchAnalytics = ({ navigation, route }) => {
  const {
    winner = 'Player 2 (White)',
    reason = 'Time Forfeit (Flag Fall)',
    presetName = 'Blitz 5 min',
    totalMoves = 38,
    p1Moves = 19,
    p2Moves = 19,
    duration = 482,
  } = route?.params || {};

  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'history'
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const list = await getMatchHistory();
    setHistoryList(list || []);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Match History',
      'Are you sure you want to permanently erase all past match records?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            AudioService.playMoveSound();
            await clearMatchHistory();
            setHistoryList([]);
          },
        },
      ]
    );
  };

  const formatSecs = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const avgMoveSecWhite = p2Moves > 0 ? (duration / 2 / p2Moves).toFixed(1) : '0';
  const avgMoveSecBlack = p1Moves > 0 ? (duration / 2 / p1Moves).toFixed(1) : '0';

  const handleRematch = () => {
    AudioService.playMoveSound();
    navigation.navigate('Timmer');
  };

  const handleNewGame = () => {
    AudioService.playMoveSound();
    navigation.navigate('TimeControls');
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
            navigation.navigate('Timmer');
          }}
        >
          <Text style={styles.backBtnText}>✕ CLOSE</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MATCH ANALYTICS</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* View Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'current' && styles.tabBtnActive]}
          onPress={() => {
            AudioService.playMoveSound();
            setActiveTab('current');
          }}
        >
          <Text
            style={[styles.tabBtnText, activeTab === 'current' && styles.tabBtnTextActive]}
          >
            CURRENT MATCH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => {
            AudioService.playMoveSound();
            loadHistory();
            setActiveTab('history');
          }}
        >
          <Text
            style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}
          >
            MATCH HISTORY ({historyList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'current' ? (
          <>
            {/* Victory Announcement Card */}
            <View style={[styles.victoryCard, Elevations.high, Shadows.goldGlow]}>
              <Text style={styles.trophyIcon}>🏆</Text>
              <Text style={styles.winnerTitle}>{winner.toUpperCase()}</Text>
              <Text style={styles.victoryReason}>{reason}</Text>
              <View style={styles.matchTypePill}>
                <Text style={styles.matchTypeText}>{presetName}</Text>
              </View>
            </View>

            {/* Primary KPIs Grid */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, Elevations.low]}>
                <Text style={styles.kpiLabel}>TOTAL DURATION</Text>
                <Text style={styles.kpiValue}>{formatSecs(duration)}</Text>
              </View>
              <View style={[styles.kpiCard, Elevations.low]}>
                <Text style={styles.kpiLabel}>TOTAL MOVES</Text>
                <Text style={styles.kpiValue}>{totalMoves}</Text>
              </View>
            </View>

            {/* Player Comparison Card */}
            <View style={[styles.sectionCard, Elevations.low]}>
              <Text style={styles.sectionTitle}>PLAYER PERFORMANCE</Text>

              <View style={styles.statRow}>
                <View style={styles.playerTag}>
                  <View style={[styles.colorDot, { backgroundColor: '#FFFFFF' }]} />
                  <Text style={styles.playerName}>White (Player 2)</Text>
                </View>
                <Text style={styles.statDetail}>
                  {p2Moves} moves • Avg {avgMoveSecWhite}s / move
                </Text>
              </View>

              <View style={[styles.statRow, { marginTop: 12 }]}>
                <View style={styles.playerTag}>
                  <View style={[styles.colorDot, { backgroundColor: '#6E6E7E' }]} />
                  <Text style={styles.playerName}>Black (Player 1)</Text>
                </View>
                <Text style={styles.statDetail}>
                  {p1Moves} moves • Avg {avgMoveSecBlack}s / move
                </Text>
              </View>
            </View>

            {/* Visual Time Usage Curve Graph */}
            <View style={[styles.sectionCard, Elevations.low]}>
              <Text style={styles.sectionTitle}>TIME TRAJECTORY GRAPH</Text>
              <View style={styles.chartContainer}>
                {[75, 68, 62, 54, 48, 41, 35, 28, 22, 14, 8, 2].map((height, i) => (
                  <View key={i} style={styles.barColumn}>
                    <View style={[styles.barWhite, { height: `${height}%` }]} />
                    <View
                      style={[
                        styles.barBlack,
                        { height: `${Math.max(2, height - (i > 8 ? 10 : 2))}%` },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendIndicator,
                      { backgroundColor: Colors.gold.light },
                    ]}
                  />
                  <Text style={styles.legendText}>White Remaining</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendIndicator, { backgroundColor: '#6E6E7E' }]} />
                  <Text style={styles.legendText}>Black Remaining</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                ⏱ Result permanently saved to match history storage.
              </Text>
            </View>
          </>
        ) : (
          /* SAVED MATCH HISTORY VIEW */
          <View style={styles.historyContainer}>
            <View style={styles.historyHeaderRow}>
              <Text style={styles.historySectionTitle}>PAST GAMES ARCHIVE</Text>
              {historyList.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClearHistory}
                >
                  <Text style={styles.clearBtnText}>CLEAR ALL</Text>
                </TouchableOpacity>
              )}
            </View>

            {historyList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>♟</Text>
                <Text style={styles.emptyTitle}>NO MATCH HISTORY YET</Text>
                <Text style={styles.emptySubtitle}>
                  Completed matches will appear here automatically with duration, moves, and outcome metrics.
                </Text>
              </View>
            ) : (
              historyList.map((item) => (
                <View key={item.id} style={[styles.historyCard, Elevations.low]}>
                  <View style={styles.historyCardTop}>
                    <Text style={styles.historyWinner}>{item.winner}</Text>
                    <Text style={styles.historyDate}>
                      {item.formattedDate || item.date?.slice(0, 10)}
                    </Text>
                  </View>
                  <Text style={styles.historyReason}>{item.reason}</Text>
                  <View style={styles.historyMetaRow}>
                    <View style={styles.historyPill}>
                      <Text style={styles.historyPillText}>{item.presetName}</Text>
                    </View>
                    <Text style={styles.historyStats}>
                      {item.totalMoves} moves • {formatSecs(item.duration)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.rematchBtn, Elevations.high, Shadows.goldGlow]}
          onPress={handleRematch}
        >
          <Text style={styles.rematchText}>↺ REMATCH</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.newGameBtn, Elevations.low]}
          onPress={handleNewGame}
        >
          <Text style={styles.newGameText}>NEW TIME CONTROL</Text>
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
    color: Colors.text.muted,
    fontSize: 13,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  tabBtnText: {
    fontSize: 11,
    fontFamily: Typography.caption.fontFamily,
    color: Colors.text.muted,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: Colors.gold.light,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  victoryCard: {
    backgroundColor: Colors.background.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
    marginBottom: 16,
  },
  trophyIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  winnerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.gold.light,
    fontFamily: Typography.titleLarge.fontFamily,
    marginBottom: 4,
  },
  victoryReason: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontFamily: Typography.body.fontFamily,
    marginBottom: 12,
  },
  matchTypePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold.primary,
  },
  matchTypeText: {
    fontSize: 11,
    color: Colors.gold.light,
    fontWeight: '700',
    fontFamily: Typography.caption.fontFamily,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    letterSpacing: 1,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  sectionCard: {
    backgroundColor: Colors.background.surface,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  playerName: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
    fontFamily: Typography.body.fontFamily,
  },
  statDetail: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
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
  barColumn: {
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
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  infoBanner: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  infoText: {
    fontSize: 12,
    color: Colors.gold.light,
    textAlign: 'center',
    fontFamily: Typography.caption.fontFamily,
  },
  historyContainer: {
    gap: 12,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historySectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    borderWidth: 1,
    borderColor: Colors.status.danger,
  },
  clearBtnText: {
    fontSize: 10,
    color: Colors.status.danger,
    fontWeight: '700',
    fontFamily: Typography.caption.fontFamily,
  },
  emptyCard: {
    padding: 36,
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  emptyIcon: {
    fontSize: 36,
    color: Colors.gold.primary,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Typography.body.fontFamily,
  },
  historyCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  historyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyWinner: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gold.light,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  historyReason: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: Typography.body.fontFamily,
    marginBottom: 8,
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.background.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  historyPillText: {
    fontSize: 11,
    color: Colors.gold.champagne,
    fontFamily: Typography.caption.fontFamily,
  },
  historyStats: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.secondary,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  rematchBtn: {
    flex: 1,
    backgroundColor: Colors.gold.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rematchText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.background.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
  newGameBtn: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGameText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.gold.light,
    fontFamily: Typography.caption.fontFamily,
  },
});

export default MatchAnalytics;
