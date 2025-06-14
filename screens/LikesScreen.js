import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import { useFonts } from 'expo-font';
import { Client, Storage } from 'appwrite';
// Add the dummy likes with more detailed data
console.log('🏷️ [ENV] BASE_URL =', BASE_URL);
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
const dummyLikes = [
  {
    userId: {
      _id: "dummyId1",
      fullName: "Alice Smith",
      gender: "Female",
      dateOfBirth: "01/01/1990",
      type: "Straight",
      introduction: "Hi, I'm Alice. I love hiking and photography.",
      profilePhotos: ["https://via.placeholder.com/180"],
    },
    image: "https://via.placeholder.com/250",
    comment: "I really love your smile!",
  },
  {
    userId: {
      _id: "dummyId2",
      fullName: "Bob Johnson",
      gender: "Male",
      dateOfBirth: "05/15/1988",
      type: "Gay",
      introduction: "Hey there, I'm Bob. Coffee addict and dog lover.",
      profilePhotos: ["https://via.placeholder.com/180/0000FF/808080"],
    },
    image: "https://via.placeholder.com/250/0000FF/808080",
    comment: "Your style is amazing!",
  },
  {
    userId: {
      _id: "dummyId3",
      fullName: "Carol Davis",
      gender: "Female",
      dateOfBirth: "03/22/1992",
      type: "Bisexual",
      introduction: "Carol here! I love music festivals and art.",
      profilePhotos: ["https://via.placeholder.com/180/FF0000/FFFFFF"],
    },
    image: "https://via.placeholder.com/250/FF0000/FFFFFF",
    comment: "We should definitely meet up!",
  },
  {
    userId: {
      _id: "dummyId4",
      fullName: "David Wilson",
      gender: "Male",
      dateOfBirth: "11/04/1985",
      type: "Straight",
      introduction: "Hey! I'm David. I enjoy rock climbing and video games.",
      profilePhotos: ["https://via.placeholder.com/180/00FF00/000000"],
    },
    image: "https://via.placeholder.com/250/00FF00/000000",
    comment: "Your profile is intriguing!",
  },
];

const LikesScreen = () => {
   const [fontsLoaded] = useFonts({
      'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
      'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
      'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
      'PassionOne-Regular': require('../assets/fonts/PassionOne-Regular.ttf'),
    });
  
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useDummyData, setUseDummyData] = useState(false); // For testing purposes

  // Get token from AsyncStorage and decode to get userId
  useEffect(() => {
    const fetchToken = async () => {
       async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      console.log('🏥 [HEALTH CHECK] status:', res.status);
      const body = await res.json();
      console.log('🏥 [HEALTH CHECK] body:', body);
    } catch (err) {
      console.error('🏥 [HEALTH CHECK] fetch failed:', err);
    }
  }
  checkHealth();
      
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.userId);
        }
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    };
    fetchToken();
  }, []);

  const fetchReceivedLikes = async () => {
    if (!userId && !useDummyData) return;
    setLoading(true);
    setError(null);
    
    try {
      if (useDummyData) {
        // Use dummy data for testing
        setTimeout(() => {
          setLikes(dummyLikes);
          setLoading(false);
        }, 1000); // Simulate network delay
      } else {
        // Use real API data
        const response = await axios.get(`${API_BASE_URL}/received-likes/${userId}`);
        console.log('Received likes:', response.data.receivedLikes);
        setLikes(response.data.receivedLikes);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching received likes:', err);
      setError('Unable to fetch likes. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId || useDummyData) {
      fetchReceivedLikes();
    }
  }, [userId, useDummyData]);

  useFocusEffect(
    useCallback(() => {
      if (userId || useDummyData) {
        fetchReceivedLikes();
      }
    }, [userId, useDummyData])
  );

  const handlePressLikeCard = (like) => {
    navigation.navigate('LikeHandlingScreen', { 
      like, 
      currentUserId: userId,
      onLikeRemoved: (removedLikeId) => {
        // Filter out the removed like
        setLikes(currentLikes => 
          currentLikes.filter(like => like.userId._id !== removedLikeId)
        );
      }
    });
  };

  // Toggle between real and dummy data (for development)
  const toggleDummyData = () => {
    setUseDummyData(prev => !prev);
  };

  // Function to clear all likes (for testing empty state)
  const clearLikes = () => {
    setLikes([]);
  };
return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headingWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.heading}>Admirers</Text>
            <View style={styles.titleIcon}>
              <Text style={styles.titleIconText}>❤️</Text>
            </View>
          </View>
          <View style={styles.headingAccent} />
        </View>
        {likes.length > 0 && !loading && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>People interested:</Text>
            <Text style={styles.statsNumber}>{likes.length}</Text>
          </View>
        )}
      </View>

      {/* Development Controls */}
      <View style={styles.devSection}>
        <View style={styles.devButtons}>
          <TouchableOpacity 
            style={[styles.devButton, useDummyData && styles.devButtonActive]} 
            onPress={toggleDummyData}
          >
            <Text style={[styles.devButtonText, useDummyData && styles.devButtonTextActive]}>
              {useDummyData ? "Real Data" : "Dummy Data"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.devButtonSecondary} onPress={clearLikes}>
            <Text style={styles.devButtonTextSecondary}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Loading State */}
        {loading && (
          <View style={styles.centerState}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#333" />
              <Text style={styles.loadingText}>Finding your admirers...</Text>
            </View>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.centerState}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorSubText}>Please try again later</Text>
            </View>
          </View>
        )}

        {/* Empty State */}
        {!loading && likes.length === 0 && !error && (
          <View style={styles.centerState}>
            <View style={styles.emptyContainer}>
              <Image 
                source={require('../assets/Texting-bro1.png')} 
                style={styles.emptyImage}
              />
              <Text style={styles.emptyTitle}>No likes yet</Text>
              <Text style={styles.emptySubText}>
                When someone likes your profile, they'll appear here
              </Text>
            </View>
          </View>
        )}

        {/* Cards Grid */}
        {!loading && likes.length > 0 && !error && (
          <View style={styles.cardsSection}>
            <View style={styles.cardsGrid}>
              {likes.map((like, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() => handlePressLikeCard(like)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardImageContainer}>
                    {like.userId?.profilePhotos?.[0] ? (
                      <Image
                        source={{ uri: like.userId.profilePhotos[0] }}
                        style={styles.cardImage}
                      />
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <View style={styles.placeholderIcon}>
                          <Text style={styles.placeholderIconText}>👤</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.cardOverlay} />
                  </View>
                  
                  <View style={styles.cardContent}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {like.userId?.fullName || "Unknown"}
                    </Text>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default LikesScreen;

const { width, height } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 16px padding on each side + 16px gap between cards

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  // Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  headingWrapper: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heading: {
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
    width: 40,
    height: 3,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  statsNumber: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '700',
    marginLeft: 4,
  },

  // Development Section
  devSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  devButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  devButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  devButtonActive: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
  devButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  devButtonTextActive: {
    color: '#FFFFFF',
  },
  devButtonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  devButtonTextSecondary: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
  },

  // Content Styles
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // State Styles
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: height * 0.6,
  },
  
  // Loading State
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  emptyImage: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: -30,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 0,
    letterSpacing: -0.3,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Cards Section
  cardsSection: {
    flex: 1,
    paddingTop: 20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },

  // Card Styles
  card: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 16,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: cardWidth * 1.2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIconText: {
    fontSize: 28,
    color: '#999999',
  },

  // Card Content
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  newBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});