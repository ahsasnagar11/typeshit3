import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_BUCKET_ID,
    APPWRITE_API_KEY,
    BASE_URL,
} from '@env';

const API_BASE_URL = BASE_URL;

// Send Icon Component
const SendIcon = ({ color = '#fff', size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: size * 0.8, fontWeight: 'bold' }}>➤</Text>
  </View>
);

// Back Arrow Icon Component
const BackIcon = ({ color = '#333', size = 24 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: size * 0.8, fontWeight: 'bold' }}>←</Text>
  </View>
);

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { userId, receiverId, receiverName } = route?.params || {};
  const scrollViewRef = useRef();
  const pollingIntervalRef = useRef(null);
  const isComponentMountedRef = useRef(true);

  // Retrieve user ID on component mount
  useEffect(() => {
    const retrieveUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setCurrentUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error retrieving user ID:', error);
      }
    };
    retrieveUserId();
  }, []);

  // Fetch messages from server
  const fetchMessages = useCallback(async (silent = false) => {
    if (!isComponentMountedRef.current) return;
    
    try {
      const userIdToUse = currentUserId || userId;
      if (!userIdToUse || !receiverId) {
        if (!silent) console.log('Missing userIds for fetching messages');
        return;
      }

      if (!silent) console.log(`Fetching messages between ${userIdToUse} and ${receiverId}`);
      
      const response = await axios.get(`${API_BASE_URL}/messages`, {
        params: { 
          senderId: userIdToUse, 
          receiverId: receiverId
        },
        timeout: 8000,
      });
      
      if (!isComponentMountedRef.current) return;
      
      const fetchedMessages = response.data || [];
      if (!silent) console.log(`Fetched ${fetchedMessages.length} messages from server`);
      
      // Update messages and track the latest timestamp
      setMessages(prevMessages => {
        const newMessages = fetchedMessages.filter(msg => 
          !prevMessages.some(prevMsg => 
            prevMsg._id === msg._id || 
            (prevMsg.timestamp === msg.timestamp && 
             prevMsg.message === msg.message && 
             prevMsg.senderId === msg.senderId)
          )
        );
        
        if (newMessages.length > 0) {
          // New messages arrived, scroll to bottom
          setTimeout(() => {
            if (isComponentMountedRef.current) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }, 100);
        }
        
        return fetchedMessages;
      });
      
      // Update last message timestamp
      if (fetchedMessages.length > 0) {
        const latestMessage = fetchedMessages[fetchedMessages.length - 1];
        setLastMessageTime(latestMessage.timestamp);
      }
      
    } catch (error) {
      if (!silent) console.error('Error fetching messages:', error);
    }
  }, [currentUserId, userId, receiverId]);

  // Start polling for new messages
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current || !isComponentMountedRef.current) return;
    
    console.log('📡 Starting message polling');
    
    pollingIntervalRef.current = setInterval(() => {
      if (isComponentMountedRef.current) {
        fetchMessages(true); // Silent fetch
      }
    }, 2000); // Poll every 2 seconds
  }, [fetchMessages]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('⏹️ Stopped message polling');
    }
  }, []);

  // Initialize messages and start polling
  useEffect(() => {
    const userIdToUse = currentUserId || userId;
    if (!userIdToUse) return;

    // Fetch initial messages
    fetchMessages();
    
    // Start polling for new messages
    startPolling();

    return () => {
      stopPolling();
    };
  }, [currentUserId, userId, receiverId, fetchMessages, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  // Send message function
  const sendMessage = async () => {
    if (message.trim() === '') return;

    const userIdToUse = currentUserId || userId;
    if (!userIdToUse || !receiverId) {
      Alert.alert('Error', 'Missing user information');
      return;
    }

    const messageData = {
      senderId: userIdToUse,
      receiverId: receiverId,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log('📤 Sending message:', messageData);

    // Clear input and add optimistic update
    setMessage('');
    const tempId = 'temp-' + Date.now();
    setMessages(prev => [...prev, { ...messageData, _id: tempId }]);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      await axios.post(`${API_BASE_URL}/chats`, messageData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('✅ Message saved via REST API');
      
      // Remove temp message and refetch to get the real message with ID
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      
      // Fetch messages after a short delay to get the saved message
      setTimeout(() => {
        fetchMessages(true);
      }, 500);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Remove failed message and restore input
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setMessage(messageData.message);
      
      Alert.alert('Error', 'Could not send message. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Bigger Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={8}
        >
          <BackIcon />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{receiverName || 'Chat'}</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <View style={styles.headerRight}>
          {/* You can add more icons here like video call, phone call etc */}
        </View>
      </View>

      {/* Messages Container */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === (currentUserId || userId);
          
          return (
            <View
              key={msg._id || `msg-${index}`}
              style={[
                styles.messageRow,
                isCurrentUser ? styles.currentUserRow : styles.otherUserRow,
              ]}
            >
              <View
                style={[
                  styles.messageContainer,
                  isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
                ]}
              >
                <Text 
                  style={[
                    styles.messageText,
                    isCurrentUser ? styles.currentUserText : styles.otherUserText
                  ]}
                >
                  {msg.message}
                </Text>
                <Text 
                  style={[
                    styles.messageTime,
                    isCurrentUser ? styles.currentUserTime : styles.otherUserTime
                  ]}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Modern Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <Pressable 
            style={[
              styles.sendButton,
              message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]} 
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <SendIcon color={message.trim() ? '#fff' : '#999'} size={18} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24, // Increased from 12
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // Increased padding top
    minHeight: Platform.OS === 'ios' ? 100 : 80, // Added minimum height
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20, // Increased from 18
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14, // Increased from 12
    color: '#666',
    marginTop: 4, // Increased from 2
  },
  headerRight: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContentContainer: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  currentUserRow: {
    justifyContent: 'flex-end',
  },
  otherUserRow: {
    justifyContent: 'flex-start',
  },
  messageContainer: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 2,
  },
  currentUserMessage: {
    backgroundColor: '#4a4a4a', // Dark grey
    borderBottomRightRadius: 6,
  },
  otherUserMessage: {
    backgroundColor: '#e8e8e8', // Light grey
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    minHeight: 20,
    color: '#333',
    paddingVertical: 6,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#4a4a4a', // Dark grey to match message bubbles
  },
  sendButtonInactive: {
    backgroundColor: '#e0e0e0',
  },
});

export default ChatRoom;