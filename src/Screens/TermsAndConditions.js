import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Elevations } from '../Helpers/theme';
import AudioService from '../Helpers/audioService';

const TermsAndConditions = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>TERMS & CONDITIONS</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.lastUpdated}>Effective Date: November 2026</Text>
          <Text style={styles.paragraph}>
            Please read these <Text style={styles.highlight}>Terms and Conditions</Text> carefully before
            using the <Text style={styles.highlight}>Royal Chess Clock</Text> mobile application. By
            downloading, accessing, or using the app, you agree to be legally bound by these terms.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>1. ACCEPTANCE OF TERMS</Text>
          <Text style={styles.paragraph}>
            By accessing or using Royal Chess Clock, you confirm that you are at least the age of majority in
            your jurisdiction or possess parental or guardian consent to use the service. If you do not agree
            with any part of these terms, you must not use or download this application.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>2. LICENSE & INTENDED USE</Text>
          <Text style={styles.paragraph}>
            We grant you a non-exclusive, non-transferable, revocable license to use Royal Chess Clock for
            personal, recreational, and tournament chess timekeeping purposes.
          </Text>
          <Text style={styles.paragraph}>You agree not to:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • Decompile, reverse engineer, or disassemble the binary code of the application.
            </Text>
            <Text style={styles.bulletItem}>
              • Use the app for any unlawful purpose or in violation of any applicable local, state, or
              international law.
            </Text>
            <Text style={styles.bulletItem}>
              • Interfere with, tamper with, or circumvent ad delivery mechanisms or app analytics.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>3. ADVERTISEMENTS & THIRD-PARTY SERVICES</Text>
          <Text style={styles.paragraph}>
            The app displays advertisements provided by Google Mobile Ads (AdMob), including banner ads. We do not endorse, guarantee, or assume
            responsibility for any third-party products, services, or websites linked within ads.
          </Text>
          <Text style={styles.paragraph}>
            Any interactions with advertisers found through the app are solely between you and the respective
            advertiser.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>4. INTELLECTUAL PROPERTY RIGHTS</Text>
          <Text style={styles.paragraph}>
            All trademarks, logos, audio compositions (custom mechanical clock clicks, digital beeps, buzzers),
            visual layouts, graphic assets, and horology aesthetic designs are the exclusive intellectual property
            of Royal Chess Clock and its creators. You may not copy, reproduce, or distribute these assets without
            prior written consent.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>5. DISCLAIMER OF WARRANTIES</Text>
          <Text style={styles.paragraph}>
            The application is provided on an <Text style={styles.bold}>"AS IS"</Text> and{' '}
            <Text style={styles.bold}>"AS AVAILABLE"</Text> basis without warranties of any kind, whether express
            or implied.
          </Text>
          <Text style={styles.paragraph}>
            While we strive for millisecond-grade precision in chess timing, we do not guarantee that the app
            will be error-free, uninterrupted, or fully compatible with every mobile hardware configuration or
            battery optimization profile.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>6. LIMITATION OF LIABILITY</Text>
          <Text style={styles.paragraph}>
            To the fullest extent permitted by applicable law, the creators and developers of Royal Chess Clock
            shall not be held liable for any direct, indirect, incidental, special, or consequential damages
            arising from tournament match disputes, time-out penalties, device battery depletion, or phone sleep
            interruptions.
          </Text>
        </View>

        {/* Section 7 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>7. MODIFICATIONS TO TERMS</Text>
          <Text style={styles.paragraph}>
            We reserve the right to amend or replace these Terms and Conditions at any time. Continued use of the
            application after changes take effect constitutes your binding acceptance of the updated terms.
          </Text>
        </View>

        {/* Section 8 */}
        <View style={[styles.card, Elevations.low]}>
          <Text style={styles.sectionTitle}>8. GOVERNING LAW & INQUIRIES</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed and construed in accordance with standard international software
            regulations. If you have any inquiries regarding these terms, contact us at:
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
    fontSize: 15,
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
  emailText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gold.light,
    fontFamily: Typography.body.fontFamily,
    marginTop: 4,
  },
});

export default TermsAndConditions;
