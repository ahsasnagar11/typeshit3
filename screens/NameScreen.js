import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import { useFonts } from 'expo-font';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NameScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [fontsLoaded] = useFonts({
      'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
      'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
      'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
      'PassionOne-Regular': require('../assets/fonts/PassionOne-Regular.ttf'),
    });
  
  useEffect(() => {
    getRegistrationProgress('Name').then(progressData => {
      if (progressData) {
        setFullName(progressData.fullName || '');
        setEmail(progressData.email || '');
      }
    });
  }, []);

  const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  
  const handleNext = () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!isValidEmail(email.trim())) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    saveRegistrationProgress('Name', { fullName, email });
    navigation.navigate('Birth');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <Image
            source={require('../assets/Open_Doodles_-_Unboxing.png')}
            style={styles.image}
          />
           <Text style={styles.headerText}>Please fill up the upcoming info and attributes carefully... </Text>
        </View>

        {/* Curved Section */}
        <View style={styles.curvedContainer}>
          <Text style={styles.heading}>Create Account</Text>
          
          {/* Added separator line */}
          <View style={styles.separator} />

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="account-outline" size={22} color="#000" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#000" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={text => {
                setEmail(text);
                if (emailError && (text.trim() === '' || isValidEmail(text.trim()))) {
                  setEmailError('');
                }
              }}
            />
          </View>
          
          {/* Email Error Display */}
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* Bottom Button - Updated to match BasicInfo screen */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleNext} style={styles.button}>
              <Text style={styles.buttonText}>NEXT</Text>
              <Ionicons name="send" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NameScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#999999', // Dark background
  },
  container: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  curvedContainer: {
    flex: 1,
    backgroundColor: '#fff', // White section
    borderTopLeftRadius: 50,
    marginTop: 40,
    minHeight: 400,
    borderTopRightRadius: 50,
    paddingVertical: 30, // Shorter height
    paddingHorizontal: 20,
    alignItems: 'center',
    // Cross-platform shadow for elevation effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 24, // Higher elevation value
      },
    }),
  },
  headerText: {
    fontSize: 18,
    color: '#000000',
    fontFamily: 'Boldonse-Regular',
    textAlign: 'center',
    marginTop: -15,
    marginHorizontal: 20,
  },
  // Added separator line style
  separator: {
    height: 1,
    width: '70%',
    backgroundColor: '#E0E0E0',
    marginBottom: 25,
    marginTop: 5,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'Boldonse-Regular',
    color: '#1B1B1B',
    marginBottom: 10, // Reduced to accommodate the separator
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    width: '90%',
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5, // Added border
    borderColor: '#000', // Black border
  },
  inputError: {
    borderColor: '#FF0000', // Red border for error state
  },
  inputIcon: {
    marginRight: 8,
    color: '#000',
  },
  textInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  // Error text styling
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: -5,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },
  // Updated button styling to match BasicInfo screen
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
  buttonIcon: {
    marginTop: 1,
  },
});