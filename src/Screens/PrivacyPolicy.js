import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { Colors, Typography, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';

const PrivacyPolicy = ({ navigation }) => {
  const handleOpenGooglePrivacy = () => {
    Linking.openURL('https://policies.google.com/technologies/partner-sites').catch((err) =>
      console.warn('Failed to open URL', err)
    );
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
        <Text style={styles.headerTitle}>PRIVACY POLICY</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.lastUpdated}>Effective Date: November 2026</Text>
          <Text style={styles.paragraph}>
            Welcome to <Text style={styles.highlight}>Royal Chess Clock</Text>. We respect your privacy
            and are committed to protecting any information associated with your use of our chess clock
            and timer application. This Privacy Policy details how data is handled, stored, and utilized,
            including our integration of third-party advertising partners like Google AdMob.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>1. ZERO DATA COLLECTION (100% LOCAL & OFFLINE-FIRST)</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We do NOT collect, transmit, sell, or store any personal data on external servers.</Text>{' '}
            Royal Chess Clock operates as a private, offline-first application. We do not require accounts, logins,
            email addresses, phone numbers, contacts, or location access.
          </Text>
          <Text style={styles.paragraph}>
            The following information is created during your use and is stored <Text style={styles.bold}>strictly on your local device</Text> (via AsyncStorage) and never leaves your phone:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>Player Profiles & Names:</Text> Your chosen display names, avatar icons,
              ELO ratings, and preferred board side.
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>Match History & Analytics:</Text> Timestamps, move counts, winner
              records, clock presets, and move think times.
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>Preferences & Audio Settings:</Text> Sound profile selection, tactile
              haptic switches, 10s warnings, and millisecond display options.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>2. GOOGLE MOBILE ADS (ADMOB) & THIRD PARTIES</Text>
          <Text style={styles.paragraph}>
            To keep Royal Chess Clock free and accessible to chess players worldwide, we integrate
            <Text style={styles.highlight}> Google Mobile Ads (AdMob)</Text> to serve advertisements (such
            as banner ads).
          </Text>
          <Text style={styles.paragraph}>
            Google AdMob and its advertising partners may collect and process certain device identifiers and
            telemetry:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>Advertising ID:</Text> Google Advertising ID (GAID on Android) or
              IDFA (on iOS) used for ad attribution and frequency capping.
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>Device & Network Information:</Text> Device model, operating system
              version, screen size, IP address, and general network connection state.
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>Ad Performance Metrics:</Text> Impressions, ad clicks, views, and
              interaction telemetry to prevent invalid ad traffic and fraud.
            </Text>
          </View>

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenGooglePrivacy}>
            <Text style={styles.linkButtonText}>
              Learn how Google uses data from apps ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 3 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>3. DATA RETENTION & COMPLETE DATA DELETION</Text>
          <Text style={styles.paragraph}>
            Because 100% of game data is stored exclusively on your device, <Text style={styles.bold}>we retain zero copies of your personal data on any server.</Text>
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>Instant Data Deletion:</Text> You can permanently erase all player
              profiles, match history, and preferences at any time by going to your Android device settings
              (Settings › Apps › Royal Chess Clock › Storage & Cache › Clear Storage/Data), or by simply uninstalling
              the application.
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>Ad Personalization Controls:</Text> You can opt out of personalized ads
              or reset your Google Advertising ID on your Android device at any time (Settings › Google › Ads ›
              Reset or Delete Advertising ID).
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>4. CHILDREN'S PRIVACY (COPPA)</Text>
          <Text style={styles.paragraph}>
            Our application is designed for general audiences and chess enthusiasts of all ages. We do not
            knowingly collect personally identifiable information from children under the age of 13. If you
            believe that personal information has been inadvertently collected, please contact us immediately.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>5. SECURITY</Text>
          <Text style={styles.paragraph}>
            We value your trust. All match statistics and custom configurations are stored locally on your
            device. No sensitive personal information is stored or transmitted.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>6. CHANGES TO THIS PRIVACY POLICY</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy periodically to reflect new app features, regulatory standards, or
            ad network updates. Any revisions will be reflected on this page with an updated effective date.
          </Text>
        </View>

        {/* Section 7 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>7. CONTACT US</Text>
          <Text style={styles.paragraph}>
            If you have questions, feedback, or concerns regarding this Privacy Policy or our data practices,
            please reach out to us at:
          </Text>
          <Text style={styles.emailText}>praveen98852@gmail.com</Text>
        </View>
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
    color: Colors.gold.primary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.caption.fontFamily,
  },
  headerTitle: {
    fontSize: 16,
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
  card: {
    backgroundColor: Colors.background.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borders.subtle,
  },
  lastUpdated: {
    fontSize: 11,
    color: Colors.gold.light,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: Typography.caption.fontFamily,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.gold.primary,
    fontFamily: Typography.titleMedium.fontFamily,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.secondary,
    fontFamily: Typography.body.fontFamily,
    marginBottom: 10,
  },
  highlight: {
    color: Colors.gold.light,
    fontWeight: '700',
  },
  bold: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
  bulletList: {
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 12.5,
    lineHeight: 19,
    color: Colors.text.secondary,
    fontFamily: Typography.body.fontFamily,
  },
  linkButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gold.primary,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gold.light,
    fontFamily: Typography.caption.fontFamily,
  },
  emailText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gold.light,
    fontFamily: Typography.body.fontFamily,
    marginTop: 4,
  },
});

export default PrivacyPolicy;
