import React, { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext'; // Adjust path as needed


import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    Pressable,
    TextInput,
    Modal,
    TouchableOpacity, // Import TouchableOpacity for cleaner button
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Storage, ID } from 'appwrite';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Added for circle icons
import { useFonts } from 'expo-font';
import { jwtDecode } from 'jwt-decode';
import {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_BUCKET_ID,
    APPWRITE_API_KEY,
    BASE_URL, // Use BASE_URL, not API_BASE_URL here
} from '@env';
console.log('🏷️ [ENV] BASE_URL =', BASE_URL);
const { width } = Dimensions.get('window');

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const storage = new Storage(client);
const BUCKET_ID = APPWRITE_BUCKET_ID;
const API_KEY = APPWRITE_API_KEY;
const PROJECT_ID = APPWRITE_PROJECT_ID;

// IMPORTANT: Replace with your actual backend URL
const API_BASE_URL = BASE_URL; // UPDATE THIS WITH YOUR ACTUAL URL

const ProfileScreen = () => {
    const [fontsLoaded] = useFonts({
        'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
        'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
        'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
        'PassionOne-Regular': require('../assets/fonts/PassionOne-Regular.ttf'),
    });
    const { signOut } = useContext(AuthContext);
    const navigation = useNavigation();

    // Profile Photos (3 photos)
    const [profileImageUrls, setProfileImageUrls] = useState(Array(3).fill(''));
    const [profileCurrentIndex, setProfileCurrentIndex] = useState(0);
    const profileScrollViewRef = useRef(null);

    // General Photos (10 photos)
    const [photoImageUrls, setPhotoImageUrls] = useState(Array(10).fill(''));
    const [photoCurrentIndex, setPhotoCurrentIndex] = useState(0);
    const photoScrollViewRef = useRef(null);

    // Full Name states
    const [fullName, setFullName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempFullName, setTempFullName] = useState('');
    const [updatingName, setUpdatingName] = useState(false);

    // Age and Date of Birth states
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [age, setAge] = useState(0);
    const [isEditingAge, setIsEditingAge] = useState(false);
    const [tempDateOfBirth, setTempDateOfBirth] = useState('');
    const [updatingAge, setUpdatingAge] = useState(false);

    // Gender states (NEW)
    const [gender, setGender] = useState('');
    const [isEditingGender, setIsEditingGender] = useState(false);
    const [tempGender, setTempGender] = useState('');
    const [updatingGender, setUpdatingGender] = useState(false);

    // Dating Preferences states (NEW)
    const [datingPreferences, setDatingPreferences] = useState([]);
    const [isEditingDatingPreferences, setIsEditingDatingPreferences] = useState(false);
    const [tempDatingPreferences, setTempDatingPreferences] = useState([]);
    const [updatingDatingPreferences, setUpdatingDatingPreferences] = useState(false);

    // Sexuality (Type) states (NEW)
    const [sexuality, setSexuality] = useState('');
    const [isEditingSexuality, setIsEditingSexuality] = useState(false);
    const [tempSexuality, setTempSexuality] = useState('');
    const [updatingSexuality, setUpdatingSexuality] = useState(false);

    // Common states
    const [loading, setLoading] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [uploadingSection, setUploadingSection] = useState(null); // 'profile' or 'photos'
    const [userId, setUserId] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);


    //intro
    const [introduction, setIntroduction] = useState('');
    const [isEditingIntroduction, setIsEditingIntroduction] = useState(false);
    const [tempIntroduction, setTempIntroduction] = useState('');
    const [updatingIntroduction, setUpdatingIntroduction] = useState(false);
    // Age calculation function
    const calculateAge = (birthDate) => {
        if (!birthDate) return 0;

        // Parse date format DD/MM/YYYY
        const parts = birthDate.split('/');
        if (parts.length !== 3) return 0;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;

        const birth = new Date(year, month, day);
        const today = new Date();

        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            calculatedAge--;
        }

        return calculatedAge > 0 ? calculatedAge : 0;
    };

    // Validate date format DD/MM/YYYY
    const isValidDate = (dateString) => {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(regex);

        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        // Basic validation
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > new Date().getFullYear()) return false;

        // Check if date is valid
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
    };

    // Format date input as user types
    const formatDateInput = (input) => {
        // Remove all non-digits
        const digitsOnly = input.replace(/\D/g, '');

        // Add slashes automatically
        if (digitsOnly.length >= 5) {
            return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
        } else if (digitsOnly.length >= 3) {
            return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
        } else {
            return digitsOnly;
        }
    };

    useEffect(() => {
        initializeScreen();
    }, []);

    // Update age whenever dateOfBirth changes
    useEffect(() => {
        if (dateOfBirth) {
            const calculatedAge = calculateAge(dateOfBirth);
            setAge(calculatedAge);
        }
    }, [dateOfBirth]);

    const initializeScreen = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera roll permissions are needed to upload images!');
            }

            // Try different possible keys for the token
            const possibleTokenKeys = ['authToken', 'token', 'userToken', 'jwt', 'accessToken'];
            let storedToken = null;
            let usedKey = null;

            for (const key of possibleTokenKeys) {
                const token = await AsyncStorage.getItem(key);
                if (token) {
                    storedToken = token;
                    usedKey = key;
                    break;
                }
            }

            // If no token found with common keys, check all keys
            if (!storedToken) {
                console.log('🔍 Checking all AsyncStorage keys...');
                const allKeys = await AsyncStorage.getAllKeys();
                console.log('📱 All AsyncStorage keys:', allKeys);

                for (const key of allKeys) {
                    const value = await AsyncStorage.getItem(key);
                    console.log(`🔑 ${key}:`, value ? `${value.substring(0, 50)}...` : 'null');

                    // Look for JWT-like tokens (they start with 'eyJ')
                    if (value && typeof value === 'string' && value.startsWith('eyJ')) {
                        storedToken = value;
                        usedKey = key;
                        console.log(`🎯 Found JWT-like token in key: ${key}`);
                        break;
                    }
                }
            }

            console.log('🔍 Retrieved token from AsyncStorage:', storedToken ? `${storedToken.substring(0, 50)}...` : 'null');
            console.log('🔑 Token key used:', usedKey);

            if (storedToken) {
                try {
                    // Decode JWT to get userId
                    const decoded = jwtDecode(storedToken);
                    console.log('🔓 Decoded JWT payload:', JSON.stringify(decoded, null, 2));

                    const extractedUserId = decoded.userId || decoded.user_id || decoded.id || decoded.sub;
                    console.log('🔓 Extracted userId from JWT:', extractedUserId);

                    if (extractedUserId) {
                        setUserId(extractedUserId);
                        setAuthToken(storedToken);
                        await loadUserData(extractedUserId, storedToken);
                    } else {
                        console.error('❌ No userId found in JWT payload');
                        Alert.alert('Error', 'Invalid token format. Please login again.');
                    }

                } catch (decodeError) {
                    console.error('❌ Error decoding JWT:', decodeError);
                    Alert.alert('Error', 'Invalid session token. Please login again.');
                    if (usedKey) {
                        await AsyncStorage.removeItem(usedKey);
                    }
                }
            } else {
                console.log('❌ No token found in AsyncStorage');
                Alert.alert('Error', 'No authentication token found. Please login again.');
            }

        } catch (error) {
            console.error('❌ Error initializing screen:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setInitialLoading(false);
        }
    };

    const loadUserData = async (userId, token = null) => {
        try {
            console.log('🔄 Loading user data for userId:', userId);
            console.log('🌐 API_BASE_URL:', API_BASE_URL);

            // Add timeout to the fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            // Prepare headers - include auth token if available
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('📡 Making request to:', `${API_BASE_URL}/users/${userId}`);
            console.log('📡 Request headers:', headers);

            // Use your existing endpoint
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'GET',
                headers: headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            console.log('📡 Response status:', response.status);

            const data = await response.json();
            console.log('📦 Response data:', JSON.stringify(data, null, 2));

            if (response.ok && data.user) {
                const user = data.user;
                console.log('👤 User data:', user);

                // Handle Full Name
                console.log('👤 Raw fullName:', user.fullName);
                const userFullName = user.fullName || '';
                console.log('👤 Setting fullName to:', userFullName);
                setFullName(userFullName);

                // Handle Date of Birth and Age
                console.log('📅 Raw dateOfBirth:', user.dateOfBirth);
                const userDateOfBirth = user.dateOfBirth || '';
                console.log('📅 Setting dateOfBirth to:', userDateOfBirth);
                setDateOfBirth(userDateOfBirth);

                // Age will be calculated automatically by useEffect

                // Handle Gender (NEW)
                console.log('🚻 Raw gender:', user.gender);
                setGender(user.gender || '');

                // Handle Dating Preferences (NEW)
                console.log('💘 Raw datingPreferences:', user.datingPreferences);
                setDatingPreferences(user.datingPreferences || []);

                // Handle Sexuality (Type) (NEW)
                console.log('🌈 Raw type (sexuality):', user.type);
                setSexuality(user.type || '');

                // Handle Profile Photos
                console.log('📸 Raw profile photos:', user.profilePhotos);
                let profilePhotos = user.profilePhotos || [];
                console.log('📸 Profile photos array:', profilePhotos);
                console.log('📸 Profile photos length:', profilePhotos.length);

                // Ensure we always have 3 slots for profile photos
                while (profilePhotos.length < 3) {
                    profilePhotos.push('');
                }
                // Take only first 3 if more exist
                profilePhotos = profilePhotos.slice(0, 3);

                console.log('📸 Final profile photos array:', profilePhotos);
                setProfileImageUrls(profilePhotos);

                // Handle General Photos
                console.log('📷 Raw photos:', user.photos);
                let photos = user.photos || [];
                console.log('📷 Photos array:', photos);
                console.log('📷 Photos length:', photos.length);
                // Handle Introduction
                console.log('📝 Raw introduction:', user.introduction);
                setIntroduction(user.introduction || '');
                // Ensure we always have 10 slots for general photos
                while (photos.length < 10) {
                    photos.push('');
                }
                // Take only first 10 if more exist
                photos = photos.slice(0, 10);

                console.log('📷 Final photos array:', photos);
                setPhotoImageUrls(photos);

                console.log('✅ All user data loaded successfully');
            } else {
                console.error('❌ Failed to load user data:', data.message);
                Alert.alert('Error', `Failed to load user data: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Network error loading user data:', error);

            if (error.name === 'AbortError') {
                Alert.alert('Error', 'Request timed out. Please check your connection and server.');
            } else {
                Alert.alert('Error', `Network error: ${error.message}\n\nPlease check:\n1. Your server is running\n2. API_BASE_URL is correct\n3. Your device can reach the server`);
            }
        }
    };

    const updateUserData = async (updateData) => {
        if (!userId) {
            console.log('❌ No userId available for update');
            Alert.alert('Error', 'User not identified. Please try logging in again.');
            return false;
        }

        try {
            console.log('🔄 Updating user data:', updateData);

            // Add timeout to the fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            // Prepare headers with auth token if available
            const headers = {
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            // Use the PUT endpoint from your backend
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(updateData),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            console.log('📡 Update response status:', response.status);
            const responseData = await response.json();
            console.log('📦 Update response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update user data');
            }

            console.log('✅ User data updated successfully');
            return true;
        } catch (error) {
            console.error('❌ Error updating user data:', error);

            if (error.name === 'AbortError') {
                Alert.alert('Error', 'Update request timed out.');
            } else {
                Alert.alert('Error', 'Failed to save changes: ' + error.message);
            }
            return false;
        }
    };

    const updateUserPhotos = async (updatedUrls, photoType) => {
        // Filter out empty URLs for storage
        const photosToSave = updatedUrls.filter(url => url !== '');
        console.log('💾 Photos to save:', photosToSave);

        // Prepare update data
        const updateData = {};
        updateData[photoType] = photosToSave;

        await updateUserData(updateData);
    };

    // Full Name editing functions
    const startEditingName = () => {
        setTempFullName(fullName);
        setIsEditingName(true);
    };

    const cancelEditingName = () => {
        setTempFullName('');
        setIsEditingName(false);
    };

    const saveFullName = async () => {
        if (!tempFullName.trim()) {
            Alert.alert('Error', 'Full name cannot be empty');
            return;
        }

        setUpdatingName(true);

        const success = await updateUserData({ fullName: tempFullName.trim() });

        if (success) {
            setFullName(tempFullName.trim());
            setIsEditingName(false);
            setTempFullName('');
            console.log('✅ Full name updated successfully');
        }

        setUpdatingName(false);
    };
    // Introduction editing functions
    const startEditingIntroduction = () => {
        setTempIntroduction(introduction);
        setIsEditingIntroduction(true);
    };

    const cancelEditingIntroduction = () => {
        setTempIntroduction('');
        setIsEditingIntroduction(false);
    };

    const saveIntroduction = async () => {
        if (!tempIntroduction.trim()) {
            Alert.alert('Error', 'Introduction cannot be empty');
            return;
        }

        if (tempIntroduction.trim().length > 500) {
            Alert.alert('Error', 'Introduction must be less than 500 characters');
            return;
        }

        setUpdatingIntroduction(true);

        const success = await updateUserData({ introduction: tempIntroduction.trim() });

        if (success) {
            setIntroduction(tempIntroduction.trim());
            setIsEditingIntroduction(false);
            setTempIntroduction('');
            console.log('✅ Introduction updated successfully');
        }

        setUpdatingIntroduction(false);
    };

    // Age/Date of Birth editing functions
    const startEditingAge = () => {
        setTempDateOfBirth(dateOfBirth);
        setIsEditingAge(true);
    };

    const cancelEditingAge = () => {
        setTempDateOfBirth('');
        setIsEditingAge(false);
    };

    const handleDateChange = (input) => {
        const formatted = formatDateInput(input);
        setTempDateOfBirth(formatted);
    };

    const saveDateOfBirth = async () => {
        if (!tempDateOfBirth.trim()) {
            Alert.alert('Error', 'Date of birth cannot be empty');
            return;
        }

        if (!isValidDate(tempDateOfBirth)) {
            Alert.alert('Error', 'Please enter a valid date in DD/MM/YYYY format');
            return;
        }

        // Check if age is reasonable (between 18-100)
        const newAge = calculateAge(tempDateOfBirth);
        if (newAge < 18) {
            Alert.alert('Error', 'You must be at least 18 years old');
            return;
        }
        if (newAge > 100) {
            Alert.alert('Error', 'Please enter a valid date of birth');
            return;
        }

        setUpdatingAge(true);

        const success = await updateUserData({ dateOfBirth: tempDateOfBirth.trim() });

        if (success) {
            setDateOfBirth(tempDateOfBirth.trim());
            setIsEditingAge(false);
            setTempDateOfBirth('');
            console.log('✅ Date of birth updated successfully');
        }

        setUpdatingAge(false);
    };

    // Gender editing functions (NEW)
    const startEditingGender = () => {
        setTempGender(gender);
        setIsEditingGender(true);
    };

    const cancelEditingGender = () => {
        setTempGender('');
        setIsEditingGender(false);
    };

    const saveGender = async () => {
        if (!tempGender) {
            Alert.alert('Error', 'Please select a gender.');
            return;
        }
        setUpdatingGender(true);
        const success = await updateUserData({ gender: tempGender });
        if (success) {
            setGender(tempGender);
            setIsEditingGender(false);
        }
        setUpdatingGender(false);
    };

    // Dating Preferences editing functions (NEW)
    const startEditingDatingPreferences = () => {
        setTempDatingPreferences([...datingPreferences]); // Deep copy
        setIsEditingDatingPreferences(true);
    };

    const cancelEditingDatingPreferences = () => {
        setTempDatingPreferences([]);
        setIsEditingDatingPreferences(false);
    };

    const toggleTempDatingPreference = (option) => {
        setTempDatingPreferences(prev => {
            if (prev.includes(option)) {
                return prev.filter(o => o !== option);
            } else {
                return [...prev, option];
            }
        });
    };

    const saveDatingPreferences = async () => {
        if (tempDatingPreferences.length === 0) {
            Alert.alert('Error', 'Please select at least one dating preference.');
            return;
        }
        setUpdatingDatingPreferences(true);
        const success = await updateUserData({ datingPreferences: tempDatingPreferences });
        if (success) {
            setDatingPreferences(tempDatingPreferences);
            setIsEditingDatingPreferences(false);
        }
        setUpdatingDatingPreferences(false);
    };

    // Sexuality editing functions (NEW)
    const startEditingSexuality = () => {
        setTempSexuality(sexuality);
        setIsEditingSexuality(true);
    };

    const cancelEditingSexuality = () => {
        setTempSexuality('');
        setIsEditingSexuality(false);
    };

    const saveSexuality = async () => {
        if (!tempSexuality) {
            Alert.alert('Error', 'Please select your sexuality.');
            return;
        }
        setUpdatingSexuality(true);
        const success = await updateUserData({ type: tempSexuality }); // 'type' in schema, 'sexuality' in frontend
        if (success) {
            setSexuality(tempSexuality);
            setIsEditingSexuality(false);
        }
        setUpdatingSexuality(false);
    };


    const pickImage = async (index, section) => {
        try {
            setLoading(true);
            setUploadingIndex(index);
            setUploadingSection(section);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.[0]?.uri) {
                return;
            }

            const localUri = result.assets[0].uri;
            await uploadImage(localUri, index, section);
        } catch (error) {
            console.error('❌ Image picker error:', error);
            Alert.alert('Upload Error', error.message);
        } finally {
            setLoading(false);
            setUploadingIndex(null);
            setUploadingSection(null);
        }
    };

    const uploadImage = async (localUri, index, section) => {
        try {
            console.log(`🔄 Uploading image for ${section} at index:`, index);

            const fileId = ID.unique();
            const fileName = `${section}_${userId}_${index}_${Date.now()}.jpg`;
            const uploadUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files?fileId=${fileId}`;

            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                name: fileName,
                type: 'image/jpeg',
            });
            formData.append('fileId', fileId);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'X-Appwrite-Project': PROJECT_ID,
                    'X-Appwrite-Key': API_KEY,
                },
                body: formData,
            });

            const responseData = await response.json();
            console.log('📡 Upload response:', responseData);

            if (!response.ok) {
                throw new Error(`Upload failed: ${responseData.message}`);
            }

            const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${responseData.$id}/view?project=${PROJECT_ID}`;
            console.log('🔗 Generated file URL:', fileUrl);

            if (section === 'profile') {
                const updatedUrls = [...profileImageUrls];
                updatedUrls[index] = fileUrl;
                setProfileImageUrls(updatedUrls);
                await updateUserPhotos(updatedUrls, 'profilePhotos');
            } else if (section === 'photos') {
                const updatedUrls = [...photoImageUrls];
                updatedUrls[index] = fileUrl;
                setPhotoImageUrls(updatedUrls);
                await updateUserPhotos(updatedUrls, 'photos');
            }

            console.log(`✅ ${section} image uploaded and saved successfully`);
        } catch (error) {
            console.error('❌ Upload error:', error);
            Alert.alert('Upload Failed', error.message);
        }
    };

    const handleImageError = async (index, section) => {
        console.log(`❌ Image load error for ${section} at index:`, index);

        if (section === 'profile') {
            const updatedUrls = [...profileImageUrls];
            updatedUrls[index] = '';
            setProfileImageUrls(updatedUrls);
            await updateUserPhotos(updatedUrls, 'profilePhotos');
        } else if (section === 'photos') {
            const updatedUrls = [...photoImageUrls];
            updatedUrls[index] = '';
            setPhotoImageUrls(updatedUrls);
            await updateUserPhotos(updatedUrls, 'photos');
        }
    };

    const removeImage = async (index, section) => {
        const sectionName = section === 'profile' ? 'Profile Photo' : 'Photo';
        Alert.alert(
            `Remove ${sectionName}`,
            `Are you sure you want to remove this ${sectionName.toLowerCase()}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        console.log(`🗑️ Removing ${section} image at index:`, index);

                        if (section === 'profile') {
                            const updatedUrls = [...profileImageUrls];
                            updatedUrls[index] = '';
                            setProfileImageUrls(updatedUrls);
                            await updateUserPhotos(updatedUrls, 'profilePhotos');
                        } else if (section === 'photos') {
                            const updatedUrls = [...photoImageUrls];
                            updatedUrls[index] = '';
                            setPhotoImageUrls(updatedUrls);
                            await updateUserPhotos(updatedUrls, 'photos');
                        }
                    },
                },
            ]
        );
    };

    // Handle scroll for profile photos
    const handleProfileScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / (width - 40));
        setProfileCurrentIndex(index);
    };

    // Handle scroll for general photos
    const handlePhotoScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / (width - 40));
        setPhotoCurrentIndex(index);
    };

    // Scroll to specific index for profile photos
    const scrollToProfileIndex = (index) => {
        profileScrollViewRef.current?.scrollTo({
            x: index * (width - 40),
            animated: true,
        });
        setProfileCurrentIndex(index);
    };

    // Scroll to specific index for general photos
    const scrollToPhotoIndex = (index) => {
        photoScrollViewRef.current?.scrollTo({
            x: index * (width - 40),
            animated: true,
        });
        setPhotoCurrentIndex(index);
    };

    // Debug info display
    const showDebugInfo = () => {
        Alert.alert(
            'Debug Info',
            `UserId: ${userId}\nAPI URL: ${API_BASE_URL}\nHas Token: ${authToken ? 'Yes' : 'No'}\nFull Name: ${fullName}\nDate of Birth: ${dateOfBirth}\nAge: ${age}\nGender: ${gender}\nDating Preferences: ${JSON.stringify(datingPreferences)}\nSexuality: ${sexuality}\nProfile Photos: ${JSON.stringify(profileImageUrls, null, 2)}\nGeneral Photos: ${JSON.stringify(photoImageUrls, null, 2)}`,
            [{ text: 'OK' }]
        );
    };

    // Check token expiration
    const checkTokenExpiration = () => {
        if (authToken) {
            try {
                const decoded = jwtDecode(authToken);
                const currentTime = Date.now() / 1000;
                const isExpired = decoded.exp < currentTime;

                Alert.alert(
                    'Token Status',
                    `Token expires: ${new Date(decoded.exp * 1000).toLocaleString()}\nIs expired: ${isExpired}`,
                    [{ text: 'OK' }]
                );

                if (isExpired) {
                    Alert.alert('Session Expired', 'Please login again.');
                }
            } catch (error) {
                Alert.alert('Error', 'Could not decode token');
            }
        }
    };

    // Test connection function
    const testConnection = async () => {
        try {
            console.log('🧪 Testing connection to:', API_BASE_URL);
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                Alert.alert('Connection Test', 'Server is reachable!');
            } else {
                Alert.alert('Connection Test', `Server responded with status: ${response.status}`);
            }
        } catch (error) {
            Alert.alert('Connection Test', `Failed to reach server: ${error.message}`);
        }
    };

    if (!fontsLoaded || initialLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6347" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </SafeAreaView>
        );
    }
return (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headingWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.headerText}>My Profile</Text>
            <View style={styles.titleIcon}>
              <Text style={styles.titleIconText}>👤</Text>
            </View>
          </View>
          <View style={styles.headingAccent} />
        </View>
      </View>

      {/* Profile Photo Scroll */}
      <View style={styles.profilePhotosSection}>
        <ScrollView
          ref={profileScrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleProfileScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.profilePhotosScrollViewContent}
        >
          {profileImageUrls.map((url, index) => (
            <TouchableOpacity
              key={`profile-${index}`}
              style={[
                styles.profilePhotoContainer,
                !url && styles.emptyPhotoContainer,
              ]}
              onPress={() => pickImage(index, 'profile')}
              onLongPress={() => url && removeImage(index, 'profile')}
            >
              {url ? (
                <Image
                  source={{ uri: url }}
                  style={styles.profilePhoto}
                  onError={() => handleImageError(index, 'profile')}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.addPhotoButton}>
                  {loading &&
                  uploadingIndex === index &&
                  uploadingSection === 'profile' ? (
                    <ActivityIndicator size="small" color="#666666" />
                  ) : (
                    <>
                      <EvilIcons name="camera" size={36} color="#999999" />
                      <Text style={styles.tapToAddText}>Add Photo</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.profilePaginationDots}>
          {profileImageUrls.map((_, index) => (
            <TouchableOpacity
              key={`profile-dot-${index}`}
              style={[
                styles.profileDot,
                profileCurrentIndex === index && styles.activeProfileDot,
              ]}
              onPress={() => scrollToProfileIndex(index)}
            />
          ))}
        </View>
      </View>

      {/* General Photos Scroll */}
      <View style={styles.photosSection}>
        <ScrollView
          ref={photoScrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleProfileScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.generalPhotosScrollViewContent}
        >
          {photoImageUrls.map((url, index) => (
            <TouchableOpacity
              key={`general-${index}`}
              style={[
                styles.generalPhotoContainer,
                !url && styles.emptyGeneralPhotoContainer,
              ]}
              onPress={() => pickImage(index, 'photos')}
              onLongPress={() => url && removeImage(index, 'photos')}
            >
              {url ? (
                <Image
                  source={{ uri: url }}
                  style={styles.generalPhoto}
                  onError={() => handleImageError(index, 'photos')}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.addGeneralPhotoButton}>
                  {loading &&
                  uploadingIndex === index &&
                  uploadingSection === 'photos' ? (
                    <ActivityIndicator size="small" color="#666666" />
                  ) : (
                    <>
                      <EvilIcons name="camera" size={28} color="#999999" />
                      <Text style={styles.tapToAddSmallText}>Add</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* My Profile Card */}
      <View style={styles.card}>
        {/* Full Name */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Full Name</Text>
            {!isEditingName && (
              <TouchableOpacity
                onPress={startEditingName}
                disabled={updatingName}
                style={styles.editButton}
              >
                <EvilIcons name="pencil" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          {isEditingName ? (
            <View>
              <TextInput
                style={styles.textInput}
                value={tempFullName}
                onChangeText={setTempFullName}
                autoCapitalize="words"
                placeholder="Enter full name"
                placeholderTextColor="#999999"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={cancelEditingName}
                  style={[styles.smallButton, styles.cancelButton]}
                  disabled={updatingName}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveFullName}
                  style={[styles.smallButton, styles.saveButton]}
                  disabled={updatingName}
                >
                  {updatingName ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.smallButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.sectionContent}>
              {fullName || 'No name set.'}
            </Text>
          )}
        </View>

        {/* Introduction */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            {!isEditingIntroduction && (
              <TouchableOpacity
                onPress={startEditingIntroduction}
                disabled={updatingIntroduction}
                style={styles.editButton}
              >
                <EvilIcons name="pencil" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          {isEditingIntroduction ? (
            <View>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={tempIntroduction}
                onChangeText={setTempIntroduction}
                multiline
                numberOfLines={4}
                maxLength={500}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#999999"
              />
              <Text style={styles.charCount}>
                {tempIntroduction.length}/500
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={cancelEditingIntroduction}
                  style={[styles.smallButton, styles.cancelButton]}
                  disabled={updatingIntroduction}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveIntroduction}
                  style={[styles.smallButton, styles.saveButton]}
                  disabled={updatingIntroduction}
                >
                  {updatingIntroduction ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.smallButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.sectionContent}>
              {introduction || 'No introduction yet.'}
            </Text>
          )}
        </View>

        {/* Age / Date of Birth */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Age</Text>
            {!isEditingAge && (
              <TouchableOpacity
                onPress={startEditingAge}
                disabled={updatingAge}
                style={styles.editButton}
              >
                <EvilIcons name="pencil" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          {isEditingAge ? (
            <View>
              <TextInput
                style={styles.textInput}
                value={tempDateOfBirth}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#999999"
                maxLength={10}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={cancelEditingAge}
                  style={[styles.smallButton, styles.cancelButton]}
                  disabled={updatingAge}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveDateOfBirth}
                  style={[styles.smallButton, styles.saveButton]}
                  disabled={updatingAge}
                >
                  {updatingAge ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.smallButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.sectionContent}>
              {age > 0
                ? `${age} years old (${dateOfBirth})`
                : 'No date of birth set.'}
            </Text>
          )}
        </View>

        {/* Gender */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gender</Text>
            {!isEditingGender && (
              <TouchableOpacity
                onPress={startEditingGender}
                disabled={updatingGender}
                style={styles.editButton}
              >
                <EvilIcons name="pencil" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          {isEditingGender ? (
            <View>
              <View style={styles.genderOptions}>
                {['Male', 'Female', 'Other'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOptionButton,
                      tempGender === option && styles.selectedGenderOption,
                    ]}
                    onPress={() => setTempGender(option)}
                    disabled={updatingGender}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      tempGender === option && styles.selectedOptionText,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={cancelEditingGender}
                  style={[styles.smallButton, styles.cancelButton]}
                  disabled={updatingGender}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveGender}
                  style={[styles.smallButton, styles.saveButton]}
                  disabled={updatingGender}
                >
                  {updatingGender ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.smallButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.sectionContent}>
              {gender || 'Not specified.'}
            </Text>
          )}
        </View>

        {/* Dating Preferences */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dating Preferences</Text>
            {!isEditingDatingPreferences && (
              <TouchableOpacity
                onPress={startEditingDatingPreferences}
                disabled={updatingDatingPreferences}
                style={styles.editButton}
              >
                <EvilIcons name="pencil" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          {isEditingDatingPreferences ? (
            <View>
              <View style={styles.preferenceOptionsContainer}>
                {['Male', 'Female', 'Non-binary', 'Transgender'].map(
                  (option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.preferenceOptionButton,
                        tempDatingPreferences.includes(option) &&
                          styles.selectedPreferenceOption,
                      ]}
                      onPress={() => toggleTempDatingPreference(option)}
                      disabled={updatingDatingPreferences}
                    >
                      <Text style={[
                        styles.preferenceOptionText,
                        tempDatingPreferences.includes(option) && styles.selectedOptionText,
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={cancelEditingDatingPreferences}
                  style={[styles.smallButton, styles.cancelButton]}
                  disabled={updatingDatingPreferences}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveDatingPreferences}
                  style={[styles.smallButton, styles.saveButton]}
                  disabled={updatingDatingPreferences}
                >
                  {updatingDatingPreferences ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.smallButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.sectionContent}>
              {datingPreferences.length > 0
                ? datingPreferences.join(', ')
                : 'Not specified.'}
            </Text>
          )}
        </View>

        {/* Sexuality */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sexuality</Text>
            {!isEditingSexuality && (
              <TouchableOpacity
                onPress={startEditingSexuality}
                disabled={updatingSexuality}
                style={styles.editButton}
              >
                <EvilIcons name="pencil" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          {isEditingSexuality ? (
            <View>
              <View style={styles.sexualityOptionsContainer}>
                {[
                  'Straight',
                  'Gay',
                  'Lesbian',
                  'Bisexual',
                  'Pansexual',
                  'Queer',
                  'Asexual',
                  'Demisexual',
                  'Questioning',
                  'Other',
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sexualityOptionButton,
                      tempSexuality === option &&
                        styles.selectedSexualityOption,
                    ]}
                    onPress={() => setTempSexuality(option)}
                    disabled={updatingSexuality}
                  >
                    <Text style={[
                      styles.sexualityOptionText,
                      tempSexuality === option && styles.selectedOptionText,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={cancelEditingSexuality}
                  style={[styles.smallButton, styles.cancelButton]}
                  disabled={updatingSexuality}
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveSexuality}
                  style={[styles.smallButton, styles.saveButton]}
                  disabled={updatingSexuality}
                >
                  {updatingSexuality ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.smallButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.sectionContent}>
              {sexuality || 'Not specified.'}
            </Text>
          )}
        </View>

        {/* Debugging / Utility Buttons */}
        <View style={styles.debugButtonsContainer}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={showDebugInfo}
          >
            <Text style={styles.debugButtonText}>Show Debug Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={checkTokenExpiration}
          >
            <Text style={styles.debugButtonText}>Check Token Expiration</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={testConnection}
          >
            <Text style={styles.debugButtonText}>Test API Connection</Text>
          </TouchableOpacity>
        </View>
      </View>
       <View style={styles.container}>
      {/* Your other profile content */}
      
      {/* Logout Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  // Safe area with consistent background
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  // Header Styles (matching chat screen)
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12, // Reduced from 24
    backgroundColor: '#FFFFFF',
  },
  headingWrapper: {
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerText: {
    fontFamily: 'Boldonse-Regular',
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.8,
    marginRight: 12,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleIconText: {
    fontSize: 18,
  },
  headingAccent: {
    width: 50,
    height: 3,
    backgroundColor: '#333333',
    borderRadius: 2,
  },

  // Profile Photo Section
  profilePhotosSection: {
    marginTop: -10, // Reduced from 24
    alignItems: 'center',
  },
  profilePhotosScrollViewContent: {
    alignItems: 'center',
    height: width * 0.85,
  },
  profilePhotoContainer: {
    width: width - 40, // Full width minus padding to show only one photo
    height: width * 0.65,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginHorizontal: 20, // Increased margin to center properly
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  emptyPhotoContainer: {
    borderWidth: 3, // Thickened from 2
    borderStyle: 'dashed',
    borderColor: '#000000', // Slightly darker for better visibility
    backgroundColor: '#F8F9FA',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  addPhotoButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapToAddText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  profilePaginationDots: {
    flexDirection: 'row',
    marginTop: -20, // Reduced from 16
  },
  profileDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 6,
  },
  activeProfileDot: {
    backgroundColor: '#333333',
  },

  // General Photos Section
  photosSection: {
    marginTop: 0, // Reduced from 32
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  generalPhotosScrollViewContent: {
    alignItems: 'center',
    height: width * 0.35,
  },
  generalPhotoContainer: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  emptyGeneralPhotoContainer: {
    borderWidth: 2.5, // Thickened from 1.5
    borderStyle: 'dashed',
    borderColor: '#000000', // Slightly darker
    backgroundColor: '#F8F9FA',
  },
  generalPhoto: {
    width: '100%',
    height: '100%',
  },
  addGeneralPhotoButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapToAddSmallText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },

  // Card containing profile fields
  card: {
    marginTop: 20, // Reduced from 32
    marginHorizontal: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  // Section Styles
  sectionContainer: {
    marginBottom: 18, // Reduced from 24
    paddingBottom: 16, // Reduced from 20
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },

  // Input Styles
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 6,
  },

  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  smallButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#333333',
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Option Button Styles
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  genderOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedGenderOption: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
  genderOptionText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },

  preferenceOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  preferenceOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedPreferenceOption: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
  preferenceOptionText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },

  sexualityOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sexualityOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedSexualityOption: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
  sexualityOptionText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },

  // Debug Section
  debugButtonsContainer: {
    marginTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
  },
  debugButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
   buttonContainer: {
    flexDirection: 'column',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;