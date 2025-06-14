import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import ChatRoom from '../screens/ChatRoom';
import { useNavigation } from '@react-navigation/native';

const UserChat = ({ userId, item }) => {
  const navigation = useNavigation();
  
  // Function to handle pressing on a match to start chatting
  const handleChatPress = () => {
    navigation.navigate('ChatRoom', {
      userId: userId,
      receiverId: item._id,
      receiverName: item.fullName,
      receiverPhoto: item.profilePhotos && item.profilePhotos.length > 0 
        ? item.profilePhotos[0] 
        : null
    });
  };

  // Function to get profile image or placeholder
  const getProfileImage = () => {
    if (item.profilePhotos && item.profilePhotos.length > 0) {
      return { uri: item.profilePhotos[0] };
    }
    
    // Return a placeholder - make sure this exists in your assets folder
    // You may need to adjust this path or use a different approach for placeholders
    return require('../assets/Happy_Earth-bro.png');
  };

  return (
    <TouchableOpacity onPress={handleChatPress} style={styles.container}>
      <View style={styles.leftContent}>
        <Image 
          source={getProfileImage()}
          style={styles.profileImage}
        />
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.introduction} numberOfLines={1}>
          {item.introduction || "No introduction yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default UserChat;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  leftContent: {
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E1E1E1', // Placeholder color
  },
  rightContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  introduction: {
    fontSize: 14,
    color: '#757575',
    opacity: 0.8,
  },
});