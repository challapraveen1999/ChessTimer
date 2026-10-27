import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { Colors, Typography, Shadows } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';

const { width } = Dimensions.get('window');

const formatTime = (totalMs, showMilliseconds) => {
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

  if (showMilliseconds && totalSecs < 10) {
    return `${pad(minutes)}:${pad(seconds)}.${tenths}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
};

const ActiveTimer = ({
  initialTimeSec = 300, // 5 min default
  incrementSec = 0,
  incrementType = 'fischer', // 'fischer' | 'bronstein' | 'delay'
  onOpenTimeControls,
  onOpenSettings,
  onMatchEnd,
}) => {
  const [p1Time, setP1Time] = useState(initialTimeSec * 1000);
  const [p2Time, setP2Time] = useState(initialTimeSec * 1000);
  const [activePlayer, setActivePlayer] = useState(null); // 'p1' | 'p2' | null (idle)
  const [isPaused, setIsPaused] = useState(true);
  const [p1Moves, setP1Moves] = useState(0);
  const [p2Moves, setP2Moves] = useState(0);
  const [isFlipped, setIsFlipped] = useState(true); // Player 1 rotated 180 for face to face
  const [isMuted, setIsMuted] = useState(!AudioService.soundEnabled);
  const [matchStartTime, setMatchStartTime] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);

  const lastTickRef = useRef(Date.now());
  const timerIntervalRef = useRef(null);
  const lastAlertSecRef = useRef({ p1: null, p2: null });

  // Glow animations
  const p1GlowAnim = useRef(new Animated.Value(0)).current;
  const p2GlowAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for active player
  useEffect(() => {
    if (activePlayer === 'p1') {
      Animated.timing(p1GlowAnim, { toValue: 1, duration: 250, useNativeDriver: false }).start();
      Animated.timing(p2GlowAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    } else if (activePlayer === 'p2') {
      Animated.timing(p2GlowAnim, { toValue: 1, duration: 250, useNativeDriver: false }).start();
      Animated.timing(p1GlowAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    } else {
      Animated.timing(p1GlowAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
      Animated.timing(p2GlowAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    }
  }, [activePlayer, p1GlowAnim, p2GlowAnim]);

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
  }, [activePlayer, isPaused]);

  // Beep warnings at 10s and 5, 4, 3, 2, 1
  const checkWarnings = (player, timeRemainingMs) => {
    const secs = Math.ceil(timeRemainingMs / 1000);
    if (secs > 10 || secs <= 0) return;

    if (lastAlertSecRef.current[player] !== secs) {
      lastAlertSecRef.current[player] = secs;
      if (secs === 10) {
        AudioService.playWarningSound();
      } else if (secs <= 5) {
        AudioService.playCountdownSound(secs);
      }
    }
  };

  const handleFlagFall = (loser) => {
    setIsPaused(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    AudioService.playGameOverSound();

    const winner = loser === 'p1' ? 'Player 2 (White)' : 'Player 1 (Black)';
    setTimeout(() => {
      onMatchEnd({
        winner,
        loser: loser === 'p1' ? 'Player 1' : 'Player 2',
        reason: 'Time Forfeit (Flag Fall)',
        totalMoves: p1Moves + p2Moves,
        p1Moves,
        p2Moves,
        p1Remaining: p1Time,
        p2Remaining: p2Time,
        duration: matchStartTime ? Math.round((Date.now() - matchStartTime) / 1000) : 0,
        history: moveHistory,
      });
    }, 500);
  };

  // Switch turn logic
  const handlePlayerTap = (player) => {
    // If not started yet, first tap starts the other player's clock
    if (!activePlayer) {
      if (!matchStartTime) setMatchStartTime(Date.now());
      setIsPaused(false);
      AudioService.playMoveSound();
      if (player === 'p1') {
        // P1 tapped -> P2's turn
        setActivePlayer('p2');
        setP1Moves((m) => m + 1);
      } else {
        // P2 tapped -> P1's turn
        setActivePlayer('p1');
        setP2Moves((m) => m + 1);
      }
      return;
    }

    if (isPaused) {
      setIsPaused(false);
      AudioService.playMoveSound();
      return;
    }

    // Only allow tapping when it's your turn
    if (player === activePlayer) {
      AudioService.playMoveSound();

      // Apply increment
      const bonusMs = incrementSec * 1000;
      if (player === 'p1') {
        if (bonusMs > 0 && incrementType === 'fischer') {
          setP1Time((t) => t + bonusMs);
        }
        setP1Moves((m) => m + 1);
        setActivePlayer('p2');
      } else {
        if (bonusMs > 0 && incrementType === 'fischer') {
          setP2Time((t) => t + bonusMs);
        }
        setP2Moves((m) => m + 1);
        setActivePlayer('p1');
      }

      // Record move history
      setMoveHistory((prev) => [
        ...prev,
        {
          moveNumber: Math.floor((p1Moves + p2Moves) / 2) + 1,
          player,
          timeSpent: 0,
          p1Remaining: p1Time,
          p2Remaining: p2Time,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleTogglePause = () => {
    AudioService.playMoveSound();
    setIsPaused((p) => !p);
  };

  const handleResetMatch = () => {
    Alert.alert('Reset Match', 'Are you sure you want to restart the clocks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
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
    setIsMuted(nextMute);
    AudioService.setSoundEnabled(!nextMute);
  };

  const p1LowTime = p1Time < 10000;
  const p2LowTime = p2Time < 10000;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* PLAYER 1 (TOP CLOCK) */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={[
          styles.playerClockHalf,
          activePlayer === 'p1' && styles.playerClockActive,
          p1LowTime && activePlayer === 'p1' && styles.playerClockDanger,
          isFlipped && styles.rotate180,
        ]}
        onPress={() => handlePlayerTap('p1')}
      >
        <View style={styles.playerMetaRow}>
          <View style={styles.playerBadge}>
            <Text style={styles.playerRoleText}>BLACK • PLAYER 1</Text>
          </View>
          <View style={styles.movesBadge}>
            <Text style={styles.movesText}>MOVES: {p1Moves}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.timerDigits,
            activePlayer === 'p1' && styles.timerDigitsActive,
            p1LowTime && styles.timerDigitsDanger,
          ]}
        >
          {formatTime(p1Time, true)}
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

        {incrementSec > 0 && (
          <Text style={styles.incrementTag}>+{incrementSec}s Fischer Bonus</Text>
        )}
      </TouchableOpacity>

      {/* LUXURY CENTER CONTROL BAR */}
      <View style={styles.centerControlBar}>
        {/* Presets Button */}
        <TouchableOpacity
          style={styles.controlIconBtn}
          onPress={() => {
            setIsPaused(true);
            onOpenTimeControls();
          }}
        >
          <Text style={styles.controlIconLabel}>⏱ PRESETS</Text>
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity style={styles.controlIconBtn} onPress={handleResetMatch}>
          <Text style={styles.controlIconLabel}>↺ RESET</Text>
        </TouchableOpacity>

        {/* Center Primary Play/Pause Button */}
        <TouchableOpacity
          style={[styles.primaryPlayBtn, Shadows.goldGlow]}
          onPress={handleTogglePause}
        >
          <Text style={styles.primaryPlayIcon}>{isPaused ? '▶' : '❚❚'}</Text>
        </TouchableOpacity>

        {/* Sound Toggle */}
        <TouchableOpacity style={styles.controlIconBtn} onPress={handleToggleMute}>
          <Text style={styles.controlIconLabel}>{isMuted ? '🔇 MUTED' : '🔊 SOUND'}</Text>
        </TouchableOpacity>

        {/* Flip Orientation */}
        <TouchableOpacity
          style={styles.controlIconBtn}
          onPress={() => setIsFlipped((f) => !f)}
        >
          <Text style={styles.controlIconLabel}>{isFlipped ? '⥯ FLIPPED' : '⥮ NORMAL'}</Text>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.controlIconBtn}
          onPress={() => {
            setIsPaused(true);
            onOpenSettings();
          }}
        >
          <Text style={styles.controlIconLabel}>⚙ SETTINGS</Text>
        </TouchableOpacity>
      </View>

      {/* PLAYER 2 (BOTTOM CLOCK) */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={[
          styles.playerClockHalf,
          activePlayer === 'p2' && styles.playerClockActive,
          p2LowTime && activePlayer === 'p2' && styles.playerClockDanger,
        ]}
        onPress={() => handlePlayerTap('p2')}
      >
        <View style={styles.playerMetaRow}>
          <View style={[styles.playerBadge, styles.whitePlayerBadge]}>
            <Text style={[styles.playerRoleText, styles.whitePlayerRoleText]}>
              WHITE • PLAYER 2
            </Text>
          </View>
          <View style={styles.movesBadge}>
            <Text style={styles.movesText}>MOVES: {p2Moves}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.timerDigits,
            activePlayer === 'p2' && styles.timerDigitsActive,
            p2LowTime && styles.timerDigitsDanger,
          ]}
        >
          {formatTime(p2Time, true)}
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

        {incrementSec > 0 && (
          <Text style={styles.incrementTag}>+{incrementSec}s Fischer Bonus</Text>
        )}
      </TouchableOpacity>
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
    shadowColor: Colors.gold.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  playerClockDanger: {
    backgroundColor: Colors.clockCards.lowTimeBg,
    borderColor: Colors.status.danger,
    shadowColor: Colors.status.danger,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  playerMetaRow: {
    position: 'absolute',
    top: 20,
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
  incrementTag: {
    position: 'absolute',
    bottom: 16,
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
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  controlIconLabel: {
    fontSize: 10,
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
    fontSize: 20,
    fontWeight: '900',
    color: Colors.background.primary,
  },
});

export default ActiveTimer;
