console.log('🏷️ [ENV] BASE_URL =', BASE_URL);
console.log('🏷️ [ENV] API_BASE_URL =', API_BASE_URL);
import { BASE_URL } from '@env';
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../AuthContext';
import { getRegistrationProgress } from '../registrationUtils';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = BASE_URL;
console.log('🏷️ [ENV] BASE_URL =', BASE_URL);
console.log('🏷️ [ENV] API_BASE_URL =', API_BASE_URL);


const PreFinalScreen = () => {
  const navigation = useNavigation();
  const { token, setToken } = useContext(AuthContext);
  const [userData, setUserData] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    getAllUserData();
    // Log token for debugging
    console.log('Current token in PreFinalScreen:', token);
  }, []);

  const getAllUserData = async () => {
    try {
      const nameData = (await getRegistrationProgress('Name')) || {};
      const birthData = (await getRegistrationProgress('Birth')) || {};
      const locationData = (await getRegistrationProgress('Location')) || {};
      const genderData = (await getRegistrationProgress('Gender')) || {};
      const datingData = (await getRegistrationProgress('Dating')) || {};
      const typeData = (await getRegistrationProgress('Type')) || {};
      const photosData = (await getRegistrationProgress('Photos')) || {};
      const profilePhotosData = (await getRegistrationProgress('ProfilePhotos')) || {};
      const introData = (await getRegistrationProgress('Introduction')) || {};

      const combinedData = {
        ...nameData,
        ...birthData,
        ...locationData,
        ...genderData,
        ...datingData,
        ...typeData,
        photos: photosData.imageUrls || [],
        profilePhotos: profilePhotosData.imageUrls || [],
        introduction: introData.introduction || '',
      };

      setUserData(combinedData);
      console.log('Combined user data:', combinedData);
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };

  const clearAllScreenData = async () => {
    try {
      const keys = [
        'Name',
        'Birth',
        'Location',
        'Gender',
        'Dating',
        'Type',
        'Photos',
        'ProfilePhotos',
        'Introduction',
      ];
      for (const key of keys) {
        await AsyncStorage.removeItem(`registration_progress_${key}`);
      }
      console.log('All screen data cleared successfully');
    } catch (error) {
      console.error('Error clearing screen data:', error);
    }
  };

  const registerUser = async () => {
    // Prevent multiple registrations
    if (isRegistering) {
      return;
    }
    
    setIsRegistering(true);

    // Basic validation
    if (!userData.fullName || userData.fullName.trim() === '') {
      Alert.alert('Error', 'Please enter your name.');
      setIsRegistering(false);
      return;
    }
    if (!userData.email || userData.email.trim() === '') {
      Alert.alert('Error', 'Please enter your email.');
      setIsRegistering(false);
      return;
    }
    if (!userData.dateOfBirth || userData.dateOfBirth.trim() === '') {
      Alert.alert('Error', 'Please enter your date of birth.');
      setIsRegistering(false);
      return;
    }
    if (!userData.gender || userData.gender.trim() === '') {
      Alert.alert('Error', 'Please select your gender.');
      setIsRegistering(false);
      return;
    }
    if (!userData.type || userData.type.trim() === '') {
      Alert.alert('Error', 'Please select your relationship type.');
      setIsRegistering(false);
      return;
    }

    const formattedUserData = {
      fullName: userData.fullName,
      email: userData.email,
      dateOfBirth: userData.dateOfBirth,
      location: userData.location || '',
      gender: userData.gender,
      datingPreferences: userData.interestedIn || [],
      type: userData.type,
      photos: userData.photos || [],
      profilePhotos: userData.profilePhotos || [],
      introduction: userData.introduction || '',
    };

    try {
      console.log('Sending user data:', formattedUserData);
      const response = await axios.post(`${API_BASE_URL}/register`, formattedUserData, {
        timeout: 30000,
      });

      console.log('Registration successful:', response.data);

      // If registration is successful and token is received
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        console.log('Token stored in PreFinalScreen:', response.data.token);
        await clearAllScreenData();
        setToken(response.data.token); // This will trigger navigation to Main stack
      } else {
        console.warn('No token received from registration');
        // If no token but user was created, you might still want to navigate
        const tempToken = `user_${response.data.user.id}`;
        await AsyncStorage.setItem('userToken', tempToken);
        console.log('Generated temp token in PreFinalScreen:', tempToken);
        await clearAllScreenData();
        setToken(tempToken);
      }
      
    } catch (error) {
      console.error('Error registering user:', error);
      setIsRegistering(false);
      if (error.response) {
        Alert.alert('Registration Failed', error.response.data.error || 'Server error occurred');
      } else if (error.request) {
        Alert.alert('Network Error', 'No response received from server. Please check your connection.');
      } else {
        Alert.alert('Request Error', error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <Image style={styles.image} source={require('../assets/Open_Doodles_-_Unboxing.png')} />
          <Text style={styles.heading}>Account Created!</Text>
          <Text style={styles.subHeading}>Click the button to start matching</Text>
        </View>
        <TouchableOpacity 
          onPress={registerUser} 
          style={styles.nextButton} 
          activeOpacity={0.8}
          disabled={isRegistering}
        >
          <View style={styles.nextButtonContent}>
            <Text style={styles.nextButtonText}>
              {isRegistering ? 'REGISTERING...' : 'NEXT'}
            </Text>
            <MaterialIcons name="send" size={24} color="#fff" style={styles.sendIcon} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PreFinalScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 90,
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 90,
  },
  image: {
    width: 240,
    height: 240,
    marginBottom: 0,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 26,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Boldonse-Regular',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#01070E',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  nextButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 0,
    paddingHorizontal: 16,
    marginTop: 0,
    width: 345,
    height: 40,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: { 
    fontSize: 18, 
    color: '#fff', 
    fontFamily: 'RollingNoOne-ExtraBold', 
    textAlign: 'center',
    marginRight: 5,
  },
  sendIcon: {},
});