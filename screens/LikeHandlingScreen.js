import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_BUCKET_ID,
    APPWRITE_API_KEY,
    BASE_URL, // Use BASE_URL, not API_BASE_URL here
} from '@env';
const API_BASE_URL = BASE_URL;
const { width } = Dimensions.get('window');
const photoHeight = width * 0.7;

const LikeHandlingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { like, currentUserId, likeId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Extract the liker's details from the populated like object.
  const liker = like?.userId || {};

  // Grab the liker's profile photos array (if any)
  const profilePhotos = Array.isArray(liker.profilePhotos)
    ? liker.profilePhotos.filter((url) => url && url.trim() !== '')
    : [];

  // Create a match between the current user and the liker
  const createMatch = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/create-match`, {
        currentUserId,
        selectedUserId: liker._id,
      });
      if (response.status === 200) {
        Alert.alert('Match Created', 'You have matched with this user!');
        // Instead of navigating to a screen that might not exist, go back.
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to create match.');
      }
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'Error creating match.');
    } finally {
      setLoading(false);
    }
  };

  // Remove the like (optionally call an API if needed)
  const removeLike = async () => {
    setLoading(true);
    try {
      Alert.alert('Like Removed', 'This like has been removed.');
      // Use goBack() to return to the previous screen.
      navigation.goBack();
    } catch (error) {
      console.error('Error removing like:', error);
      Alert.alert('Error', 'Error removing like.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = () => {
    Alert.alert(
      'Confirm Match',
      `Do you want to match with ${liker.fullName || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Match', onPress: createMatch },
      ]
    );
  };

  const handleRemoveLike = () => {
    Alert.alert(
      'Remove Like',
      `Do you want to remove this like from ${liker.fullName || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: removeLike },
      ]
    );
  };

  // Function to render photo placeholders as slider items
  const renderPhotoPlaceholders = () => {
    let items = [];

    // Render actual photos (up to 3)
    profilePhotos.slice(0, 3).forEach((photoUrl, index) => {
      items.push(
        <View key={`photo-${index}`} style={styles.photoWrapper}>
          <Image source={{ uri: photoUrl }} style={styles.profileImage} />
        </View>
      );
    });

    // Add placeholders if fewer than 3 photos exist
    const placeholdersNeeded = 3 - profilePhotos.length;
    for (let i = 0; i < placeholdersNeeded; i++) {
      items.push(
        <View key={`placeholder-${i}`} style={styles.photoWrapper}>
          <View style={[styles.profileImage, styles.emptyPhotoPlaceholder]}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        </View>
      );
    }
    return items;
  };

  // Handle scroll event to update active dot
  const onScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollX / width);
    setActiveIndex(currentIndex);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Profile Details</Text>
        </View>

        {/* Horizontal slider for profile photos */}
        <View style={styles.photosSlider}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {renderPhotoPlaceholders()}
          </ScrollView>
          {/* Dot indicators */}
          <View style={styles.dotsContainer}>
            {[...Array(3).keys()].map((dotIndex) => (
              <View
                key={`dot-${dotIndex}`}
                style={[
                  styles.dot,
                  activeIndex === dotIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* User Details Section */}
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userFullName}>{liker.fullName || 'Unknown'}</Text>
          <View style={styles.detailsBox}>
            <Text style={styles.detailsText}>
              {liker.type || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Profile Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{liker.dateOfBirth || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.introductionTitle}>About</Text>
          <Text style={styles.introduction}>
            {liker.introduction || 'No introduction provided.'}
          </Text>
        </View>

        {/* Like Details Section */}
        <View style={styles.likeDetails}>
          <Text style={styles.sectionTitle}>They liked your photo</Text>
          {like?.image ? (
            <Image source={{ uri: like.image }} style={styles.likedImage} />
          ) : (
            <View style={[styles.likedImage, styles.emptyPhotoPlaceholder]}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Their comment:</Text>
            <Text style={styles.commentText}>
              "{like?.comment || 'No comment provided.'}"
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {loading ? (
          <ActivityIndicator size="large" color="#E94E77" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleRemoveLike}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleMatch}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Match</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LikeHandlingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 12,
    marginTop:30,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Boldonse-Regular',
  },
  photosSlider: {
    width: '100%',
    height: 330,
    elevation:30,
    marginTop: 0,
  },
  photoWrapper: {
    width: width,
    marginRight: 4,
    position: 'relative',

  },
  profileImage: {
    width: '95%',
    height: photoHeight,
    resizeMode: 'cover',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#000',
    alignSelf: 'center',
  },
  emptyPhotoPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#888',
    fontSize: 18,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,

    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#333',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  userDetailsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    elevation:30,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#000',
  },
  userFullName: {
    fontSize: 22,
    fontWeight: 'bold',
    elevation:30,
    color: '#333',
  },
  detailsBox: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    
  },
  detailsText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation:30,
    borderWidth: 2.5,
    borderColor: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  introductionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  introduction: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  likeDetails: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
    elevation:30,
    borderWidth: 2.5,
    borderColor: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  likedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  commentContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
  },
  commentLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  commentText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    height: 50,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'RollingNoOne-ExtraBold',
  },
});
