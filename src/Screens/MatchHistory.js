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
import BottomNavBar from '../Components/BottomNavBar';

const MatchHistory = ({ navigation }) => {
  console.log('[MatchHistory] Rendering Match History screen');

  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'won' | 'loss' | 'draw'
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation?.addListener ? navigation.addListener('focus', loadHistory) : null;
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const loadHistory = async () => {
    console.log('[MatchHistory] Loading match history from AsyncStorage...');
    const list = await getMatchHistory();
    setHistoryList(list || []);
  };

  const handleClearAll = () => {
    console.log('[MatchHistory] Prompting user to clear history');
    Alert.alert(
      'Clear Match History',
      'Are you sure you want to permanently erase all match history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            console.log('[MatchHistory] User confirmed clearing match history');
            AudioService.playMoveSound();
            await clearMatchHistory();
            setHistoryList([]);
          },
        },
      ]
    );
  };

  const handleSelectMatch = (match) => {
    console.log('[MatchHistory] User clicked match card:', match.id, match.winner);
    AudioService.playMoveSound();
    navigation.navigate('MatchDetails', match);
  };

  const filteredMatches = historyList.filter((m) => {
    if (filterTab === 'all') return true;
    const isWon = m.winner?.toLowerCase().includes('white') || m.winner?.toLowerCase().includes('won');
    const isDraw = m.winner?.toLowerCase().includes('draw') || m.reason?.toLowerCase().includes('draw');

    if (filterTab === 'won') return isWon && !isDraw;
    if (filterTab === 'loss') return !isWon && !isDraw;
    if (filterTab === 'draw') return isDraw;
    return true;
  });

  console.log(`[MatchHistory] Filter "${filterTab}" active. Showing ${filteredMatches.length} / ${historyList.length} items`);

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
            console.log('[MatchHistory] Back button pressed');
            AudioService.playMoveSound();
            navigation.goBack();
          }}
        >
          <Text style={styles.backBtnText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MATCH HISTORY</Text>
        {historyList.length > 0 ? (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <Text style={styles.clearBtnText}>CLEAR</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        {['all', 'won', 'loss', 'draw'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, filterTab === tab && styles.tabBtnActive]}
            onPress={() => {
              console.log('[MatchHistory] Filter tab switched to:', tab);
              AudioService.playMoveSound();
              setFilterTab(tab);
            }}
          >
            <Text
              style={[
                styles.tabBtnText,
                filterTab === tab && styles.tabBtnTextActive,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {filteredMatches.length === 0 ? (
          <View style={[styles.emptyCard, Elevations.low]}>
            <Text style={styles.emptyIcon}>♟</Text>
            <Text style={styles.emptyTitle}>NO MATCHES FOUND</Text>
            <Text style={styles.emptySubtitle}>
              {filterTab === 'all'
                ? 'Play your first match to build your Royal Chess history archive!'
                : `No matches found matching the "${filterTab}" filter.`}
            </Text>
          </View>
        ) : (
          filteredMatches.map((m) => {
            const isWhiteWon = m.winner?.toLowerCase().includes('white');
            const isDraw = m.winner?.toLowerCase().includes('draw');

            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.85}
                style={[styles.matchCard, Elevations.low]}
                onPress={() => handleSelectMatch(m)}
              >
                {/* Card Top: Players & Result Badge */}
                <View style={styles.cardTop}>
                  <View style={styles.playersCol}>
                    <Text style={styles.playersText}>
                      {m.whitePlayer || 'White'} vs {m.blackPlayer || 'Black'}
                    </Text>
                    <Text style={styles.dateText}>
                      {m.formattedDate || m.date?.slice(0, 10)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.resultBadge,
                      isDraw
                        ? styles.drawBadge
                        : isWhiteWon
                        ? styles.wonBadge
                        : styles.lossBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.resultBadgeText,
                        isDraw
                          ? styles.drawText
                          : isWhiteWon
                          ? styles.wonText
                          : styles.lossText,
                      ]}
                    >
                      {isDraw ? 'DRAW' : isWhiteWon ? 'WON' : 'LOSS'}
                    </Text>
                  </View>
                </View>

                {/* Card Bottom: Preset & Duration */}
                <View style={styles.cardBottom}>
                  <View style={styles.presetPill}>
                    <Text style={styles.presetPillText}>
                      {m.presetName || 'Blitz 5m'}
                    </Text>
                  </View>
                  <Text style={styles.durationText}>
                    {m.totalMoves ? `${m.totalMoves} moves • ` : ''}
                    {formatSecs(m.duration || 0)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    borderWidth: 1,
    borderColor: Colors.status.danger,
  },
  clearBtnText: {
    fontSize: 10,
    color: Colors.status.danger,
    fontWeight: '800',
    fontFamily: Typography.caption.fontFamily,
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
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
    fontWeight: '700',
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  tabBtnTextActive: {
    color: Colors.gold.light,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  emptyCard: {
    padding: 36,
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
    marginTop: 30,
  },
  emptyIcon: {
    fontSize: 40,
    color: Colors.gold.primary,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
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
  matchCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  playersCol: {
    flex: 1,
  },
  playersText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    marginBottom: 3,
  },
  dateText: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  wonBadge: {
    backgroundColor: 'rgba(42, 157, 143, 0.15)',
    borderColor: Colors.status.success,
  },
  wonText: {
    color: Colors.status.success,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.caption.fontFamily,
  },
  lossBadge: {
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    borderColor: Colors.status.danger,
  },
  lossText: {
    color: Colors.status.danger,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.caption.fontFamily,
  },
  drawBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Colors.gold.primary,
  },
  drawText: {
    color: Colors.gold.light,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.caption.fontFamily,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: Colors.borders.subtle,
    paddingTop: 8,
  },
  presetPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
  },
  presetPillText: {
    fontSize: 11,
    color: Colors.gold.champagne,
    fontFamily: Typography.caption.fontFamily,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
  },
});

export default MatchHistory;
