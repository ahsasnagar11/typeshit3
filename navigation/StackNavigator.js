import React, { useContext } from 'react';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import LikesScreen from '../screens/LikesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VideoScreen from'../screens/VideoScreen';
import ChatRoom from '../screens/ChatRoom';
import LikeHandlingScreen from '../screens/LikeHandlingScreen';
// Registration flow screens
import BasicInfo from '../screens/BasicInfo';
import NameScreen from '../screens/NameScreen';
import PhotoScreen from '../screens/PhotoScreen';
import ProfilePhotoScreen from '../screens/ProfilePhotoScreen';
import BirthScreen from '../screens/BirthScreen';
import LocationScreen from '../screens/LocationScreen';
import GenderScreen from '../screens/GenderScreen';
import PreFinalScreen from '../screens/PreFinalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Choose icon based on route name
        let iconName;
        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'Likes') {
          iconName = isFocused ? 'heart' : 'heart-outline';
        } else if (route.name === 'Chat') {
          iconName = isFocused ? 'chatbox' : 'chatbox-outline';
        } else if (route.name === 'Profile') {
          iconName = isFocused ? 'person' : 'person-outline';
        }

        // Update: Use the RGBA color for the icons
        const iconColor = '#000';

        // If focused, render a bigger circle behind the icon
        if (isFocused) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={styles.bigCircle}>
                <Ionicons name={iconName} size={34} color={iconColor} />
              </View>
            </TouchableOpacity>
          );
        } else {
          // Unfocused state: just the icon
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons name={iconName} size={28} color={iconColor} />
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Likes" component={LikesScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function StackNavigator() {
  const { token, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="rgb(16, 17, 16)" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // Authenticated flow
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen name="LikeHandlingScreen" component={LikeHandlingScreen}/>
            <Stack.Screen name="ChatRoom" component={ChatRoom} />
          </>
        ) : (
          // Registration/authentication flow
          <>
            <Stack.Screen name="Basic" component={BasicInfo} />
            <Stack.Screen name="Name" component={NameScreen} />
            <Stack.Screen name="Photos" component={PhotoScreen} />
            <Stack.Screen name="Birth" component={BirthScreen} />
            <Stack.Screen name="Location" component={LocationScreen} />
            <Stack.Screen name="Gender" component={GenderScreen} />
            <Stack.Screen name="Video" component={VideoScreen}/>
            <Stack.Screen name="ProfilePhotoScreen" component={ProfilePhotoScreen} />
            <Stack.Screen name="PreFinalScreen" component={PreFinalScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = {
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff', // Very light pink for navbar
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
    overflow: 'visible',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCircle: {
    position: 'absolute',
    top: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
};
