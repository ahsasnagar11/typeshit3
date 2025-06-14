import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';

const BirthScreen = () => {
  const navigation = useNavigation();
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [fontsLoaded] = useFonts({
    'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
    'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
    'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
    'PassionOne-Regular': require('../assets/fonts/PassionOne-Regular.ttf'),
  });

  useEffect(() => {
    getRegistrationProgress('Birth').then((data) => {
      if (data && data.dateOfBirth) {
        const [d, m, y] = data.dateOfBirth.split('/');
        setDay(d);
        setMonth(m);
        setYear(y);
      }
    });
  }, []);

  const handleNext = () => {
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const dateOfBirth = `${day}/${month}/${year}`;
      saveRegistrationProgress('Birth', { dateOfBirth });
      navigation.navigate('Gender');
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid date of birth.');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter your Date of Birth:</Text>
        <View style={styles.card}>
          <View style={styles.dateInputContainer}>
            <TextInput
              autoFocus
              style={styles.dateInput}
              placeholder="DD"
              keyboardType="numeric"
              maxLength={2}
              onChangeText={(text) => setDay(text.replace(/\D/g, ''))}
              value={day}
              returnKeyType="next"
              onSubmitEditing={() => monthRef.current?.focus()}
            />
            <Text style={styles.separator}>/</Text>
            <TextInput
              ref={monthRef}
              style={styles.dateInput}
              placeholder="MM"
              keyboardType="numeric"
              maxLength={2}
              onChangeText={(text) => setMonth(text.replace(/\D/g, ''))}
              value={month}
              returnKeyType="next"
              onSubmitEditing={() => yearRef.current?.focus()}
            />
            <Text style={styles.separator}>/</Text>
            <TextInput
              ref={yearRef}
              style={[styles.dateInput, styles.yearInput]}
              placeholder="YYYY"
              keyboardType="numeric"
              maxLength={4}
              onChangeText={(text) => setYear(text.replace(/\D/g, ''))}
              value={year}
            />
          </View>
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton} activeOpacity={0.8}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>NEXT</Text>
              <MaterialIcons name="send" size={22} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BirthScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: 25,
    fontFamily: 'Boldonse-Regular',
    color: '#000000',
    marginBottom: 20,
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
    marginBottom: 30,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    width: 60,
    borderBottomWidth: 2,
    borderColor: '#000000',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: '',
    color: '#000000',
  },
  yearInput: {
    width: 80,
  },
  separator: {
    fontSize: 22,
    color: '#000000',
    fontFamily: 'Anton-Regular',
    marginHorizontal: 10,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 10,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'RollingNoOne-ExtraBold',
  },
});
