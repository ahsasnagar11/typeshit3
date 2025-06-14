import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated,
  Linking,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { jwtDecode } from 'jwt-decode';
import { useFonts } from 'expo-font';
import { BASE_URL } from '@env';
import { SvgUri } from 'react-native-svg';
const API_BASE_URL = BASE_URL;

const HomeScreen = () => {
  const [userName, setUserName] = useState('');
  const [fontsLoaded] = useFonts({
    'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
    'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
  });
  
  const { token, signOut } = useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [profilesData, setProfilesData] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showComment, setShowComment] = useState(false);

  // Animated value for the comment input
  const commentAnim = useRef(new Animated.Value(0)).current;

  // Trigger animation when showComment becomes true
  useEffect(() => {
    if (showComment) {
      commentAnim.setValue(0);
      Animated.spring(commentAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [showComment, commentAnim]);

  // Dummy profile fallback
  const dummyProfile = {
    fullName: 'Dummy Profile',
    photos: ['https://via.placeholder.com/350'],
    introduction: 'No matches available at the moment. Check back later!',
  };

  // Decode token to get user ID
  useEffect(() => {
    if (token) {
      if (token.startsWith('user_')) {
        setUserId(token.replace('user_', ''));
      } else {
        try {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.userId);
        } catch (error) {
          console.error('Error decoding token:', error);
          setError('Invalid authentication token');
        }
      }
    }
  }, [token]);

  // Handle banner ad press
  const handleBannerPress = () => {
    Alert.alert('Premium Features', 'Upgrade to premium for unlimited matches and exclusive features!');
  };

  // Handle Instagram link press
  const handleInstagramPress = () => {
    const instagramUrl = 'https://www.instagram.com/';
    Linking.openURL(instagramUrl).catch(err => {
      Alert.alert('Error', 'Unable to open Instagram. Please try again.');
    });
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      setUserName(response.data.user.fullName || response.data.user.userName || '');
    } catch (error) {
      console.error('Error fetching user details:', error);
      tryGetNameFromToken();
    }
  };

  // Helper function to extract user info from token
  const tryGetNameFromToken = () => {
    try {
      if (token && !token.startsWith('user_')) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.name) {
          setUserName(decodedToken.name);
        }
      }
    } catch (tokenError) {
      console.error('Unable to get user name from token:', tokenError);
      setUserName('Friend');
    }
  };

  // Fetch profiles from backend
  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/matches?userId=${userId}`);
      if (response.data.matches && response.data.matches.length > 0) {
        setProfilesData(response.data.matches);
        setCurrentProfileIndex(0);
        setCurrentImageIndex(0);
      } else {
        setProfilesData([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Unable to fetch matches. Please try again later.');
      Alert.alert('Error', 'Unable to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch matches and user details when userId becomes available
  useEffect(() => {
    if (userId) {
      fetchMatches();
      fetchUserDetails();
    }
  }, [userId]);

  // Get current profile
  const currentProfile =
    profilesData && profilesData.length > 0 ? profilesData[currentProfileIndex] : dummyProfile;

  // Handle next image
  const handleNextImage = () => {
    if (showComment) {
      setShowComment(false);
      setComment('');
      commentAnim.setValue(0);
      return;
    }
    
    if (!currentProfile) return;
    const photosArray = currentProfile.photos || currentProfile.profilePhotos || [];
    const nextImageIndex = currentImageIndex + 1;
    if (nextImageIndex >= photosArray.length) {
      setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex(nextImageIndex);
    }
  };

  // Handle next profile
  const handleNextProfile = () => {
    const nextProfileIndex = currentProfileIndex + 1;
    if (profilesData && nextProfileIndex < profilesData.length) {
      setCurrentProfileIndex(nextProfileIndex);
      setCurrentImageIndex(0);
    } else {
      setCurrentProfileIndex(0);
      setCurrentImageIndex(0);
    }
    setShowComment(false);
    setComment('');
    commentAnim.setValue(0);
  };

  // Like profile function
  const likeProfile = async () => {
    if (!currentProfile || !userId) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/like-profile`, {
        userId: userId,
        likedUserId: currentProfile._id,
        image: currentProfile.photos && currentProfile.photos[currentImageIndex],
        comment: comment,
      });
      console.log(response.data.message);
      Alert.alert('Success', 'You liked this profile!');
      handleNextProfile();
    } catch (error) {
      console.error('Error liking profile:', error);
      Alert.alert('Error', 'Unable to like profile. Please try again.');
    }
  };

  // Handle like button press
  const handleLikeButtonPress = () => {
    if (!showComment) {
      setShowComment(true);
    } else {
      likeProfile();
    }
  };

  // Render the top banner ad
  const renderBannerAd = () => {
    return (
      <TouchableOpacity style={styles.bannerContainer} onPress={handleBannerPress} activeOpacity={0.8}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerIconText}>⭐</Text>
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Go Premium!</Text>
            <Text style={styles.bannerSubtitle}>Unlock unlimited matches & exclusive features</Text>
          </View>
          <View style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render the profile card
  const renderProfileCard = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#C5B358" />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMatches}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!currentProfile) {
      return <Text style={styles.noProfiles}>No profiles available</Text>;
    }

    const photosArray = currentProfile.photos || currentProfile.profilePhotos || [];
    const imageUrl = photosArray[currentImageIndex] || null;

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          {imageUrl ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
            </View>
          ) : ( 
            <View style={[styles.image, styles.placeholder]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          
          {/* Animated Comment Input */}
          {showComment && (
            <Animated.View
              style={[styles.animatedCommentContainer, { transform: [{ scale: commentAnim }] }]}
            >
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={comment}
                onChangeText={setComment}
              />
            </Animated.View>
          )}
          
          
          {profilesData.length === 0 && (
            <Text style={styles.dummyIndicator}>No matches yet!</Text>
          )}
        </View>
        <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={handleNextImage}>
              <Text style={{ ...styles.buttonText, color: 'rgba(248, 4, 4, 0.74)' }}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLikeButtonPress}>
              <Text style={{ ...styles.buttonText, color: 'rgba(10, 113, 3, 0.97)' }}>
                {showComment ? 'Send Like' : 'Like'}
              </Text>
            </TouchableOpacity>
          </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background hashtag image - partially visible with left margin */}
      <Image 
        source={require('../assets/hashtag_7073711.png')} 
        style={styles.backgroundHashtag} 
        resizeMode="contain"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Banner Ad */}
        {renderBannerAd()}

        {/* User Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hello, </Text>
          <Text style={styles.userNameText}>{userName || 'Friend'}</Text>
        </View>

        {renderProfileCard()}
        
        {/* Image under the card with big gap */}
        
        
        {/* Start Liking Section */}
        <View style={styles.startLikingContainer}>
          <Text style={styles.startLikingText}></Text>
        </View>
        
        {/* Instagram Icon at bottom */}
       
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(240, 240, 240, 0.3)',
    position: 'relative',
  },
  
  // Background hashtag image styles
  backgroundHashtag: {
    position: 'absolute',
    width: 700,
    height: 1500,
    left: 0, // Margin from left
    top: '50%', // Center vertically
    marginTop: -600, // Adjust for centering
    opacity: 0.08, // Make it partially visible
    zIndex: -1, // Behind all content
  },
  
  // Banner Ad Styles (keeping your improved banner design)
  bannerContainer: {
    marginTop: 50,
    marginHorizontal: 7,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: 'rgb(0, 0, 0)', 
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerIconText: {
    fontSize: 18,
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  upgradeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  
  greetingContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  greetingText: {
    fontFamily: 'Boldonse-Regular',
    fontSize: 30,
    color: 'rgb(131, 131, 131)',
  },
  userNameText: {
    fontFamily: 'Boldonse-Regular',
    fontSize: 30,
    color: '#000',
  },
  
  cardWrapper: {
    marginHorizontal: 7,
    marginVertical: 2,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    borderWidth:2,
    backgroundColor: 'rgb(255, 255, 255)',
  },
  card: {
    
   
    borderRadius: 20,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    borderBottomWidth:2,
    height: 350,
  },
  image: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth:2,
    backgroundColor: '#f9f9f9',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  placeholderText: {
    color: '#888',
    fontSize: 18,
  },
  animatedCommentContainer: {
    marginHorizontal: 10,
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    marginHorizontal: 0,
  },
  button: {
    backgroundColor: 'rgb(0, 0, 0)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderColor: 'rgb(108, 108, 108)',
    flex: 0.5,
    borderWidth: 0.5,
    marginLeft: 4,
    marginRight: 4,
    alignItems: 'center',
    width: 300,
    height: 50,
  },
  buttonText: {
    fontSize: 19,
    color: '#FFECB3',
    fontFamily: 'RollingNoOne-ExtraBold',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#C5B358',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dummyIndicator: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  noProfiles: {
    textAlign: 'center',
    color: '#888',
    fontSize: 18,
    marginTop: 50,
  },
  
  // New styles for the added elements
  imageUnderCardContainer: {
    alignItems: 'center',
    marginTop: 40, // Big gap between card and image
   marginBottom: -40,
  },
  instantInfoImage: {
    width: 300,
    height: 300,
  },
  startLikingContainer: {
    alignItems: 'center',
    
  },
  startLikingText: {
    fontFamily: 'Boldonse-Regular',
    fontSize: 48, // Much bigger text
    color: 'rgba(81, 81, 81, 1)',
    textAlign: 'center',
   
  },
  bottomContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    paddingBottom: 50,
  },
  instagramIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instagramIconText: {
    fontSize: 28,
    color: '#fff',
  },
});
export default HomeScreen;