import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@chess_clock_match_history';
const SETTINGS_KEY = '@chess_clock_user_settings';
const PROFILE_KEY = '@chess_clock_user_profile';

export const saveMatchToHistory = async (matchData) => {
  console.log('[StorageHelper] Saving match to history:', matchData?.winner, matchData?.presetName);
  try {
    const existing = await getMatchHistory();
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...matchData,
    };
    const updated = [newRecord, ...existing].slice(0, 50);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    console.log('[StorageHelper] Match successfully saved! Total stored matches:', updated.length);
    return newRecord;
  } catch (error) {
    console.warn('[StorageHelper] Error saving match history:', error);
    return null;
  }
};

export const getMatchHistory = async () => {
  console.log('[StorageHelper] Fetching match history...');
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) {
      console.log('[StorageHelper] No existing history found, returning empty array.');
      return [];
    }
    const parsed = JSON.parse(raw);
    console.log(`[StorageHelper] Retrieved ${parsed.length} past matches.`);
    return parsed;
  } catch (error) {
    console.warn('[StorageHelper] Error reading match history:', error);
    return [];
  }
};

export const clearMatchHistory = async () => {
  console.log('[StorageHelper] Clearing all match history...');
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    console.log('[StorageHelper] All match history successfully cleared.');
    return true;
  } catch (error) {
    console.warn('[StorageHelper] Error clearing match history:', error);
    return false;
  }
};

export const saveUserSettings = async (settings) => {
  console.log('[StorageHelper] Updating user settings:', settings);
  try {
    const current = await getUserSettings();
    const merged = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    console.log('[StorageHelper] User settings saved:', merged);
    return merged;
  } catch (error) {
    console.warn('[StorageHelper] Error saving user settings:', error);
    return null;
  }
};

export const getUserSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        soundEnabled: true,
        vibrationEnabled: true,
        soundProfile: 'digital',
        tenSecAlert: true,
        countdownTicks: true,
        flagFallAlert: true,
        voiceCountdown: false,
        keepScreenAwake: true,
        milliMode: 'under10',
      };
    }
    const parsed = JSON.parse(raw);
    console.log('[StorageHelper] Loaded user settings:', parsed);
    return parsed;
  } catch (error) {
    console.warn('[StorageHelper] Error loading user settings:', error);
    return {
      soundEnabled: true,
      vibrationEnabled: true,
      soundProfile: 'digital',
      tenSecAlert: true,
      countdownTicks: true,
      flagFallAlert: true,
      voiceCountdown: false,
      keepScreenAwake: true,
      milliMode: 'under10',
    };
  }
};

export const getUserProfile = async () => {
  console.log('[StorageHelper] Fetching user profile...');
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) {
      const defaultProfile = {
        name: 'Grandmaster',
        title: 'Grandmaster',
        rating: '1850',
        preferredSide: 'white', // 'white' | 'black' | 'random'
        avatarId: 1,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        avgTimeSec: 0,
      };
      console.log('[StorageHelper] Returning default profile:', defaultProfile.name);
      return defaultProfile;
    }
    const parsed = JSON.parse(raw);
    console.log('[StorageHelper] Loaded profile:', parsed.name);
    return parsed;
  } catch (error) {
    console.warn('[StorageHelper] Error loading profile:', error);
    return {
      name: 'Grandmaster',
      title: 'Grandmaster',
      rating: '1850',
      preferredSide: 'white',
      avatarId: 1,
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      avgTimeSec: 0,
    };
  }
};

export const saveUserProfile = async (profileData) => {
  console.log('[StorageHelper] Saving profile data:', profileData);
  try {
    const current = await getUserProfile();
    const merged = { ...current, ...profileData };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    console.log('[StorageHelper] Profile successfully saved:', merged.name);
    return merged;
  } catch (error) {
    console.warn('[StorageHelper] Error saving profile:', error);
    return null;
  }
};

export default {
  saveMatchToHistory,
  getMatchHistory,
  clearMatchHistory,
  saveUserSettings,
  getUserSettings,
  getUserProfile,
  saveUserProfile,
};
