// GenderScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GenderScreen = () => {
  const navigation = useNavigation();
  const [gender, setGender] = useState('');
  const [datingPreferences, setDatingPreferences] = useState([]);
  const [sexuality, setSexuality] = useState('');

  useEffect(() => {
    getRegistrationProgress('Gender').then(data => {
      if (data) {
        setGender(data.gender || '');
      }
    });
    getRegistrationProgress('Dating').then(data => {
      if (data) {
        setDatingPreferences(data.datingPreferences || []);
      }
    });
    getRegistrationProgress('Type').then(data => {
      if (data) {
        setSexuality(data.type || '');
      }
    });
  }, []);

  const chooseDatingOption = option => {
    if (datingPreferences.includes(option)) {
      setDatingPreferences(datingPreferences.filter(o => o !== option));
    } else {
      setDatingPreferences([...datingPreferences, option]);
    }
  };

  const handleNext = () => {
    saveRegistrationProgress('Gender', { gender });
    saveRegistrationProgress('Dating', { datingPreferences });
    saveRegistrationProgress('Type', { type: sexuality });
    navigation.navigate('Video');
  };

  // Helper to decide which FontAwesome icon to show:
  const renderCircleIcon = (isSelected) => {
    // If selected → filled circle. Otherwise outline circle.
    return (
      <FontAwesome
        name={isSelected ? 'circle' : 'circle-o'}
        size={26}
        color="#0C1F2D"
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.topSection}>
          <Text style={styles.heading}>Fill the info:</Text>
        </View>

        {/* Gender Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gender:</Text>
          <View style={styles.optionContainer}>
            {['Men', 'Women', 'Non-binary'].map(option => (
              <View key={option} style={styles.optionRow}>
                <Text style={styles.optionText}>{option}</Text>
                <Pressable onPress={() => setGender(option)}>
                  {renderCircleIcon(gender === option)}
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Dating Preference Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dating Preference:</Text>
          <View style={styles.optionContainer}>
            {['Men', 'Women', 'Everyone'].map(option => (
              <View key={option} style={styles.optionRow}>
                <Text style={styles.optionText}>{option}</Text>
                <Pressable onPress={() => chooseDatingOption(option)}>
                  {renderCircleIcon(datingPreferences.includes(option))}
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Sexuality Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Sexuality:</Text>
          <View style={styles.optionContainer}>
            {['Straight', 'Gay', 'Lesbian', 'Bisexual'].map(option => (
              <View key={option} style={styles.optionRow}>
                <Text style={styles.optionText}>{option}</Text>
                <Pressable onPress={() => setSexuality(option)}>
                  {renderCircleIcon(sexuality === option)}
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer to push content above the fixed button */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed “Next” Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
          <Ionicons name="send" size={20} color="#FFFFFF" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GenderScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  topSection: {
    justifyContent: 'center',
    marginTop: 33,
    marginLeft: 10,
  },
  heading: {
    fontSize: 25,
    fontFamily: 'Boldonse-Regular',
    marginTop: 15,
  },
  card: {
    backgroundColor: 'rgb(240,240,240)',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    borderColor: 'black',
    borderWidth: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Boldonse-Regular',
    color: '#000000',
  },
  optionContainer: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  optionText: {
    fontWeight: '500',
    fontSize: 15,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'RollingNoOne-ExtraBold',
    fontSize: 18,
    marginRight: 8,
  },
  icon: {
    marginTop: 1,
  },
});
