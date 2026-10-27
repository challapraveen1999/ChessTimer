import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  Modal,
} from 'react-native';
import { Colors, Typography, Shadows, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';
import { saveMatchToHistory, getUserSettings } from '../Helpers/storageHelper';

const { width } = Dimensions.get('window');

const formatTime = (totalMs, milliMode = 'under10') => {
  if (totalMs <= 0) return '00:00.0';

  const totalSecs = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  const tenths = Math.floor((totalMs % 1000) / 100);

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  const shouldShowMillis =
    milliMode === 'always' || (milliMode === 'under10' && totalSecs < 10);

  if (shouldShowMillis) {
    return `${pad(minutes)}:${pad(seconds)}.${tenths}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
};

const Timmer = ({ navigation, route }) => {
  const whitePlayer = route?.params?.whitePlayer || 'White';
  const blackPlayer = route?.params?.blackPlayer || 'Black';
  const initialTimeSec = route?.params?.initialTimeSec ?? 300;
  const incrementSec = route?.params?.incrementSec ?? 0;
  const incrementType = route?.params?.incrementType ?? 'fischer';
  const presetName = route?.params?.presetName ?? 'Blitz 5 min';

  console.log('[Timmer] Initializing Active Timer Match:', {
    whitePlayer,
    blackPlayer,
    initialTimeSec,
    incrementSec,
    presetName,
  });

  const [p1Time, setP1Time] = useState(initialTimeSec * 1000);
  const [p2Time, setP2Time] = useState(initialTimeSec * 1000);
  const [activePlayer, setActivePlayer] = useState(null); // 'p1' (Black) | 'p2' (White) | null
  const [isPaused, setIsPaused] = useState(true);
  const [p1Moves, setP1Moves] = useState(0);
  const [p2Moves, setP2Moves] = useState(0);
  const [isFlipped, setIsFlipped] = useState(true);
  const [isMuted, setIsMuted] = useState(!AudioService.soundEnabled);
  const [matchStartTime, setMatchStartTime] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userSettings, setUserSettings] = useState({
    milliMode: 'under10',
    tenSecAlert: true,
    countdownTicks: true,
  });

  const lastTickRef = useRef(Date.now());
  const timerIntervalRef = useRef(null);
  const lastAlertSecRef = useRef({ p1: null, p2: null });

  // Load user settings on mount
  useEffect(() => {
    console.log('[Timmer] Loading user settings from storage...');
    getUserSettings().then((settings) => {
      if (settings) {
        console.log('[Timmer] User settings applied to match:', settings);
        setUserSettings(settings);
        setIsMuted(!settings.soundEnabled);
        AudioService.setSoundEnabled(settings.soundEnabled);
        AudioService.setVibrationEnabled(settings.vibrationEnabled);
        AudioService.setSoundProfile(settings.soundProfile || 'digital');
      }
    });
  }, []);

  // Reset clock when route params change
  useEffect(() => {
    if (route?.params?.initialTimeSec) {
      console.log('[Timmer] Route params changed, resetting clocks to:', route.params.initialTimeSec);
      setP1Time(route.params.initialTimeSec * 1000);
      setP2Time(route.params.initialTimeSec * 1000);
      setIsPaused(true);
      setActivePlayer(null);
      setP1Moves(0);
      setP2Moves(0);
      setMoveHistory([]);
      setMatchStartTime(null);
      lastAlertSecRef.current = { p1: null, p2: null };
    }
  }, [route?.params?.initialTimeSec, route?.params?.incrementSec]);

  // Main high-precision countdown loop
  useEffect(() => {
    if (isPaused || !activePlayer) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    lastTickRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (activePlayer === 'p1') {
        setP1Time((prev) => {
          const next = Math.max(0, prev - delta);
          checkWarnings('p1', next);
          if (next === 0) handleFlagFall('p1');
          return next;
        });
      } else if (activePlayer === 'p2') {
        setP2Time((prev) => {
          const next = Math.max(0, prev - delta);
          checkWarnings('p2', next);
          if (next === 0) handleFlagFall('p2');
          return next;
        });
      }
    }, 50);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activePlayer, isPaused, userSettings]);

  // Check 10s danger warning and 5-4-3-2-1 countdown ticks
  const checkWarnings = (player, timeRemainingMs) => {
    const secs = Math.ceil(timeRemainingMs / 1000);
    if (secs > 10 || secs <= 0) return;

    if (lastAlertSecRef.current[player] !== secs) {
      lastAlertSecRef.current[player] = secs;
      if (secs === 10 && userSettings.tenSecAlert) {
        console.log(`[Timmer] WARNING: Player ${player} entered 10-second danger zone!`);
        AudioService.playWarningSound();
      } else if (secs <= 5 && userSettings.countdownTicks) {
        console.log(`[Timmer] COUNTDOWN: Player ${player} at ${secs}s`);
        AudioService.playCountdownSound(secs);
      }
    }
  };

  const endAndSaveMatch = async (winner, loser, reason) => {
    console.log('[Timmer] Match ended:', { winner, loser, reason });
    setIsPaused(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    AudioService.playGameOverSound();

    const matchData = {
      winner,
      loser,
      reason,
      whitePlayer,
      blackPlayer,
      presetName,
      totalMoves: p1Moves + p2Moves,
      p1Moves,
      p2Moves,
      p1Remaining: p1Time,
      p2Remaining: p2Time,
      duration: matchStartTime ? Math.round((Date.now() - matchStartTime) / 1000) : 0,
      history: moveHistory,
    };

    console.log('[Timmer] Saving match to persistent storage and navigating to GameResult...');
    await saveMatchToHistory(matchData);

    setTimeout(() => {
      if (navigation && navigation.navigate) {
        navigation.navigate('GameResult', matchData);
      }
    }, 600);
  };

  const handleFlagFall = (loser) => {
    console.log(`[Timmer] FLAG FALL! Loser: ${loser}`);
    const winner = loser === 'p1' ? `${whitePlayer} (White)` : `${blackPlayer} (Black)`;
    endAndSaveMatch(winner, loser === 'p1' ? blackPlayer : whitePlayer, 'Time Out');
  };

  // Switch turn on clock tap
  const handlePlayerTap = (player) => {
    console.log(`[Timmer] Tap registered on clock for: ${player}`);
    if (!activePlayer) {
      if (!matchStartTime) setMatchStartTime(Date.now());
      setIsPaused(false);
      AudioService.playMoveSound();
      if (player === 'p1') {
        console.log('[Timmer] P1 (Black) started the match -> White turn');
        setActivePlayer('p2');
        setP1Moves((m) => m + 1);
      } else {
        console.log('[Timmer] P2 (White) started the match -> Black turn');
        setActivePlayer('p1');
        setP2Moves((m) => m + 1);
      }
      return;
    }

    if (isPaused) {
      console.log('[Timmer] Clock tapped while paused. Resuming countdown.');
      setIsPaused(false);
      AudioService.playMoveSound();
      return;
    }

    if (player === activePlayer) {
      AudioService.playMoveSound();
      if (player === 'p1') {
        console.log(`[Timmer] Black turn ended. Move ${p1Moves + 1}`);
        setP1Moves((m) => m + 1);
        setActivePlayer('p2');
      } else {
        console.log(`[Timmer] White turn ended. Move ${p2Moves + 1}`);
        setP2Moves((m) => m + 1);
        setActivePlayer('p1');
      }

      setMoveHistory((prev) => [
        ...prev,
        {
          moveNumber: Math.floor((p1Moves + p2Moves) / 2) + 1,
          player,
          p1Remaining: p1Time,
          p2Remaining: p2Time,
          timestamp: Date.now(),
        },
      ]);
    } else {
      console.log(`[Timmer] Ignored tap on ${player} because it is currently ${activePlayer}'s turn.`);
    }
  };

  const handleTogglePause = () => {
    console.log(`[Timmer] Play/Pause toggled. New isPaused: ${!isPaused}`);
    AudioService.playMoveSound();
    setIsPaused((p) => !p);
  };

  const handleResetMatch = () => {
    console.log('[Timmer] Reset match requested by user');
    Alert.alert('Reset Match', 'Are you sure you want to restart the clocks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          console.log('[Timmer] User confirmed reset. Reinitializing clocks.');
          setIsPaused(true);
          setActivePlayer(null);
          setP1Time(initialTimeSec * 1000);
          setP2Time(initialTimeSec * 1000);
          setP1Moves(0);
          setP2Moves(0);
          setMoveHistory([]);
          setMatchStartTime(null);
          lastAlertSecRef.current = { p1: null, p2: null };
          AudioService.playMoveSound();
        },
      },
    ]);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    console.log(`[Timmer] Mute toggled: isMuted=${nextMute}`);
    setIsMuted(nextMute);
    AudioService.setSoundEnabled(!nextMute);
  };

  const handleClaimDraw = () => {
    console.log('[Timmer] Players agreed to draw');
    setMenuVisible(false);
    endAndSaveMatch('Mutual Draw', 'None', 'Agreed Draw');
  };

  const handleResign = (player) => {
    setMenuVisible(false);
    const winner = player === 'p1' ? `${whitePlayer} (White)` : `${blackPlayer} (Black)`;
    const loser = player === 'p1' ? blackPlayer : whitePlayer;
    console.log(`[Timmer] Player ${loser} resigned! Winner: ${winner}`);
    endAndSaveMatch(winner, loser, 'Resignation');
  };

  const p1LowTime = p1Time < 10000;
  const p2LowTime = p2Time < 10000;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* PLAYER 1 (TOP CLOCK - BLACK) */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={[
          styles.playerClockHalf,
          Elevations.medium,
          activePlayer === 'p1' && styles.playerClockActive,
          activePlayer === 'p1' && Elevations.glowActive,
          p1LowTime && activePlayer === 'p1' && styles.playerClockDanger,
          p1LowTime && activePlayer === 'p1' && Elevations.glowDanger,
          isFlipped && styles.rotate180,
        ]}
        onPress={() => handlePlayerTap('p1')}
      >
        <View style={styles.playerMetaRow}>
          <View style={styles.playerBadge}>
            <Text style={styles.playerRoleText}>{blackPlayer.toUpperCase()} • BLACK</Text>
          </View>
          <View style={styles.movesBadge}>
            <Text style={styles.movesText}>MOVES: {p1Moves}</Text>
          </View>
        </View>

        {p1LowTime && activePlayer === 'p1' && (
          <View style={styles.lowTimeWarningPill}>
            <Text style={styles.lowTimeWarningText}>⚠️ LOW TIME</Text>
          </View>
        )}

        <Text
          style={[
            styles.timerDigits,
            activePlayer === 'p1' && styles.timerDigitsActive,
            p1LowTime && styles.timerDigitsDanger,
          ]}
        >
          {formatTime(p1Time, userSettings.milliMode)}
        </Text>

        <Text style={styles.turnStatusText}>
          {activePlayer === 'p1'
            ? isPaused
              ? 'PAUSED'
              : 'YOUR TURN'
            : activePlayer === null
            ? 'TAP TO START'
            : 'WAITING'}
        </Text>

        <View style={styles.presetTagRow}>
          <Text style={styles.presetNameText}>{presetName}</Text>
        </View>
      </TouchableOpacity>

      {/* LUXURY CENTER CONTROL BAR */}
      <View style={[styles.centerControlBar, Elevations.medium]}>
        {/* Presets Button */}
        <TouchableOpacity
          style={styles.controlIconBtn}
          onPress={() => {
            console.log('[Timmer] Presets clicked -> NewGameSetup');
            setIsPaused(true);
            navigation.navigate('NewGameSetup');
          }}
        >
          <Text style={styles.controlIconSymbol}>⏱</Text>
          <Text style={styles.controlIconLabel}>PRESETS</Text>
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity style={styles.controlIconBtn} onPress={handleResetMatch}>
          <Text style={styles.controlIconSymbol}>↺</Text>
          <Text style={styles.controlIconLabel}>RESET</Text>
        </TouchableOpacity>

        {/* Center Primary Play/Pause Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.primaryPlayBtn, Elevations.high, Shadows.goldGlow]}
          onPress={handleTogglePause}
        >
          <Text style={styles.primaryPlayIcon}>{isPaused ? '▶' : '❚❚'}</Text>
        </TouchableOpacity>

        {/* Sound Toggle */}
        <TouchableOpacity style={styles.controlIconBtn} onPress={handleToggleMute}>
          <Text style={styles.controlIconSymbol}>{isMuted ? '🔇' : '🔊'}</Text>
          <Text style={styles.controlIconLabel}>{isMuted ? 'MUTED' : 'SOUND'}</Text>
        </TouchableOpacity>

        {/* Flip Orientation */}
        <TouchableOpacity
          style={styles.controlIconBtn}
          onPress={() => {
            console.log(`[Timmer] Flip orientation toggled: ${!isFlipped}`);
            setIsFlipped((f) => !f);
          }}
        >
          <Text style={styles.controlIconSymbol}>⥯</Text>
          <Text style={styles.controlIconLabel}>{isFlipped ? 'FLIPPED' : 'NORMAL'}</Text>
        </TouchableOpacity>

        {/* Game Menu (Resign/Draw/Settings) */}
        <TouchableOpacity
          style={styles.controlIconBtn}
          onPress={() => {
            console.log('[Timmer] Match options menu opened');
            setIsPaused(true);
            setMenuVisible(true);
          }}
        >
          <Text style={styles.controlIconSymbol}>☰</Text>
          <Text style={styles.controlIconLabel}>OPTIONS</Text>
        </TouchableOpacity>
      </View>

      {/* PLAYER 2 (BOTTOM CLOCK - WHITE) */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={[
          styles.playerClockHalf,
          Elevations.medium,
          activePlayer === 'p2' && styles.playerClockActive,
          activePlayer === 'p2' && Elevations.glowActive,
          p2LowTime && activePlayer === 'p2' && styles.playerClockDanger,
          p2LowTime && activePlayer === 'p2' && Elevations.glowDanger,
        ]}
        onPress={() => handlePlayerTap('p2')}
      >
        <View style={styles.playerMetaRow}>
          <View style={[styles.playerBadge, styles.whitePlayerBadge]}>
            <Text style={[styles.playerRoleText, styles.whitePlayerRoleText]}>
              {whitePlayer.toUpperCase()} • WHITE
            </Text>
          </View>
          <View style={styles.movesBadge}>
            <Text style={styles.movesText}>MOVES: {p2Moves}</Text>
          </View>
        </View>

        {p2LowTime && activePlayer === 'p2' && (
          <View style={styles.lowTimeWarningPill}>
            <Text style={styles.lowTimeWarningText}>⚠️ LOW TIME</Text>
          </View>
        )}

        <Text
          style={[
            styles.timerDigits,
            activePlayer === 'p2' && styles.timerDigitsActive,
            p2LowTime && styles.timerDigitsDanger,
          ]}
        >
          {formatTime(p2Time, userSettings.milliMode)}
        </Text>

        <Text style={styles.turnStatusText}>
          {activePlayer === 'p2'
            ? isPaused
              ? 'PAUSED'
              : 'YOUR TURN'
            : activePlayer === null
            ? 'TAP TO START'
            : 'WAITING'}
        </Text>

        <View style={styles.presetTagRow}>
          <Text style={styles.presetNameText}>{presetName}</Text>
        </View>
      </TouchableOpacity>

      {/* Game Match Options Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Elevations.high]}>
            <Text style={styles.modalTitle}>MATCH OPTIONS</Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                console.log('[Timmer] Opening SoundSettings from menu');
                setMenuVisible(false);
                navigation.navigate('SoundSettings');
              }}
            >
              <Text style={styles.modalBtnText}>⚙ Sound & Display Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                console.log('[Timmer] Opening MatchHistory from menu');
                setMenuVisible(false);
                navigation.navigate('MatchHistory');
              }}
            >
              <Text style={styles.modalBtnText}>📜 Full Match History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={handleClaimDraw}>
              <Text style={styles.modalBtnText}>🤝 Agree to Draw</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.resignBtn]}
              onPress={() => handleResign('p1')}
            >
              <Text style={[styles.modalBtnText, styles.resignText]}>
                🏳 {blackPlayer} (Black) Resigns
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.resignBtn]}
              onPress={() => handleResign('p2')}
            >
              <Text style={[styles.modalBtnText, styles.resignText]}>
                🏳 {whitePlayer} (White) Resigns
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => {
                console.log('[Timmer] Closing options menu, resume match');
                setMenuVisible(false);
              }}
            >
              <Text style={styles.closeModalText}>RESUME MATCH</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  rotate180: {
    transform: [{ rotate: '180deg' }],
  },
  playerClockHalf: {
    flex: 1,
    backgroundColor: Colors.clockCards.playerInactiveBg,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.clockCards.playerInactiveBorder,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  playerClockActive: {
    backgroundColor: Colors.clockCards.playerActiveBg,
    borderColor: Colors.gold.primary,
  },
  playerClockDanger: {
    backgroundColor: Colors.clockCards.lowTimeBg,
    borderColor: Colors.status.danger,
  },
  lowTimeWarningPill: {
    position: 'absolute',
    top: 60,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(230, 57, 70, 0.25)',
    borderWidth: 1,
    borderColor: Colors.status.danger,
  },
  lowTimeWarningText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.status.danger,
    letterSpacing: 1,
    fontFamily: Typography.caption.fontFamily,
  },
  playerMetaRow: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#1E1E26',
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  whitePlayerBadge: {
    backgroundColor: '#FAF5E4',
  },
  playerRoleText: {
    fontSize: 12,
    fontFamily: Typography.caption.fontFamily,
    color: Colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  whitePlayerRoleText: {
    color: '#1A1A22',
  },
  movesBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  movesText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    letterSpacing: 1,
  },
  timerDigits: {
    fontSize: 66,
    fontFamily: Typography.digitalTimer.fontFamily,
    fontWeight: '800',
    color: Colors.clockCards.playerInactiveText,
    letterSpacing: 2,
    includeFontPadding: false,
  },
  timerDigitsActive: {
    color: Colors.gold.light,
  },
  timerDigitsDanger: {
    color: Colors.status.danger,
  },
  turnStatusText: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: Typography.caption.fontFamily,
    color: Colors.text.muted,
    letterSpacing: 2,
    fontWeight: '700',
  },
  presetTagRow: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presetNameText: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: Typography.caption.fontFamily,
    letterSpacing: 0.5,
  },
  incrementTag: {
    fontSize: 11,
    color: Colors.gold.primary,
    fontFamily: Typography.caption.fontFamily,
    letterSpacing: 0.5,
  },
  centerControlBar: {
    height: 72,
    backgroundColor: Colors.background.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borders.subtle,
    zIndex: 10,
  },
  controlIconBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconSymbol: {
    fontSize: 16,
    color: Colors.gold.primary,
    marginBottom: 2,
  },
  controlIconLabel: {
    fontSize: 9,
    color: Colors.text.secondary,
    fontFamily: Typography.caption.fontFamily,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  primaryPlayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryPlayIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.background.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.background.surfaceElevated,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: Colors.gold.primary,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.gold.champagne,
    fontFamily: Typography.titleLarge.fontFamily,
    textAlign: 'center',
    marginBottom: 18,
  },
  modalBtn: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  modalBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: Typography.body.fontFamily,
    textAlign: 'center',
  },
  resignBtn: {
    borderColor: 'rgba(230, 57, 70, 0.4)',
  },
  resignText: {
    color: Colors.status.danger,
  },
  closeModalBtn: {
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: Colors.gold.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.background.primary,
    fontFamily: Typography.titleMedium.fontFamily,
  },
});

export default Timmer;
