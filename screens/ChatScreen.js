import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image, Dimensions, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import 'core-js/stable/atob';
import { useFocusEffect } from '@react-navigation/native';
import UserChat from '../components/UserChat';
import { useFonts } from 'expo-font';
import { BASE_URL } from '@env';
console.log('🏷️ [ENV] BASE_URL =', BASE_URL);
console.log('🏷️ [ENV] BASE_URL =', BASE_URL);

const API_BASE_URL = BASE_URL;
const ChatScreen = () => {
  const [fontsLoaded] = useFonts({
    'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
    'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
    'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
    'PassionOne-Regular': require('../assets/fonts/PassionOne-Regular.ttf'),
  });
  
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user ID from token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.userId);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Failed to authenticate user. Please log in again.');
      }
    };

    fetchUser();
  }, []);

  // Function to fetch matches
  const fetchMatches = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-matches/${userId}`
      );
      
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Could not load your matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch matches when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchMatches();
    }
  }, [userId, fetchMatches]);

  // Fetch matches when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchMatches();
      }
      setMatches([
        { _id: '1', name: 'Alice', lastMessage: 'Hey, how are you?', profilePic: 'https://via.placeholder.com/150' },
        { _id: '2', name: 'Bob', lastMessage: 'Looking forward to our chat!', profilePic: 'https://via.placeholder.com/150' },
      ]);
    }, [userId, fetchMatches])
  );

  // Function to render matches or appropriate message
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333" />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centerState}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>💬</Text>
            <Text style={styles.errorText}>Connection Issue</Text>
            <Text style={styles.errorSubText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchMatches}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    if (matches.length === 0) {
      return (
        <View style={styles.centerState}>
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../assets/Texting-bro1.png')} 
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubText}>
              Start connecting with people to begin your first conversation
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.matchesSection}>
        <View style={styles.matchesContainer}>
          {matches.map((item) => (
            <UserChat key={item._id} userId={userId} item={item} />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headingWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Messages</Text>
            <View style={styles.titleIcon}>
              <Text style={styles.titleIconText}>💬</Text>
            </View>
          </View>
          <View style={styles.headingAccent} />
        </View>
        {matches.length > 0 && !loading && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Active chats:</Text>
            <Text style={styles.statsNumber}>{matches.length}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default ChatScreen;

const { width, height } = Dimensions.get('window');

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
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
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

  // Content Styles
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Matches Section
  matchesSection: {
    flex: 1,
    paddingTop: 16,
  },
  matchesContainer: {
    paddingHorizontal: 16,
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
    maxWidth: width * 0.85,
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
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  emptyImage: {
    width: width * 0.6,
    height: width * 0.4,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});