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
  Dimensions,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Client, Storage, ID } from 'appwrite';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import { useFonts } from 'expo-font';
import {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_BUCKET_ID,
    APPWRITE_API_KEY,
    BASE_URL, // Use BASE_URL, not API_BASE_URL here
} from '@env';

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const storage = new Storage(client);
const BUCKET_ID = APPWRITE_BUCKET_ID;
const API_KEY = APPWRITE_API_KEY;
const PROJECT_ID = APPWRITE_PROJECT_ID;
const API_BASE_URL = BASE_URL;

const PhotoScreen = () => {
   const [fontsLoaded] = useFonts({
      'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
      'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
      'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
      'PassionOne-Regular': require('../assets/fonts/PassionOne-Regular.ttf'),
    });
  const navigation = useNavigation();
  const [imageUrls, setImageUrls] = useState(Array(10).fill(''));
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  

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
    console.log('Loading saved progress for Photos...');
    const progressData = await getRegistrationProgress('Photos');
    if (progressData?.imageUrls) {
      let urls = progressData.imageUrls;
      if (urls.length < 10) {
        urls = [...urls, ...Array(10 - urls.length).fill('')];
      }
      setImageUrls(urls);
      console.log('Set imageUrls from saved data:', urls);
    }
  };

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
      await saveRegistrationProgress('Photos', { imageUrls: updatedUrls });
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    }
  };

  const handleImageError = (index) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = '';
    setImageUrls(updatedUrls);
    saveRegistrationProgress('Photos', { imageUrls: updatedUrls });
  };

  const handleNext = async () => {
    if (imageUrls.filter(url => url).length < 1) {
      Alert.alert('Add Photos', 'Please add at least 1 photo to continue');
      return;
    }
    await saveRegistrationProgress('Photos', { imageUrls });
    navigation.navigate('ProfilePhotoScreen');
  };

  // Create chunks of 2 images for grid layout
  const imageChunks = [];
  for (let i = 0; i < imageUrls.length; i += 2) {
    imageChunks.push(imageUrls.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          {/* Header content */}
        </View>
        <Text style={styles.heading}>Add what you like</Text>
        <Text style={styles.subHeading}>Tap to add photos</Text>
        <View style={styles.gridContainer}>
          {imageChunks.map((chunk, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
              {chunk.map((url, colIndex) => {
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
        <TouchableOpacity onPress={handleNext} style={styles.nextButton} activeOpacity={0.8}>
  <View style={styles.nextButtonContent}>
    <Text style={styles.nextButtonText}>NEXT</Text>
    <MaterialIcons name="send" size={24} color="#fff" style={styles.sendIcon} />
  </View>
</TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PhotoScreen;

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2; // 2 cards per row with padding

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    alignItems: 'center' 
  },
  header: { 
    
   
    marginTop: 25, 
    fontSize:25,
    fontFamily: 'Boldonse-Regular',
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
    textAlign: 'center', 
    fontFamily: 'Boldonse-Regular' 
  },
  subHeading: { 
    fontSize: 15, 
    color: 'gray', 
    marginTop: 5, 
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
    borderRadius: 15, 
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
  nextButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 0,
    paddingHorizontal: 16,
    marginTop: 20,
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
