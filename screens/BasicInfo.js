import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  ImageBackground,
  ActivityIndicator,
  View,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import Ionicons from 'react-native-vector-icons/Ionicons';

const getStatusBarHeight = () => {
  return Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BasicInfo = () => {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'RollingNoOne-ExtraBold': require('../assets/fonts/RollingNoOne-ExtraBold.ttf'),
    'Boldonse-Regular': require('../assets/fonts/Boldonse-Regular.ttf'),
    'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
    'PassionOne-Regular': require('../assets/fonts/PassionOne-Regular.ttf'),
  });

  // Animated value for drop animation
  const dropAnim = useRef(new Animated.Value(-500)).current;
  // Animated value for opacity fade in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(dropAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dropAnim, fadeAnim]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#900C3F" />;
  }

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="black" 
        translucent={true} 
      />
      <ImageBackground
        source={require('../assets/peakpx1.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
      <SafeAreaView style={styles.overlay}>
        <Animated.View
          style={[
            styles.centerContainer,
            { transform: [{ translateY: dropAnim }], opacity: fadeAnim },
          ]}
        >
          {/* Stars above "WELCOME" */}
          <View style={styles.starContainer}>
            <Ionicons name="star" size={Math.min(40, screenWidth * 0.1)} color="#FFFFFF" style={styles.star} />
            <Ionicons name="star" size={Math.min(60, screenWidth * 0.15)} color="#FFFFFF" style={styles.star} />
            <Ionicons name="star" size={Math.min(40, screenWidth * 0.1)} color="#FFFFFF" style={styles.star} />
          </View>
          <View style={styles.line} />

          <Text style={styles.welcomeText}>WELCOME</Text>
          <Text style={styles.totext}>TO</Text>

          <Text style={styles.appName}>TYPES#IT</Text>
          <View style={styles.line} />
          <Text style={styles.headerText}>
            Similar interests lead to new friends, so tell us—what kind of shit you been on lately?
          </Text>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <Pressable onPress={() => navigation.navigate("Name")} style={styles.button}>
            <Text style={styles.buttonText}>NEXT</Text>
            <Ionicons name="send" size={Math.min(20, screenWidth * 0.05)} color="#FFFFFF" style={styles.icon} />
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
    </>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    paddingTop: Math.max(170, screenHeight * 0.2) + getStatusBarHeight(),
    paddingBottom: Math.max(170, screenHeight * 0.2),
  },
  centerContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Boldonse-Regular',
    fontSize: Math.min(28, screenWidth * 0.07),
    color: '#FFFFFF',
    marginBottom: -5,
  },
  totext: {
    fontFamily: 'Boldonse-Regular',
    fontSize: Math.min(20, screenWidth * 0.05),
    color: '#FFFFFF',
    marginBottom: -10,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  line: {
    height: Math.max(8, screenHeight * 0.01),
    width: '85%',
    backgroundColor: '#FFFFFF',
    marginVertical: 5,
  },
  appName: {
    fontFamily: 'Boldonse-Regular',
    fontSize: Math.min(64, screenWidth * 0.16),
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  headerText: {
    marginTop: 20,
    fontFamily: 'Anton-Regular',
    fontSize: Math.min(26, screenWidth * 0.065),
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Math.max(15, screenHeight * 0.02),
    left: Math.max(20, screenWidth * 0.05),
    right: Math.max(20, screenWidth * 0.05),
    alignItems: 'center',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: Math.min(24, screenWidth * 0.06),
    paddingVertical: Math.max(10, screenHeight * 0.015),
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'RollingNoOne-ExtraBold',
    fontSize: Math.min(18, screenWidth * 0.045),
    marginRight: 8,
  },
  icon: {
    marginTop: 1,
  },
});