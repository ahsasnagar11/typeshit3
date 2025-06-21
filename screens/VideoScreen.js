import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  ImageBackground,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const carouselData = [
  {
    id: '1',
    title: 'a song',
    image: require('../assets/Screenshot164609.png'),
  },
  {
    id: '2',
    title: 'a show',
    image: require('../assets/Screenshot164826.png'),
  },
  {
    id: '3',
    title: 'or anything',
    image: require('../assets/Screenshot164858.png'),
  },
];

const VideoScreen = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselData.length;
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: nextIndex * width * 0.8, animated: true });
      }
      setCurrentIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (width * 0.8));
    setCurrentIndex(index);
  };

  return (
    <ImageBackground
      source={require('../assets/Happy_Earth-bro.png')}
      style={styles.backgroundImage}
    >
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTextSmall}>DESCRIBE THE</Text>
          <Text style={styles.headerTextLarge}>TYPES#IT</Text>
          <Text style={styles.headerTextSmall1}>THAT YOU ARE ON</Text>
          <Text style={styles.explanationText}>
            Upload the photo of it in the next screen it can be anything a movie that you like a TV show, fav songs, album, book or anything that you are currently like it can be anything but you have to upload a photo of at least one thing.
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {carouselData.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <View style={styles.card}>
                <Text style={styles.movieTitle}>{item.title}</Text>
                <Image source={item.image} style={styles.image} resizeMode="cover" />
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable onPress={() => navigation.navigate("Photos")} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
          <Ionicons name="send" size={20} color="#FFFFFF" style={styles.icon} />
        </Pressable>
      </View>
    </ImageBackground>
  );
};

export default VideoScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    marginTop: 25,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTextSmall: {
    fontSize: 22,
    fontFamily: 'Boldonse-Regular',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 40,
  },
  headerTextSmall1: {
    fontSize: 22,
    fontFamily: 'Boldonse-Regular',
    marginTop: -15,
    textAlign: 'center',
    lineHeight: 40,
  },
  headerTextLarge: {
    fontSize: 65,
    fontFamily: 'Boldonse-Regular',
    marginVertical: 0,
    textAlign: 'center',
    lineHeight: 106,
  },
  explanationText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    color: '#555',
    fontWeight: 'bold',
  },
  carouselContainer: {
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  cardWrapper: {
    width: width * 0.8,
    marginHorizontal: (width * 0.07) / 2,
  },
  card: {
    flex: 1,
    borderColor: '#000',
    borderWidth: 4.5,
    padding: 3.5,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
  movieTitle: {
    fontFamily: 'Boldonse-Regular',
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    borderColor: '#000',
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
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
