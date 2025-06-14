import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Dimensions,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Client, Storage, ID } from 'appwrite';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import PhotoScreen from './PhotoScreen';
import { useFonts } from 'expo-font';
import {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_BUCKET_ID,
    APPWRITE_API_KEY,
    BASE_URL, // Use BASE_URL, not API_BASE_URL here
} from '@env';
console.log('🏷️ [ENV] BASE_URL =', BASE_URL);
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const storage = new Storage(client);
const BUCKET_ID = APPWRITE_BUCKET_ID;
const API_KEY = APPWRITE_API_KEY;
const PROJECT_ID = APPWRITE_PROJECT_ID;
const API_BASE_URL = BASE_URL;
const ProfilePhotoScreen = () => {
  const [fontsLoaded] = useFonts({
        'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
        'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
        'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
        'PassionOne-Regular': require('../assets/fonts/PassionOne-Regular.ttf'),
      });
  const navigation = useNavigation();
  // Use 3 slots for profile photos; data saved under key 'ProfilePhotos'
  const [imageUrls, setImageUrls] = useState(Array(3).fill(''));
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [introduction, setIntroduction] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera roll permissions are needed to upload images!');
      }
    })();
    loadSavedProgress();
  }, []);

  const loadSavedProgress = async () => {
    console.log('Loading saved progress for Profile Photos...');
    const progressData = await getRegistrationProgress('ProfilePhotos');
    if (progressData?.imageUrls) {
      let urls = progressData.imageUrls;
      if (urls.length < 3) {
        urls = [...urls, ...Array(3 - urls.length).fill('')];
      }
      setImageUrls(urls);
      console.log('Set imageUrls from saved data:', urls);
    }
    const introData = await getRegistrationProgress('Introduction');
    if (introData?.introduction) {
      setIntroduction(introData.introduction);
    }
  };
  console.log("Current Stack: ", navigation.getState());

  const pickImage = async (index) => {
    try {
      setLoading(true);
      setUploadingIndex(index);
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
      await uploadImage(localUri, index);
    } catch (error) {
      Alert.alert('Upload Error', error.message);
    } finally {
      setLoading(false);
      setUploadingIndex(null);
    }
  };

  const uploadImage = async (localUri, index) => {
    try {
      const fileId = ID.unique();
      const fileName = `image_${Date.now()}.jpg`;
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
      if (!response.ok) {
        throw new Error(`Upload failed: ${responseData.message}`);
      }
      const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${responseData.$id}/view?project=${PROJECT_ID}`;
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = fileUrl;
      setImageUrls(updatedUrls);
      await saveRegistrationProgress('ProfilePhotos', { imageUrls: updatedUrls });
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    }
  };

  const handleImageError = (index) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = '';
    setImageUrls(updatedUrls);
    saveRegistrationProgress('ProfilePhotos', { imageUrls: updatedUrls });
  };

  const handleNext = async () => {
    if (imageUrls.filter(url => url).length < 1) {
      Alert.alert('Add Photos', 'Please add at least 1 photo to continue');
      return;
    }
    await saveRegistrationProgress('ProfilePhotos', { imageUrls });
    await saveRegistrationProgress('Introduction', { introduction });
    console.log('Saved profile photos and introduction:', imageUrls, introduction);
    navigation.navigate('PreFinalScreen');
  };

  // Create grid chunks for the profile photos (grid of 2 per row)
  const imageChunks = [];
  for (let i = 0; i < imageUrls.length; i += 2) {
    imageChunks.push(imageUrls.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          
        </View>
        <Text style={styles.heading}>Pick Your Photos:</Text>
        <Text style={styles.subHeading}>Tap a card to add a photo</Text>

        {/* Grid Layout for Profile Photos */}
        <View style={styles.gridContainer}>
          {imageChunks.map((chunk, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
              {chunk.map((url, colIndex) => {
                // Calculate the original index (if grid not even)
                const index = rowIndex * 2 + colIndex;
                return (
                  <Pressable 
                    key={`image-${index}`} 
                    onPress={() => pickImage(index)} 
                    style={styles.gridCard}
                  >
                    {loading && uploadingIndex === index ? (
                      <ActivityIndicator color="#581845" size="large" />
                    ) : url ? (
                      <Image
                        source={{ uri: url }}
                        style={styles.cardImage}
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <EvilIcons name="image" size={40} color="black" />
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Introduction Section */}
        <View style={styles.introContainer}>
          <Text style={styles.introLabel}>Introduction</Text>
          <TextInput
            style={styles.introInput}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#555"
            value={introduction}
            onChangeText={setIntroduction}
            multiline
          />
        </View>

        {/* Spacer to prevent content from being hidden behind fixed button */}
        <View style={{height: 80}} />
      </ScrollView>
      
      {/* Updated button container that matches BasicInfo screen */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
          <Ionicons name="send" size={20} color="#FFFFFF" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfilePhotoScreen;

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2; // for grid cards

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff',
    position: 'relative', // Added for proper button positioning
  },
  scrollContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 20, // Reduced from 40 since we have spacer now
    alignItems: 'center' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 15, 
    marginBottom: 20 
  },
  iconWrapper: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    borderColor: 'black', 
    borderWidth: 2, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logo: { 
    width: 100, 
    height: 40, 
    marginLeft: 10 
  },
  heading: { 
    fontSize: 25, 
    fontFamily: 'Boldonse-Regular', 
    marginTop: 15, 
    textAlign: 'center' 
  },
  subHeading: { 
    fontSize: 15, 
    color: 'gray', 
    marginTop: 10, 
    textAlign: 'center' 
  },
  gridContainer: { 
    width: '100%', 
    marginTop: 20 
  },
  gridRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 15 
  },
  gridCard: { 
    backgroundColor: '#EDE7F6', 
    borderRadius: 12, 
    borderColor: 'black', 
    borderWidth: 4, 
    height: cardWidth, 
    width: cardWidth, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden' 
  },
  cardImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 10, 
    resizeMode: 'cover' 
  },
  placeholderContainer: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  addPhotoText: { 
    marginTop: 8, 
    fontSize: 12, 
    color: '#666' 
  },
  introContainer: { 
    width: '100%', 
    backgroundColor: '#EDE7F6', 
    borderColor: 'black', 
    borderWidth: 4, 
    borderRadius: 12, 
    padding: 15, 
    marginTop: 20 
  },
  introLabel: { 
    fontSize: 18, 
    fontFamily: 'Boldonse-Regular', 
    color: '#000000', 
    marginBottom: 10 
  },
  introInput: { 
    height: 100, 
    textAlignVertical: 'top', 
    fontSize: 16, 
    color: '#000' 
  },
  
  // Updated button styles to match BasicInfo screen
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