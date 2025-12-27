import React, { useEffect, useRef, useState } from 'react';
import { useRoute } from "@react-navigation/native";
import * as Device from 'expo-device';
import {Modal,View,Text,TouchableOpacity,TextInput,StyleSheet,Animated,Dimensions,Alert,} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { Easing } from 'react-native';
import {API} from '../utils/api';

const { height } = Dimensions.get('window');
const deviceUUID = Device.osInternalBuildId || Device.osBuildId || "unknown-device";
const deviceType = Device.osName === "Android" ? "android" : "ios";

/* ================= CONFIG ================= */

 

const OFFICE_LOCATION = {
  latitude: 24.8620456,   // 🔴 Office Latitude
  longitude: 67.0716151,  // 🔴 Office Longitude
};

const OFFICE_RADIUS = 100; // meters

/* ========================================= */

const CheckInOutPopup = ({ visible, onClose }) => {
  const route = useRoute();
const { token, user, avatarimg } = route.params || {};
  const slideAnim = useRef(new Animated.Value(height)).current;

  const [note, setNote] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Slide Animation */
  useEffect(() => {
    slideAnim.stopAnimation();

    if (visible) {
      slideAnim.setValue(height);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 450,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  /* Get GPS Location */
  useEffect(() => {
    if (!visible) return;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, [visible]);

  /* Distance Calculation (Haversine Formula) */
  const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = v => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const isWithinOffice = () => {
    const distance = getDistanceInMeters(
      location.latitude,
      location.longitude,
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude
    );

    return distance <= OFFICE_RADIUS;
  };

  /* ================= API CALLS ================= */

  const handleCheckIn = async () => {
    if (!location) {
      return Alert.alert('Error', 'Location not available');
    }

    if (!isWithinOffice()) {
      return Alert.alert(
        'Outside Office',
        'You must be within office premises to Check In'
      );
    }

    setLoading(true);
    try {
      const res = await axios.post(API('employees/check-in'), {
        check_in_latitude: location.latitude,
        check_in_longitude: location.longitude,
        device_info: 'Workplace App',
        router_bssid: '00:00:00:00:00:00',
        allow_holiday_check_in:1,
        note:'Test by Sajid'
         
      }, { 
        headers: { 
          Authorization: 'Bearer '+token 
          
        }});

      Alert.alert('Success', 'Checked In successfully');
      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Check In failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      return Alert.alert('Error', 'Location not available');
    }

    if (!isWithinOffice()) {
      return Alert.alert(
        'Outside Office',
        'You must be within office premises to Check Out'
      );
    }

    setLoading(true);
    try {
      const res = await axios.post(API('employees/check-out'), {
        check_out_latitude: location.latitude,
        check_out_longitude: location.longitude,
        device_info: 'Workplace App',
        router_bssid: '00:00:00:00:00:00',
        allow_holiday_check_in:1,
        note:'Test by Sajid'
      }, { 
        headers: { 
          Authorization: 'Bearer '+token 
          
        }});

      Alert.alert('Success', 'Checked Out successfully');
      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Check Out failed'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.bg} onPress={onClose} />

        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Check In / Check Out</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Note (Optional)"
            placeholderTextColor="#ccc"
            multiline
            value={note}
            onChangeText={setNote}
            style={styles.input}
          />

          <View style={styles.locationBox}>
            {location ? (
              <>
                <Text style={styles.locationText}>
                  📍 Lat: {location.latitude}
                </Text>
                <Text style={styles.locationText}>
                  📍 Lng: {location.longitude}
                </Text>
              </>
            ) : (
              <Text style={styles.locationText}>Fetching location...</Text>
            )}
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.btn}
              onPress={handleCheckIn}
              disabled={loading}
            >
              <Text style={styles.btnText}>Check In
                {/* {loading ? 'Please wait...' : 'Check In'} */}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btn}
              onPress={handleCheckOut}
              disabled={loading}
            >
              <Text style={styles.btnText}>Check Out
                {/* {loading ? 'Please wait...' : 'Check Out'} */}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CheckInOutPopup;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#0b1b33',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  close: {
    color: '#fff',
    fontSize: 20,
  },
  input: {
    height: 90,
    backgroundColor: '#3b4a6b',
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  locationBox: {
    backgroundColor: '#1f2f4f',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  locationText: {
    color: '#cfe3ff',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    backgroundColor: '#0a6dbb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
