import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';

const LocationScreen = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 13.0451,
    longitude: 77.6269,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [location, setLocation] = useState('');
  const [coordinates] = useState([
    { latitude: 12.9716, longitude: 77.5946 },
    { latitude: 13.0451, longitude: 77.6269 },
  ]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      setRegion({ ...region, latitude, longitude });
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_API_KEY`
      )
        .then(response => response.json())
        .then(data => {
          if (data.results.length > 0) {
            setLocation(data.results[0].formatted_address);
          }
        })
        .catch(error => console.error('Error fetching location:', error));
    })();
  }, []);

  const handleMarkerDragEnd = (coordinate) => {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=YOUR_GOOGLE_API_KEY`
    )
      .then(response => response.json())
      .then(data => {
        if (data.results.length > 0) {
          setLocation(data.results[0].formatted_address);
        }
      })
      .catch(error => console.error('Error fetching location:', error));
  };

  const handleNext = () => {
    saveRegistrationProgress('Location', { location });
    console.log('Saved location:', location);
    navigation.navigate('Gender');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Enter your location:</Text>
        <View style={styles.mapWrapper}>
          <MapView initialRegion={region} style={styles.map} provider={MapView.PROVIDER_GOOGLE}>
            <Marker
              draggable
              coordinate={coordinates[1]}
              onDragEnd={(e) => handleMarkerDragEnd(e.nativeEvent.coordinate)}
            >
              <View style={styles.marker}>
                <Text style={styles.markerText}>{location}</Text>
              </View>
            </Marker>
          </MapView>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleNext} style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>NEXT</Text>
            <MaterialCommunityIcons name="send" size={20} color="#Fff" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 90,
  },
  heading: {
    fontSize: 25,
    fontFamily: 'Boldonse-Regular',
    marginTop: 15,
    marginLeft: 5,
  },
  mapWrapper: {
    marginTop: 20,
    borderWidth: 5,
    borderColor: 'black',
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 500,
  },
  marker: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 20,
  },
  markerText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
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
