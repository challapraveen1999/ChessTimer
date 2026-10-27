import { NativeModules, Platform, Vibration } from 'react-native';

const { ToneGenerator, Beep } = NativeModules;

const triggerNativeTone = (toneType, durationMs) => {
  console.log(`[AudioService] triggerNativeTone called: type=${toneType}, duration=${durationMs}ms`);
  try {
    if (Beep && Beep.play) {
      console.log('[AudioService] Invoking Beep.play native module');
      Beep.play(toneType, durationMs);
    } else if (ToneGenerator && ToneGenerator.playTone) {
      console.log('[AudioService] Invoking ToneGenerator.playTone native module');
      ToneGenerator.playTone(toneType, durationMs);
    } else {
      console.log('[AudioService] Native tone generator not available on this platform/simulator, fallback active');
    }
  } catch (error) {
    console.warn('[AudioService] Error triggering native tone:', error);
  }
};

class AudioService {
  constructor() {
    this.soundEnabled = true;
    this.vibrationEnabled = true;
    this.soundProfile = 'digital'; // 'digital' | 'mechanical' | 'pulse' | 'alarm'
    this.volume = 1.0;
    console.log('[AudioService] Initialized with soundEnabled=true, profile=digital');
  }

  setSoundEnabled(enabled) {
    console.log(`[AudioService] setSoundEnabled: ${enabled}`);
    this.soundEnabled = enabled;
  }

  setVibrationEnabled(enabled) {
    console.log(`[AudioService] setVibrationEnabled: ${enabled}`);
    this.vibrationEnabled = enabled;
  }

  setSoundProfile(profile) {
    console.log(`[AudioService] setSoundProfile: ${profile}`);
    this.soundProfile = profile;
  }

  // Play standard move turn change beep
  playMoveSound() {
    console.log(`[AudioService] playMoveSound() called (soundEnabled=${this.soundEnabled}, profile=${this.soundProfile})`);
    if (!this.soundEnabled) return;

    if (this.vibrationEnabled) {
      Vibration.vibrate(20);
    }

    const toneMap = {
      digital: 'click',
      mechanical: 'click',
      pulse: 'pulse',
      alarm: 'click',
    };
    triggerNativeTone(toneMap[this.soundProfile] || 'click', 60);
  }

  // Play 10-second warning sound
  playWarningSound() {
    console.log('[AudioService] playWarningSound() triggered - 10 Second Danger Warning Alert!');
    if (!this.soundEnabled) return;

    if (this.vibrationEnabled) {
      Vibration.vibrate([0, 60, 40, 60]);
    }

    triggerNativeTone('warning', 150);
  }

  // Play countdown tick (5, 4, 3, 2, 1)
  playCountdownSound(sec) {
    console.log(`[AudioService] playCountdownSound() tick at ${sec} seconds remaining!`);
    if (!this.soundEnabled) return;

    if (this.vibrationEnabled) {
      Vibration.vibrate(40);
    }

    triggerNativeTone('critical', 120);
  }

  // Play game over / time-out alarm
  playGameOverSound() {
    console.log('[AudioService] playGameOverSound() triggered - Flag Fall / Match Over Buzzer!');
    if (!this.soundEnabled) return;

    if (this.vibrationEnabled) {
      Vibration.vibrate([0, 150, 80, 150, 80, 300]);
    }

    triggerNativeTone('alarm', 600);
  }

  // Test beep preview
  playTestBeep(profile = this.soundProfile) {
    console.log(`[AudioService] playTestBeep() previewing profile: ${profile}`);
    const toneMap = {
      digital: 'click',
      mechanical: 'pulse',
      pulse: 'pulse',
      alarm: 'alarm',
    };
    triggerNativeTone(toneMap[profile] || 'click', 120);
    if (this.vibrationEnabled) {
      Vibration.vibrate(30);
    }
  }
}

export default new AudioService();
