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

  const validateAge = (day, month, year) => {
    const birthYear = parseInt(year);
    const birthMonth = parseInt(month);
    const birthDay = parseInt(day);
    
    // Check if year is within allowed range
    if (birthYear < 1970 || birthYear > 2007) {
      return false;
    }
    
    // Check if it's a valid date
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    if (birthDate.getFullYear() !== birthYear || 
        birthDate.getMonth() !== birthMonth - 1 || 
        birthDate.getDate() !== birthDay) {
      return false;
    }
    
    return true;
  };

  const handleDayChange = (text) => {
    const numericText = text.replace(/\D/g, '');
    
    // Validate day range (1-31)
    if (numericText && (parseInt(numericText) > 31 || parseInt(numericText) < 1)) {
      return;
    }
    
    setDay(numericText);
    
    // Auto-navigate to month when day is complete
    if (numericText.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (text) => {
    const numericText = text.replace(/\D/g, '');
    
    // Validate month range (1-12)
    if (numericText && (parseInt(numericText) > 12 || parseInt(numericText) < 1)) {
      return;
    }
    
    setMonth(numericText);
    
    // Auto-navigate to year when month is complete
    if (numericText.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (text) => {
    const numericText = text.replace(/\D/g, '');
    
    // Validate year as user types
    if (numericText.length === 4) {
      const yearValue = parseInt(numericText);
      if (yearValue < 1970 || yearValue > 2007) {
        return; // Don't update state with invalid year
      }
    }
    
    setYear(numericText);
  };

  const handleNext = () => {
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      if (!validateAge(day, month, year)) {
        Alert.alert('Invalid Date', 'Please enter a valid date.');
        return;
      }
      
      const dateOfBirth = `${day}/${month}/${year}`;
      saveRegistrationProgress('Birth', { dateOfBirth });
      navigation.navigate('Gender');
    } else {
      Alert.alert('Invalid Date', 'Please enter a valid date.');
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
              onChangeText={handleDayChange}
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
              onChangeText={handleMonthChange}
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
              onChangeText={handleYearChange}
              value={year}
              returnKeyType="done"
              onSubmitEditing={handleNext}
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Boldonse-Regular',
    color: '#666666',
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